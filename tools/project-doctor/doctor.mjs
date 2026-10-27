#!/usr/bin/env node
/**
 * Athar Project Doctor
 *
 * Read-only against Git refs. It may apply exact, reviewed safe-fix recipes inside
 * disposable worktrees, validate the result, and export patches for human review.
 * It never pushes, commits, opens PRs, or merges branches.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const KNOWLEDGE_PATH = path.join(ROOT, 'tools/project-doctor/knowledge.json');
const FIXES_PATH = path.join(ROOT, 'tools/project-doctor/safe-fixes.json');
const REPORT_PATH = path.join(ROOT, 'project-doctor-report.json');
const CLOUDFLARE_REPORT_PATH = path.join(ROOT, 'cloudflare-doctor-report.json');
const PATCH_DIR = path.join(ROOT, 'project-doctor-patches');
const ALL_BRANCHES = process.argv.includes('--all-branches');
const CURRENT_ONLY = process.argv.includes('--current') || !ALL_BRANCHES;
const MAX_OUTPUT = 6000;

const knowledge = JSON.parse(fs.readFileSync(KNOWLEDGE_PATH, 'utf8'));
const safeFixes = JSON.parse(fs.readFileSync(FIXES_PATH, 'utf8'));
const report = {
  agent: 'Athar Project Doctor',
  version: 1,
  createdAt: new Date().toISOString(),
  mode: ALL_BRANCHES ? 'all-branches' : 'current-branch',
  guardrails: [
    'Never writes to remote branches or main.',
    'Only applies exact-match recipes listed in safe-fixes.json inside disposable worktrees.',
    'A proposed fix is not considered successful unless validation passes.',
    'Unknown failures are reported with evidence and diagnostic next steps.',
    'No new dependencies, broad refactors, gameplay expansion, or scope changes are proposed automatically.'
  ],
  branches: [],
  externalFindings: [],
  totals: { branches: 0, passed: 0, failed: 0, findings: 0, safeFixesApplied: 0 }
};

function run(command, args, cwd, timeout = 180000) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    timeout,
    maxBuffer: 8 * 1024 * 1024,
    env: { ...process.env, CI: 'true', npm_config_audit: 'false', npm_config_fund: 'false' }
  });
  const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
  return {
    ok: result.status === 0,
    status: result.status,
    signal: result.signal,
    timedOut: Boolean(result.error?.code === 'ETIMEDOUT'),
    output: output.slice(-MAX_OUTPUT)
  };
}

function git(args, cwd = ROOT, timeout = 60000) {
  return run('git', args, cwd, timeout);
}

function safeBranchName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 90);
}

function diagnose(output, step) {
  const text = output.toLowerCase();
  const matches = knowledge.cases.filter(item =>
    item.signatures.some(signature => text.includes(signature.toLowerCase()))
  );
  if (matches.length) {
    return matches.map(item => ({
      id: item.id,
      title: item.title,
      rootCause: item.rootCause,
      knownResolution: item.resolution,
      confidence: item.confidence,
      status: item.status,
      nextStep: item.nextStep
    }));
  }
  const generic = {
    install: {
      title: 'Dependency installation failed',
      rootCause: 'Not matched to a known Athar incident. The captured npm output is the primary evidence; the failure may be network, registry, package metadata, or dependency graph related.',
      nextStep: 'Inspect the full job log and npm debug log. Reproduce with the same Node/npm versions before changing package versions.'
    },
    audit: {
      title: 'Dependency security audit failed',
      rootCause: 'At least one dependency meets the configured audit severity threshold.',
      nextStep: 'Review npm audit details, identify the vulnerable transitive path, then update the narrowest compatible dependency and rerun all quality gates.'
    },
    typecheck: {
      title: 'TypeScript validation failed',
      rootCause: 'The compiler rejected one or more types or project configuration assumptions.',
      nextStep: 'Use the first actionable compiler diagnostic; avoid broad casts or disabling strict checks as a workaround.'
    },
    test: {
      title: 'Unit tests failed',
      rootCause: 'Observed behavior diverged from the test contract, or the test environment failed.',
      nextStep: 'Identify the first failing assertion and decide whether the implementation or the test expectation contradicts the intended game rules.'
    },
    build: {
      title: 'Production build failed',
      rootCause: 'The production compiler/bundler could not produce a release artifact.',
      nextStep: 'Inspect the earliest Vite/TypeScript error and fix the root cause without weakening checks.'
    },
    git: {
      title: 'Branch inspection failed',
      rootCause: 'Git could not prepare or inspect this branch in an isolated worktree.',
      nextStep: 'Check branch existence, permissions, merge conflicts, and repository state.'
    }
  }[step] || {
    title: 'Unclassified validation failure',
    rootCause: 'No known incident signature matched the captured output.',
    nextStep: 'Preserve the failing command and complete output, reproduce it, then add a knowledge entry only after the root cause is verified.'
  };
  return [{ id: 'unknown-' + step, ...generic, confidence: 'low', status: 'unclassified', knownResolution: null }];
}

function applySafeFixes(cwd) {
  const applied = [];
  const skipped = [];
  for (const fix of safeFixes.rules) {
    const target = path.join(cwd, fix.file);
    if (!fs.existsSync(target)) continue;
    const original = fs.readFileSync(target, 'utf8');
    const count = original.split(fix.before).length - 1;
    if (count === 0) continue;
    if (count !== 1) {
      skipped.push({ id: fix.id, reason: `Expected one exact match, found ${count}; no edit made.` });
      continue;
    }
    fs.writeFileSync(target, original.replace(fix.before, fix.after), 'utf8');
    applied.push({ id: fix.id, file: fix.file, description: fix.description, validationRequired: true });
  }
  return { applied, skipped };
}

function listBranches() {
  const result = git(['for-each-ref', '--format=%(refname:short)', 'refs/remotes/origin']);
  if (!result.ok) throw new Error('Could not list remote branches: ' + result.output);
  return [...new Set(result.output.split('\n').map(s => s.trim()).filter(Boolean))]
    .filter(ref => ref !== 'origin/HEAD')
    .map(ref => ({ ref, name: ref.replace(/^origin\//, '') }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function runCheck(branch, cwd, label, command, args, timeout) {
  const result = run(command, args, cwd, timeout);
  branch.checks.push({ name: label, ok: result.ok, status: result.status, timedOut: result.timedOut, output: result.output });
  if (!result.ok) {
    branch.ok = false;
    branch.findings.push({
      severity: label === 'security audit' ? 'high' : 'medium',
      step: label,
      diagnoses: diagnose(result.output, ({
        'dependency install': 'install',
        'security audit': 'audit',
        'typecheck': 'typecheck',
        'unit tests': 'test',
        'production build': 'build'
      })[label]),
      evidence: result.output.slice(-2500)
    });
  }
  return result.ok;
}

function checkOne(ref, name, useWorktree) {
  const branch = { name, ref, ok: true, safeFixes: [], skippedFixes: [], checks: [], findings: [] };
  let cwd = ROOT;
  let tempPath = null;

  if (useWorktree) {
    tempPath = fs.mkdtempSync(path.join(os.tmpdir(), 'athar-doctor-'));
    fs.rmSync(tempPath, { recursive: true, force: true });
    const added = git(['worktree', 'add', '--detach', tempPath, ref]);
    if (!added.ok) {
      branch.ok = false;
      branch.findings.push({ severity: 'high', step: 'git', diagnoses: diagnose(added.output, 'git'), evidence: added.output });
      return branch;
    }
    cwd = tempPath;
  }

  try {
    const fixes = applySafeFixes(cwd);
    branch.safeFixes = fixes.applied;
    branch.skippedFixes = fixes.skipped;
    report.totals.safeFixesApplied += fixes.applied.length;

    const packagePath = path.join(cwd, 'package.json');
    if (!fs.existsSync(packagePath)) {
      branch.ok = false;
      branch.findings.push({
        severity: 'high',
        step: 'project structure',
        diagnoses: [{ id: 'missing-package-json', title: 'Not a Node-based project branch', rootCause: 'package.json is absent on this branch.', confidence: 'high', nextStep: 'Verify whether this branch is intended to contain the Athar web game.' }],
        evidence: 'package.json not found'
      });
      return branch;
    }

    const installAttempts = [];
    let installOk = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const result = run('npm', ['install', '--no-audit', '--no-fund'], cwd, 240000);
      installAttempts.push({ attempt, ok: result.ok, status: result.status, timedOut: result.timedOut, output: result.output });
      if (result.ok) { installOk = true; break; }
      if (attempt < 3) run('npm', ['cache', 'clean', '--force'], cwd, 60000);
    }
    branch.checks.push({ name: 'dependency install', ok: installOk, attempts: installAttempts });
    if (!installOk) {
      branch.ok = false;
      const finalOutput = installAttempts.at(-1)?.output || '';
      branch.findings.push({
        severity: 'high',
        step: 'dependency install',
        diagnoses: diagnose(finalOutput, 'install'),
        evidence: finalOutput.slice(-2500),
        attempts: installAttempts.map(a => ({ attempt: a.attempt, ok: a.ok, status: a.status, output: a.output.slice(-700) }))
      });
      return branch;
    }

    runCheck(branch, cwd, 'security audit', 'npm', ['audit', '--audit-level=moderate'], 180000);
    runCheck(branch, cwd, 'typecheck', 'npm', ['run', 'typecheck', '--if-present'], 180000);
    runCheck(branch, cwd, 'unit tests', 'npm', ['test', '--if-present'], 240000);
    runCheck(branch, cwd, 'production build', 'npm', ['run', 'build', '--if-present'], 240000);

    const whitespace = git(['diff', '--check'], cwd);
    branch.checks.push({ name: 'diff whitespace check', ok: whitespace.ok, status: whitespace.status, output: whitespace.output });
    if (!whitespace.ok) {
      branch.ok = false;
      branch.findings.push({ severity: 'low', step: 'diff whitespace check', diagnoses: [{ id: 'whitespace', title: 'Whitespace errors in proposed changes', rootCause: 'Git diff --check found whitespace errors in the working tree.', confidence: 'high', nextStep: 'Correct the exact whitespace lines and rerun validation.' }], evidence: whitespace.output });
    }

    if (branch.safeFixes.length) {
      const diff = git(['diff', '--binary'], cwd);
      if (diff.ok && diff.output) {
        fs.mkdirSync(PATCH_DIR, { recursive: true });
        const patchPath = path.join(PATCH_DIR, `${safeBranchName(name)}.patch`);
        fs.writeFileSync(patchPath, diff.output + '\n', 'utf8');
        branch.patchArtifact = path.relative(ROOT, patchPath);
      }
      if (!branch.checks.every(check => check.ok)) {
        branch.findings.unshift({
          severity: 'high',
          step: 'safe fix validation',
          diagnoses: [{ id: 'safe-fix-unverified', title: 'Known safe fix could not be verified', rootCause: 'A reviewed exact-match patch was applied in an isolated worktree, but one or more quality checks failed.', confidence: 'high', nextStep: 'Do not apply the patch yet. Resolve the failing checks and rerun the doctor.' }],
          evidence: 'Safe fix: ' + branch.safeFixes.map(f => f.id).join(', ')
        });
      }
    }
    return branch;
  } finally {
    if (tempPath) {
      git(['worktree', 'remove', '--force', tempPath], ROOT);
      fs.rmSync(tempPath, { recursive: true, force: true });
    }
  }
}

function writeSummary() {
  const lines = [
    '# Athar Project Doctor',
    '',
    `- Mode: **${report.mode}**`,
    `- Branches checked: **${report.totals.branches}**`,
    `- Healthy: **${report.totals.passed}**`,
    `- Needs attention: **${report.totals.failed}**`,
    `- Findings: **${report.totals.findings}**`,
    `- Safe-fix recipes applied in isolated worktrees: **${report.totals.safeFixesApplied}**`,
    `- Cloudflare external findings imported: **${report.externalFindings.length}**`,
    '',
    '> The Doctor never writes to remote branches. Any generated patch is a proposal and must be reviewed before applying.',
    ''
  ];
  if (report.externalFindings.length) {
    lines.push('## Cloudflare Doctor handoff', '', 'These deployment/runtime findings were imported from cloudflare-doctor-report.json. They are evidence, not automatic code fixes.', '');
    for (const item of report.externalFindings) {
      lines.push(`### [${item.severity || 'unknown'}] ${item.title || item.code || 'Cloudflare finding'}`);
      lines.push(`- Code: ${item.code || 'unclassified'}`);
      lines.push(`- Root cause: ${item.rootCause || 'Not yet verified'}`);
      lines.push(`- Evidence: \`${JSON.stringify(item.evidence || {}).replace(/\n/g, ' ').slice(0, 500)}\``);
      if (item.nextStep) lines.push(`- Next: ${item.nextStep}`);
      lines.push('');
    }
  }
  for (const branch of report.branches) {
    lines.push(`## ${branch.ok ? '✅' : '❌'} ${branch.name}`);
    lines.push(`- Result: ${branch.ok ? 'passed' : 'needs attention'}`);
    if (branch.safeFixes.length) lines.push(`- Proposed safe fixes: ${branch.safeFixes.map(f => f.id + ' (' + f.file + ')').join(', ')}`);
    if (branch.patchArtifact) lines.push(`- Patch artifact: \`${branch.patchArtifact}\``);
    for (const finding of branch.findings) {
      lines.push(`- **[${finding.severity}] ${finding.step}**`);
      for (const d of finding.diagnoses || []) {
        lines.push(`  - ${d.title}: ${d.rootCause}`);
        if (d.nextStep) lines.push(`  - Next: ${d.nextStep}`);
      }
      if (finding.evidence) lines.push(`  - Evidence: \`${finding.evidence.replace(/\n/g, ' ').slice(-500)}\``);
    }
    lines.push('');
  }
  const summary = lines.join('\n');
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n');
  console.log(summary);
}

async function main() {
  fs.rmSync(PATCH_DIR, { recursive: true, force: true });
  if (fs.existsSync(CLOUDFLARE_REPORT_PATH)) {
    try {
      const cloudflareReport = JSON.parse(fs.readFileSync(CLOUDFLARE_REPORT_PATH, 'utf8'));
      const handoff = cloudflareReport.projectDoctorHandoff;
      if (handoff?.source === 'cloudflare-doctor' && Array.isArray(handoff.incidents)) {
        report.externalFindings = handoff.incidents.map(item => {
          const evidence = JSON.stringify([item.code, item.title, item.rootCause, item.evidence]);
          const known = knowledge.cases.find(entry => entry.signatures.some(signature => evidence.toLowerCase().includes(signature.toLowerCase())));
          return { ...item, knowledgeMatch: known ? { id: known.id, title: known.title, status: known.status, confidence: known.confidence } : null };
        });
        report.totals.findings += report.externalFindings.length;
      }
    } catch (error) {
      report.externalFindings.push({ severity: 'high', code: 'cloudflare-report-invalid', title: 'Cloudflare Doctor report could not be read', rootCause: error.message, nextStep: 'Regenerate cloudflare-doctor-report.json with Cloudflare Doctor and rerun Project Doctor.' });
      report.totals.findings += 1;
    }
  }
  let targets;
  if (ALL_BRANCHES) {
    const fetched = git(['fetch', 'origin', '--prune', '+refs/heads/*:refs/remotes/origin/*']);
    if (!fetched.ok) throw new Error('Unable to fetch remote branch refs: ' + fetched.output);
    targets = listBranches();
  } else {
    const current = git(['branch', '--show-current']);
    const ref = current.output || 'HEAD';
    targets = [{ ref: 'HEAD', name: ref }];
  }

  for (const target of targets) {
    const result = checkOne(target.ref, target.name, ALL_BRANCHES);
    report.branches.push(result);
    report.totals.branches++;
    if (result.ok) report.totals.passed++; else report.totals.failed++;
    report.totals.findings += result.findings.length;
  }

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n', 'utf8');
  writeSummary();
  process.exitCode = report.totals.failed > 0 ? 1 : 0;
}

main().catch(error => {
  console.error('[Project Doctor fatal]', error.stack || error.message || String(error));
  process.exitCode = 2;
});
