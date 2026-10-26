#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const errors = [];
function load(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
  } catch (error) {
    errors.push(relativePath + ': invalid or unreadable JSON (' + error.message + ')');
    return null;
  }
}

const memory = load('tools/project-doctor/knowledge.json');
const registry = load('tools/project-doctor/safe-fixes.json');

if (!memory || memory.schemaVersion !== 1 || !Array.isArray(memory.cases)) {
  errors.push('knowledge.json must use schemaVersion 1 and include a cases array.');
}
if (memory && Array.isArray(memory.cases)) {
  const ids = new Set();
  for (const item of memory.cases) {
    if (!item.id || ids.has(item.id)) errors.push('knowledge case has a missing or duplicate id: ' + (item.id || '(missing)'));
    ids.add(item.id);
    if (!item.title || !Array.isArray(item.signatures) || item.signatures.length === 0 ||
        !item.rootCause || !item.resolution || !item.confidence || !item.status || !item.nextStep) {
      errors.push('knowledge case ' + (item.id || '(missing id)') + ' is missing required diagnosis fields.');
    }
  }
}
if (!registry || registry.schemaVersion !== 1 || !Array.isArray(registry.rules)) {
  errors.push('safe-fixes.json must use schemaVersion 1 and include a rules array.');
}
if (registry && Array.isArray(registry.rules)) {
  const ids = new Set();
  for (const rule of registry.rules) {
    if (!rule.id || ids.has(rule.id)) errors.push('safe-fix has a missing or duplicate id: ' + (rule.id || '(missing)'));
    ids.add(rule.id);
    const parts = (rule.file || '').split(/[\\/]/);
    if (!rule.file || path.isAbsolute(rule.file) || parts.includes('..')) {
      errors.push('safe-fix ' + (rule.id || '(missing id)') + ' has an unsafe target path.');
    }
    if (!rule.before || !rule.after || rule.before === rule.after || !rule.description || !rule.risk) {
      errors.push('safe-fix ' + (rule.id || '(missing id)') + ' needs distinct exact before/after text, description, and risk.');
    }
    if (!Array.isArray(rule.validation) || rule.validation.length === 0) {
      errors.push('safe-fix ' + (rule.id || '(missing id)') + ' must declare validation commands.');
    }
  }
}

if (errors.length) {
  console.error('Project Doctor self-test failed:');
  for (const error of errors) console.error('- ' + error);
  process.exitCode = 1;
} else {
  console.log('Project Doctor self-test passed: ' + memory.cases.length + ' memory cases, ' + registry.rules.length + ' safe-fix recipes.');
}
