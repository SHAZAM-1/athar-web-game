#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const registryPath = path.join(root, 'tools/project-doctor/safe-fixes.json');
const idIndex = process.argv.indexOf('--id');
const fixId = idIndex >= 0 ? process.argv[idIndex + 1] : null;

if (!fixId) {
  console.error('Usage: node tools/project-doctor/apply-safe-fix.mjs --id <safe-fix-id>');
  process.exit(2);
}

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const fix = registry.rules.find(rule => rule.id === fixId && rule.enabled === true);
if (!fix) {
  console.error('No enabled, reviewed safe-fix recipe found for id: ' + fixId);
  process.exit(2);
}

const parts = fix.file.split(/[\\/]/);
if (path.isAbsolute(fix.file) || parts.includes('..')) {
  console.error('Unsafe target path in safe-fix registry.');
  process.exit(2);
}

const target = path.join(root, fix.file);
if (!fs.existsSync(target)) {
  console.error('Target file does not exist: ' + fix.file);
  process.exit(1);
}
const original = fs.readFileSync(target, 'utf8');
const count = original.split(fix.before).length - 1;
if (count !== 1) {
  console.error('Safe fix refused. Expected exactly one match in ' + fix.file + ', found ' + count + '.');
  process.exit(1);
}

fs.writeFileSync(target, original.replace(fix.before, fix.after), 'utf8');
console.log(JSON.stringify({ applied: true, id: fix.id, file: fix.file, description: fix.description }));
