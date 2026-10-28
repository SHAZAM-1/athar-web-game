#!/usr/bin/env node
/**
 * Merge the latest Cloudflare Doctor findings into a durable, append-only-ish
 * incident journal. Same incident fingerprints update lastSeen/count; evidence
 * and firstSeen are retained. This script records incidents, never fixes them.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const REPORT = path.join(ROOT, 'cloudflare-doctor-report.json');
const HISTORY = path.join(ROOT, 'tools/project-doctor/cloudflare-incident-history.json');
const now = new Date().toISOString();

function fingerprint(item) {
  const evidence = item.evidence || {};
  return [item.code || 'unknown', item.deploymentId || '', item.url || '', evidence.line || evidence.error || ''].join('|');
}

function main() {
  if (!fs.existsSync(REPORT)) throw new Error('Cloudflare Doctor report is missing: ' + REPORT);
  const report = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
  const history = fs.existsSync(HISTORY)
    ? JSON.parse(fs.readFileSync(HISTORY, 'utf8'))
    : { schemaVersion: 1, project: 'Athar', source: 'Athar Cloudflare Doctor', incidents: [] };
  if (!Array.isArray(history.incidents)) throw new Error('Incident history is malformed: incidents must be an array.');
  const byFingerprint = new Map(history.incidents.map(item => [item.fingerprint, item]));
  let added = 0;
  let updated = 0;

  // Close historical alerts that the current read-only inspection has now
  // verified as expected behavior. Keep the records and evidence for audit.
  const expectedSkippedIds = new Set((report.checks || [])
    .filter(check => check.expectedSkip && check.deploymentId)
    .map(check => check.deploymentId));
  const currentDeploymentIds = new Set((report.recentDeployments || [])
    .filter(deployment => deployment.id)
    .map(deployment => deployment.id));
  const currentIncidentDeploymentIds = new Set((report.incidents || [])
    .filter(item => item.deploymentId)
    .map(item => item.deploymentId));

  for (const prior of history.incidents) {
    if (prior.code === 'deployment-skipped' && expectedSkippedIds.has(prior.deploymentId)) {
      prior.status = 'resolved-expected';
      prior.resolution = 'Cloudflare confirmed this was an intentional [skip ci] commit or a path_config skip for tooling/docs-only changes.';
      prior.resolvedAt = report.checkedAt || now;
    }
    if (prior.code === 'deployment-in-progress' && prior.deploymentId && expectedSkippedIds.has(prior.deploymentId)) {
      prior.status = 'resolved-expected';
      prior.resolution = 'The deployment was skipped intentionally; an idle queued stage is expected for skipped deployments.';
      prior.resolvedAt = report.checkedAt || now;
    }
    if (prior.code === 'cloudflare-doctor-api-failed' && report.status !== 'error') {
      prior.status = 'resolved-observed';
      prior.resolution = 'A later Cloudflare Doctor inspection completed successfully; historical failure evidence retained.';
      prior.resolvedAt = report.checkedAt || now;
    }

    // A deployment skip that has aged out of the current Cloudflare history
    // window is no longer an active triage item, but absence is not proof that
    // the old skip was intentional. Archive it without falsely marking it fixed.
    if (
      prior.code === 'deployment-skipped' &&
      prior.status === 'open-unverified' &&
      prior.deploymentId &&
      report.status === 'healthy' &&
      !currentDeploymentIds.has(prior.deploymentId) &&
      !currentIncidentDeploymentIds.has(prior.deploymentId)
    ) {
      prior.status = 'historical-unverified';
      prior.resolution = 'Archived from active triage because this deployment is outside the current Cloudflare history window and is not present in current findings. This does not prove the historical skip was intentional.';
      prior.archivedAt = report.checkedAt || now;
    }
  }

  for (const item of report.incidents || []) {
    const key = fingerprint(item);
    const prior = byFingerprint.get(key);
    if (prior) {
      prior.lastSeen = now;
      prior.lastObservedStatus = report.status;
      prior.occurrenceCount = (prior.occurrenceCount || 1) + 1;
      prior.latestEvidence = item.evidence || prior.latestEvidence;
      prior.latestNextStep = item.nextStep || prior.latestNextStep;
      prior.latestSeverity = item.severity || prior.latestSeverity;
      prior.latestReportCheckedAt = report.checkedAt;
      updated++;
    } else {
      const record = {
        fingerprint: key,
        code: item.code || 'unknown',
        title: item.title || 'Unclassified Cloudflare incident',
        severity: item.severity || 'unknown',
        rootCause: item.rootCause || 'Not yet verified; preserve evidence and reproduce.',
        firstSeen: report.checkedAt || now,
        lastSeen: now,
        occurrenceCount: 1,
        status: 'open-unverified',
        source: 'cloudflare-pages',
        deploymentId: item.deploymentId || null,
        url: item.url || null,
        firstEvidence: item.evidence || null,
        latestEvidence: item.evidence || null,
        nextStep: item.nextStep || 'Inspect the full Cloudflare deployment logs and verify the root cause.',
        latestNextStep: item.nextStep || null,
        latestReportCheckedAt: report.checkedAt,
        lastObservedStatus: report.status
      };
      history.incidents.push(record);
      byFingerprint.set(key, record);
      added++;
    }
  }
  history.updatedAt = now;
  history.latestCloudflareStatus = report.status || 'unknown';
  history.latestReportCheckedAt = report.checkedAt || now;
  history.latestDeploymentId = report.latestDeployment?.id || null;
  history.latestLiveUrl = report.liveUrl || null;
  history.totalIncidentFingerprints = history.incidents.length;
  // Bound growth while keeping recent and high-severity evidence. Older records
  // are not discarded until the journal exceeds 1,500 distinct fingerprints.
  if (history.incidents.length > 1500) {
    history.incidents.sort((a, b) => {
      const severity = value => value === 'critical' ? 4 : value === 'high' ? 3 : value === 'medium' ? 2 : 1;
      return severity(b.latestSeverity || b.severity) - severity(a.latestSeverity || a.severity) || String(b.lastSeen).localeCompare(String(a.lastSeen));
    });
    history.incidents = history.incidents.slice(0, 1500);
    history.totalIncidentFingerprints = history.incidents.length;
  }
  fs.writeFileSync(HISTORY, JSON.stringify(history, null, 2) + '\n');
  console.log('Cloudflare incident history saved: ' + added + ' new, ' + updated + ' recurring observations, ' + history.incidents.length + ' unique records.');
}

main();
