# Athar Project Doctor

Project Doctor is a bounded, repository-specific health-check agent. It is intentionally not a general-purpose developer and does not have permission to change remote branches.

## Mission

Protect the Athar prototype's current goals:
- Mobile-first browser puzzle game built with TypeScript, Phaser 3, Vite, and Vitest.
- Validate the Whispering Realm before expanding to Crystal or Abyssal.
- Keep gameplay original, calm, accessible, performant, and understandable.
- Fix root causes without introducing unrelated work or lowering quality gates.

## Operating modes

- **All branches**: fetch remote refs, create disposable Git worktrees, and run dependency install, security audit, typecheck, unit tests, production build, and whitespace validation for each branch.
- **Current branch**: run the same checks on the checked-out code without creating a worktree.
- **Safe-fix recipes**: only exact-match rules in `safe-fixes.json`. Recipes run in isolated worktrees. The Doctor exports a patch artifact; it does not push, commit, create a PR, or merge.
- **Diagnosis memory**: `knowledge.json` maps known failure signatures to previously verified root causes, resolutions, confidence, and next steps. Unknown failures retain command output and receive conservative troubleshooting steps.

## Safety and anti-slop rules

1. Never write directly to `main` or any remote branch.
2. Never auto-merge or bypass required checks.
3. Never apply fuzzy edits, broad search-and-replace, or speculative refactors.
4. Never add a dependency, weaken a check, suppress a security finding, or alter gameplay to make the report green.
5. Only mark a fix verified when the relevant checks pass after the fix.
6. If evidence is insufficient, say **unknown** and provide reproduction steps instead of inventing a root cause.
7. Keep findings tied to exact branch, command, output, file, and known incident where available.
8. Keep work inside Athar's current goals. Do not introduce unrelated backend services, analytics/tracking, accounts, payments, extra realms, or monetization work as incidental fixes.
9. Human review is required before any exported patch is applied to a branch.
10. Update the knowledge base only when a root cause and resolution are supported by evidence. Record unresolved or environment-dependent issues as such.

## Learning loop

When a new failure occurs:
1. Preserve the failing command, branch, and relevant log excerpt.
2. Match against existing knowledge signatures.
3. Reproduce and identify the smallest root cause.
4. Fix in an isolated branch and run the relevant checks.
5. After a human-reviewed solution is verified, add a new case to `knowledge.json` with status, confidence, resolution, and prevention guidance.
6. Add a safe-fix recipe only for deterministic, exact-match edits whose result can be validated automatically.

This is a deterministic local diagnostic agent, not an LLM. It uses explicit rules and project memory rather than pretending to reason beyond the available evidence. An external AI model is not required, and no API key or source-code upload to a third party is used.

## Output

Each run writes:
- `project-doctor-report.json`: machine-readable branch health report.
- `project-doctor-patches/*.patch`: reviewed safe-fix proposals for branches where an exact recipe matched.
- GitHub Actions job summary and an uploaded artifact.

A red result means a branch needs attention; it does not automatically mean the application code is the root cause. Check the recorded diagnosis before changing code.
