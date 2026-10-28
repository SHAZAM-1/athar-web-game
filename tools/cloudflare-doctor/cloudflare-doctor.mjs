#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const REPORT_PATH = path.join(ROOT, 'cloudflare-doctor-report.json');
const SUMMARY_PATH = path.join(ROOT, 'cloudflare-doctor-summary.md');
const API = 'https://api.cloudflare.com/client/v4';
const token = process.env.CLOUDFLARE_API_TOKEN;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const projectName = process.env.CLOUDFLARE_PAGES_PROJECT || 'athar-web-game';
const stamp = () => new Date().toISOString();

function incident(code, severity, title, rootCause, evidence, nextStep, extra = {}) {
  return { id: code + ':' + (extra.deploymentId || extra.url || projectName), code, severity, title, rootCause, evidence, nextStep, ...extra };
}

function classifyLog(line) {
  const text = String(line || '').toLowerCase();
  if (text.includes('edgesout') || text.includes("cannot read properties of null (reading 'edgesout')")) return {
    code: 'npm-edgesout', severity: 'high', title: 'npm dependency graph construction crash',
    rootCause: 'Cloudflare logs show npm crashing while constructing its dependency graph. This is an installer/dependency-resolution failure; it does not by itself prove a game-code defect.',
    nextStep: 'Preserve the full log, compare Node/npm versions, reproduce a clean install, then consider a lockfile or compatible npm mitigation.'
  };
  if (/npm error code e401|e403|unauthorized|authentication required/.test(text)) return {
    code: 'npm-registry-auth', severity: 'high', title: 'Package registry authentication failed',
    rootCause: 'The build could not authenticate to a package registry.',
    nextStep: 'Check registry configuration and required secrets; never print tokens into logs.'
  };
  if (/npm error code e404|404 not found/.test(text)) return {
    code: 'npm-package-not-found', severity: 'high', title: 'Package or registry resource not found',
    rootCause: 'A requested package/version or registry resource was not found.',
    nextStep: 'Verify package names, versions, registry URL, and lockfile integrity.'
  };
  if (/eai_again|enotfound|etimedout|econnreset|network timeout/.test(text)) return {
    code: 'build-network', severity: 'medium', title: 'Build network or registry failure',
    rootCause: 'The build log contains a DNS, connection, or network timeout signature.',
    nextStep: 'Check build environment and registry availability; preserve the failed log before retrying.'
  };
  if (/ts\d{3,5}: error|typescript.*error|type error/.test(text)) return {
    code: 'build-typescript', severity: 'high', title: 'TypeScript compilation failed',
    rootCause: 'The production build emitted a TypeScript compiler diagnostic.',
    nextStep: 'Fix the first actionable compiler diagnostic; do not disable type checking.'
  };
  if (/failed to resolve import|could not resolve|vite.*error/.test(text)) return {
    code: 'build-bundler', severity: 'high', title: 'Vite build or module resolution failed',
    rootCause: 'The bundler could not resolve or compile part of the application.',
    nextStep: 'Verify import paths, case sensitivity, dependencies, and Vite output.'
  };
  if (/success: your site was deployed|success: assets published/.test(text)) return null;
  if (/error|failed|failure|fatal/.test(text)) return {
    code: 'build-unclassified', severity: 'medium', title: 'Unclassified Cloudflare build/deploy error',
    rootCause: 'The log contains a failure signature not yet mapped to a verified incident pattern.',
    nextStep: 'Preserve timestamped logs and reproduce before recording a confirmed root cause.'
  };
  return null;
}

async function requestJson(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, { headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' }, signal: AbortSignal.timeout(20000) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || body.success === false) {
        const message = (body.errors || []).map(e => e.message || e.code).join('; ') || response.statusText;
        const error = new Error('Cloudflare API ' + response.status + ': ' + message);
        error.status = response.status;
        if (response.status < 500 && response.status !== 429) throw error;
        lastError = error;
      } else return body;
    } catch (error) {
      lastError = error;
      if (error.status && error.status < 500 && error.status !== 429) break;
    }
    if (attempt < attempts) await new Promise(resolve => setTimeout(resolve, 500 * (2 ** (attempt - 1))));
  }
  throw lastError || new Error('Cloudflare API request failed');
}

async function get(endpoint) {
  return (await requestJson(API + endpoint)).result;
}

async function inspectLive(url, incidents, checks) {
  if (!url) return;
  try {
    const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
    const html = await response.text();
    checks.push({ name: 'live homepage', url, ok: response.ok, status: response.status });
    if (!response.ok) incidents.push(incident('live-http-status', 'high', 'Live homepage returned non-success HTTP status', 'Published Pages URL returned HTTP ' + response.status + '.', { url, status: response.status }, 'Inspect deployment status and Pages routing.', { url }));
    if (response.ok && !/assets\/index-[^"']+\.js/i.test(html) && !/3d-prototype\/main\.js/i.test(html)) incidents.push(incident('live-entry-missing', 'high', 'Published HTML has no recognizable Athar JavaScript entry', 'Homepage returned HTML but no expected Vite bundle or development entry marker was found.', { url, htmlStart: html.slice(0, 500) }, 'Check build output directory and deployed repository branch.', { url }));
    const assets = [...html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css)(?:\?[^"']*)?)["']/gi)].map(m => m[1]).filter(p => !/^https?:\/\//i.test(p));
    for (const asset of [...new Set(assets)].slice(0, 8)) {
      const assetUrl = new URL(asset, response.url || url).toString();
      try {
        const check = await fetch(assetUrl, { redirect: 'follow', signal: AbortSignal.timeout(10000) });
        checks.push({ name: 'live asset', url: assetUrl, ok: check.ok, status: check.status });
        if (!check.ok) incidents.push(incident('live-asset-failed', 'high', 'Referenced JavaScript/CSS asset failed to load', 'Published HTML references an asset returning HTTP ' + check.status + '.', { assetUrl, status: check.status }, 'Check Vite base paths and Pages output directory.', { url: assetUrl }));
      } catch (error) {
        incidents.push(incident('live-asset-probe-failed', 'medium', 'Referenced asset could not be checked', error.message, { assetUrl }, 'Repeat the probe and verify asset availability.', { url: assetUrl }));
      }
    }
  } catch (error) {
    checks.push({ name: 'live homepage', url, ok: false, error: error.message });
    incidents.push(incident('live-probe-failed', 'high', 'Cloudflare Pages live URL could not be reached', 'HTTP probe failed before a valid homepage response.', { url, error: error.message }, 'Check deployment, DNS, Pages availability, then repeat the probe.', { url }));
  }
}

function markdown(report) {
  const lines = [
    '# Athar Cloudflare Doctor', '',
    '- Checked: ' + report.checkedAt,
    '- Project: ' + report.projectName,
    '- Status: **' + report.status.toUpperCase() + '**',
    '- Incidents: **' + report.incidents.length + '**',
    '- Latest deployment: ' + (report.latestDeployment?.id || 'none'),
    '- Live URL: ' + (report.liveUrl || 'not available'), '',
    'Read-only diagnostics: no Cloudflare settings or code are modified.', ''
  ];
  for (const i of report.incidents) lines.push(
    '## [' + i.severity.toUpperCase() + '] ' + i.title,
    '- Code: ' + i.code,
    '- Root cause: ' + i.rootCause,
    '- Evidence: ' + JSON.stringify(i.evidence).slice(0, 700),
    '- Next step: ' + i.nextStep, ''
  );
  if (!report.incidents.length) lines.push('No incident was detected by the configured checks.', '');
  lines.push('## Checks', '');
  for (const c of report.checks) lines.push('- ' + (c.ok ? 'PASS' : 'FAIL') + ' — ' + c.name + (c.status ? ' (' + c.status + ')' : '') + (c.url ? ' — ' + c.url : '') + (c.error ? ' — ' + c.error : ''));
  return lines.join('\n') + '\n';
}

async function main() {
  if (process.argv.includes('--self-test')) {
    const cases = [
      ["npm ERR! Cannot read properties of null (reading 'edgesOut')", 'npm-edgesout'],
      ['TS2345: error: Argument type mismatch', 'build-typescript'],
      ['Error: Failed to resolve import', 'build-bundler'],
      ['Success: Your site was deployed!', null]
    ];
    for (const [sample, expected] of cases) {
      const actual = classifyLog(sample)?.code || null;
      if (actual !== expected) throw new Error('Classifier expected ' + expected + ', got ' + actual);
    }
    console.log('Cloudflare Doctor self-test passed (' + cases.length + ' signatures).');
    return;
  }

  const report = {
    agent: 'Athar Cloudflare Doctor', schemaVersion: 1, checkedAt: stamp(), projectName,
    status: 'unknown', project: null, latestDeployment: null, recentDeployments: [],
    liveUrl: null, checks: [], incidents: [],
    projectDoctorHandoff: { source: 'cloudflare-doctor', schemaVersion: 1, incidents: [] }
  };

  try {
    if (!token || !accountId) throw new Error(!token ? 'Missing CLOUDFLARE_API_TOKEN. Add it as a GitHub Actions repository secret.' : 'Missing CLOUDFLARE_ACCOUNT_ID. Configure the account identifier in the workflow environment.');
    const base = '/accounts/' + encodeURIComponent(accountId) + '/pages/projects/' + encodeURIComponent(projectName);
    const project = await get(base);
    report.project = {
      id: project.id, name: project.name, subdomain: project.subdomain, domains: project.domains || [],
      productionBranch: project.production_branch, buildConfig: project.build_config || {}, source: project.source || {}
    };
    report.checks.push({ name: 'Pages project exists', ok: Boolean(project.id) });
    report.checks.push({ name: 'GitHub source configured', ok: project.source?.type === 'github' && Boolean(project.source?.config?.repo_name) });
    if (project.source?.type !== 'github') report.incidents.push(incident('source-not-github', 'high', 'Pages project is not connected to GitHub', 'Cloudflare source type is ' + (project.source?.type || 'missing') + '.', project.source || {}, 'Verify the intended source repository.'));
    if (project.source?.config?.repo_name && (project.source.config.owner !== 'SHAZAM-1' || project.source.config.repo_name !== 'athar-web-game')) report.incidents.push(incident('source-repository-mismatch', 'critical', 'Pages is connected to a different repository', 'Expected SHAZAM-1/athar-web-game but Cloudflare reports ' + project.source.config.owner + '/' + project.source.config.repo_name + '.', project.source.config, 'Confirm the intended repository before changing deployment settings.'));
    if (project.production_branch !== 'dev/athar-full-project') report.incidents.push(incident('production-branch-mismatch', 'high', 'Production branch mismatch', 'Expected dev/athar-full-project but found ' + project.production_branch + '.', { actual: project.production_branch }, 'Review the intended production branch.'));
    if (project.build_config?.build_command !== 'npm run build') report.incidents.push(incident('build-command-mismatch', 'high', 'Cloudflare build command mismatch', 'Expected npm run build but found ' + (project.build_config?.build_command || 'empty') + '.', project.build_config, 'Align the Pages build command with package.json.'));
    if (project.build_config?.destination_dir !== 'dist') report.incidents.push(incident('output-directory-mismatch', 'high', 'Cloudflare output directory mismatch', 'Expected dist but found ' + (project.build_config?.destination_dir || 'empty') + '.', project.build_config, 'Align Pages output directory with Vite output.'));
    report.latestDeployment = project.latest_deployment || null;
    report.liveUrl = project.subdomain ? 'https://' + project.subdomain : (project.latest_deployment?.url || null);

    const listed = await get(base + '/deployments?per_page=20');
    report.recentDeployments = (Array.isArray(listed) ? listed : []).slice(0, 20).map(d => ({
      id: d.id, url: d.url, createdOn: d.created_on, environment: d.environment,
      latestStage: d.latest_stage, stages: d.stages || [],
      branch: d.deployment_trigger?.metadata?.branch || d.source?.config?.production_branch || null,
      commitHash: d.deployment_trigger?.metadata?.commit_hash || null,
      commitMessage: d.deployment_trigger?.metadata?.commit_message || null,
      skipped: Boolean(d.is_skipped), skipReason: d.skip_reason || null
    }));

    const candidates = report.recentDeployments.filter((d, index) => index < 3 || d.latestStage?.status === 'failure' || d.stages?.some(s => s.status === 'failure') || d.skipped).slice(0, 10);
    for (const d of candidates) {
      const stages = d.stages || [];
      for (const s of stages) if (s.status === 'failure') report.incidents.push(incident('deployment-stage-failed', 'high', 'Deployment stage failed: ' + s.name, 'Cloudflare reports stage ' + s.name + ' as failed.', { deploymentId: d.id, stage: s }, 'Inspect the build log and route the earliest actionable failure to Project Doctor.', { deploymentId: d.id, stageName: s.name }));
      if (d.skipped) {
        // Cloudflare intentionally skips commits marked [skip ci]. This is not a
        // failed deployment and must not make the Pages health status noisy.
        if (d.skipReason === 'commit_message' && /\[(skip ci|ci skip|no ci)\]/i.test(d.commitMessage || '')) {
          report.checks.push({ name: 'expected skipped deployment', ok: true, expectedSkip: true, deploymentId: d.id, status: d.skipReason, commitHash: d.commitHash, detail: 'Commit explicitly requested CI/deployment skip.' });
        } else if (d.skipReason === 'path_config' && d.commitHash) {
          // Verify whether the commit only touched tooling/docs. A path-filter
          // skip is expected for non-app changes; app changes remain incidents.
          try {
            const response = await fetch('https://api.github.com/repos/SHAZAM-1/athar-web-game/commits/' + encodeURIComponent(d.commitHash), {
              headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
              signal: AbortSignal.timeout(10000)
            });
            if (!response.ok) throw new Error('GitHub commit lookup returned HTTP ' + response.status);
            const commit = await response.json();
            const files = (commit.files || []).map(file => file.filename || '');
            const appPath = /^(index\.html|src\/|3d-prototype\/|public\/|package\.json|package-lock\.json|vite\.config\.|tsconfig|\.npmrc$|\.nvmrc$)/i;
            const appChanged = files.some(file => appPath.test(file));
            if (files.length && !appChanged) {
              report.checks.push({ name: 'expected path-filter skip', ok: true, expectedSkip: true, deploymentId: d.id, status: d.skipReason, commitHash: d.commitHash, changedFiles: files, detail: 'Commit changed tooling/docs only; no deployable app paths were changed.' });
            } else {
              report.incidents.push(incident('deployment-skipped', 'medium', 'A Git-triggered deployment was skipped despite application changes', 'Cloudflare skipped this deployment (path_config) and the commit changes deployable application paths or its changed files could not be verified.', { deploymentId: d.id, skipReason: d.skipReason, branch: d.branch, commitHash: d.commitHash, changedFiles: files }, 'Review Cloudflare Pages build path filters and ensure app paths are included.', { deploymentId: d.id }));
            }
          } catch (error) {
            report.incidents.push(incident('deployment-skipped', 'medium', 'A Git-triggered deployment was skipped and could not be verified', 'Cloudflare skipped this deployment (path_config); changed files could not be verified: ' + error.message, { deploymentId: d.id, skipReason: d.skipReason, branch: d.branch, commitHash: d.commitHash }, 'Review Pages path filters and verify the commit file list.', { deploymentId: d.id }));
          }
        } else {
          report.incidents.push(incident('deployment-skipped', 'medium', 'A Git-triggered deployment was skipped', 'Cloudflare skipped this deployment' + (d.skipReason ? ' (' + d.skipReason + ')' : '') + '.', { deploymentId: d.id, skipReason: d.skipReason, branch: d.branch, commitHash: d.commitHash, commitMessage: d.commitMessage }, 'Check Pages path filters and changed-file matching.', { deploymentId: d.id }));
        }
      }
      if (stages.some(s => s.status === 'failure') || d.id === report.latestDeployment?.id) {
        try {
          const logs = await get(base + '/deployments/' + encodeURIComponent(d.id) + '/history/logs');
          for (const entry of logs?.data || []) {
            const diagnosis = classifyLog(entry.line);
            if (diagnosis) report.incidents.push(incident(diagnosis.code, diagnosis.severity, diagnosis.title, diagnosis.rootCause, { deploymentId: d.id, timestamp: entry.ts, line: String(entry.line).slice(0, 1000) }, diagnosis.nextStep, { deploymentId: d.id, stageName: d.latestStage?.name || null }));
          }
        } catch (error) {
          report.incidents.push(incident('deployment-logs-unavailable', 'medium', 'Deployment logs could not be fetched', error.message, { deploymentId: d.id }, 'Check token Pages read permissions and inspect the Cloudflare dashboard.', { deploymentId: d.id }));
        }
      }
    }

    const latestStatus = report.latestDeployment?.latest_stage?.status;
    const latestListed = report.recentDeployments.find(d => d.id === report.latestDeployment?.id);
    // Cloudflare can expose an intentionally skipped deployment with an
    // "idle" latest stage. Treat any explicit skip flag as non-failing stage
    // status, while preserving a separate deployment-skipped incident above
    // when the skip reason (for example path_config) needs investigation.
    const latestExpectedSkip = Boolean(
      report.latestDeployment?.is_skipped ||
      latestListed?.skipped ||
      report.checks.some(check => check.expectedSkip && check.deploymentId === report.latestDeployment?.id)
    );
    report.checks.push({
      name: 'latest deployment stage',
      ok: latestStatus === 'success' || latestExpectedSkip,
      status: latestExpectedSkip ? 'expected skipped deployment' : (latestStatus || 'no-deployment'),
      deploymentId: report.latestDeployment?.id || null
    });
    if (!report.latestDeployment) report.incidents.push(incident('no-deployment', 'high', 'No Pages deployment exists', 'The project has no latest deployment recorded.', {}, 'Verify repository integration and trigger a deployment.'));
    else if (latestStatus === 'failure') report.incidents.push(incident('latest-deployment-failed', 'critical', 'Latest deployment failed', 'Cloudflare reports latest stage status failure.', { deploymentId: report.latestDeployment.id, stage: report.latestDeployment.latest_stage }, 'Use captured logs to identify the root cause before retrying.', { deploymentId: report.latestDeployment.id }));
    else if (latestStatus !== 'success' && !latestExpectedSkip) report.incidents.push(incident('deployment-in-progress', 'low', 'Latest deployment is not finished', 'Current status is ' + latestStatus + '.', { deploymentId: report.latestDeployment.id, stage: report.latestDeployment.latest_stage }, 'Poll again after deployment finishes.', { deploymentId: report.latestDeployment.id }));
    await inspectLive(report.liveUrl, report.incidents, report.checks);
  } catch (error) {
    report.status = 'error';
    report.incidents.push(incident('cloudflare-doctor-api-failed', 'critical', 'Cloudflare Doctor could not complete inspection', error.message, { accountIdConfigured: Boolean(accountId), tokenConfigured: Boolean(token) }, 'Create a CLOUDFLARE_API_TOKEN secret with Cloudflare Pages read access; the account ID is configured in the workflow.'));
  }

  const deduped = new Map();
  for (const i of report.incidents) {
    const key = [i.code, i.deploymentId || '', i.url || '', i.evidence?.line || ''].join('|');
    if (!deduped.has(key)) deduped.set(key, i);
  }
  report.incidents = [...deduped.values()];
  report.projectDoctorHandoff.incidents = report.incidents.map(i => ({
    source: 'cloudflare-pages', id: i.id, code: i.code, severity: i.severity, title: i.title,
    rootCause: i.rootCause, evidence: i.evidence, nextStep: i.nextStep,
    deploymentId: i.deploymentId || null, url: i.url || null, observedAt: report.checkedAt, verified: false
  }));
  if (report.status !== 'error') report.status = report.incidents.some(i => ['critical', 'high'].includes(i.severity)) ? 'degraded' : (report.incidents.length ? 'warning' : 'healthy');
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(SUMMARY_PATH, markdown(report));
  console.log(markdown(report));
  console.log('Saved cloudflare-doctor-report.json and cloudflare-doctor-summary.md');
  if (report.status === 'error' || report.incidents.some(i => ['critical', 'high'].includes(i.severity))) process.exitCode = 1;
}

main().catch(error => { console.error('[Cloudflare Doctor fatal]', error.stack || String(error)); process.exitCode = 2; });
