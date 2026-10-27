# Athar Cloudflare Doctor

Cloudflare Doctor is a read-only monitoring agent for the Athar Cloudflare Pages project. It checks project configuration, production branch/build/output mismatches, recent deployments and skipped deployments, failed stages, Cloudflare build logs, and the published homepage plus referenced JS/CSS assets.

It writes:
- `cloudflare-doctor-report.json`: latest structured report and Project Doctor handoff.
- `cloudflare-doctor-summary.md`: readable diagnosis.
- `tools/project-doctor/cloudflare-incident-history.json`: durable incident journal. Recurring observations update the record's timestamp/count; first-seen evidence is retained.
- GitHub Actions artifact: report files retained for 90 days.

Project Doctor imports the current Cloudflare handoff and reads the durable history. Cloudflare incidents are evidence, not proof of a game-code defect. Unknown signatures remain unverified until reproduced. Neither agent automatically edits Cloudflare settings, pushes a code fix, or merges a branch.

## Required GitHub secret

Create a Cloudflare API token with the minimum read permission needed to inspect Pages projects and deployment history/logs, then add it to the repository:

1. Open GitHub repository **Settings → Secrets and variables → Actions**.
2. Choose **New repository secret**.
3. Name it `CLOUDFLARE_API_TOKEN`.
4. Paste the token as the secret value and save it. Never commit or paste the token into source files.

The Cloudflare account ID is configured in `.github/workflows/cloudflare-doctor.yml`. The project name defaults to `athar-web-game`.

## Running and scheduling

- Pushes to `dev/athar-full-project` that touch monitored source/doctor files trigger a run.
- You can also run **Actions → Cloudflare Doctor → Run workflow** on the development branch.
- The workflow is configured to poll every 15 minutes. GitHub only runs scheduled workflows from the repository's default branch, so recurring checks will not start until this workflow and its required scripts are merged into the default branch. Manual/push-triggered runs can be used on the development branch beforehand.

The workflow deliberately exits red if it cannot inspect Cloudflare or finds a critical/high issue. Download the artifact from that run to see the evidence and suggested next steps.
