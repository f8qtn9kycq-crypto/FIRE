# FIRE

Personal FIRE / financial planning repository.

## AI workflow / automation

AI-assisted work must read repo-tracked workflow files before issue selection, PR review, or GitHub mutation:

- `AGENTS.md`
- `.github/ai-automation.yml`
- `.github/pull_request_template.md`
- `README.md`

Scheduled automation must verify the repo identity is exactly `f8qtn9kycq-crypto/FIRE` before mutation. If the local remote, queried GitHub repo, or repo-tracked product instructions do not match, stop with `repo-mismatch blocker`.

## Financial safety boundary

This repository is for personal planning and scenario modeling only. It is not financial, investment, tax, legal, or retirement advice.

Default rules:

- Do not auto-merge.
- Do not add trading, broker, exchange, or external account write behavior by default.
- Do not introduce guarantee language for returns, FI status, withdrawal rates, tax outcome, or retirement readiness.
- Keep assumptions explicit for return, inflation, withdrawal rate, tax, currency, and contributions when those topics are touched.
- Require explicit human review before merge, especially for calculations, assumptions, data handling, privacy, or integrations.


## Extended Workflow Documentation

- `AGENTS.md`: repository and AI execution contract
- `REVIEW.md`: severity, review, and merge gate
- `.github/ai-automation.yml`: repo identity, risk routing, and one-unit execution
- `.github/workflows/project-auto-add.yml`: Project #4 lifecycle and custom-field sync
- `docs/project-workflow.md`: Project fields, lifecycle rules, and backfill
- `docs/pr-workflow.md`: branch, evidence, merge, and cleanup rules
- `docs/codex-issue-workflow.md`: issue-to-PR contract

Project #4 custom fields are `Status`, `Priority`, `Risk Tier`, `AI Owner`, and `Area`. Projects V2 writes require `PROJECTS_TOKEN`; the workflow fails fast when it is unavailable.
