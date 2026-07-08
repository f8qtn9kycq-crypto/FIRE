# AGENTS.md

## Mandatory workflow bootstrap

For every ChatGPT, Codex, Claude, Gemini, or other AI-assisted task in this repo:

1. Read this file first.
2. Read `.github/pull_request_template.md` before opening or updating a PR.
3. Read `.github/ai-automation.yml` before scheduled automation, issue selection, PR gating, or any GitHub mutation.
4. Read `README.md` for current repo scope.
5. Treat repo-tracked workflow files as the source of truth over pasted chat context when they conflict.
6. Classify the task risk tier before implementation:
   - Tier 0: docs / templates / workflow instructions only
   - Tier 1: copy / UI polish / non-calculation presentation
   - Tier 2: data import/export / state / charts / scenario controls / non-core calculation plumbing
   - Tier 3: FIRE calculations / withdrawal assumptions / tax / inflation / currency / portfolio allocation / privacy / security
7. Keep the change scoped to the selected risk tier.
8. If the requested work is broad, split it into the smallest safe PR.
9. Do not rely on memory alone for financial assumptions, workflow, privacy, or validation requirements.

## Product context

This is a personal FIRE / financial planning repository. Current repo docs are intentionally minimal.

Primary boundaries:
- Planning and scenario modeling only.
- Not financial, investment, tax, legal, or retirement advice.
- No trading automation by default.
- No broker, exchange, or custodial account actions.
- No guarantee of returns, FI status, safe withdrawal rate, tax outcome, or retirement readiness.

## Financial safety rules

- Do not present outputs as personalized financial advice.
- Do not introduce guarantee language.
- Do not hide assumptions for returns, inflation, withdrawal rates, taxes, contribution rates, or FX.
- Do not hard-code personal financial assumptions without explicit source/evidence.
- Do not add external account write actions or trading behavior.
- Treat privacy, personal finance data, and credentials as high-risk.

## Engineering rules

- Keep changes minimal and localized.
- Do not broadly rewrite the repo unless explicitly requested.
- Preserve existing data compatibility when data files or schemas exist.
- Prefer deterministic validation for financial formulas and scenario outputs.
- Require explicit human merge approval for all PRs.

## Validation defaults

For docs-only changes:
- confirm no runtime or calculation behavior changed.
- confirm no personal financial assumptions changed.
- confirm no investment, tax, legal, or retirement advice claims were introduced.

For finance calculation/model changes:
- verify formulas with deterministic sample scenarios.
- make currency, inflation, withdrawal, contribution, return, and tax assumptions explicit.
- test zero, negative, missing, and unusually large values.
- verify no guarantee language is introduced.
- require human review before merge.

For data/privacy changes:
- verify personal financial data handling.
- verify no secrets or account credentials are introduced.
- verify export/import behavior if applicable.
- require human review before merge.

## AI execution rules

Scheduled automation runners must:
- read `.github/ai-automation.yml` before selecting issues, gating PRs, or mutating GitHub.
- verify the local git remote, queried GitHub repo, and repo-tracked instructions match this repository.
- stop with `repo-mismatch blocker` before mutation when identity or product instructions do not match.
- execute at most one issue/PR unit of work per scheduled run.

Codex must:
- sync from latest `main` before creating an implementation branch.
- create a branch for changes instead of committing directly to `main`.
- keep PRs small and reviewable.
- fill the PR template with concrete QA evidence.
- avoid changing finance assumptions, calculations, privacy, data, or integration behavior unless the selected issue explicitly asks for it.
- never merge automatically; this repo keeps an explicit human merge gate.

## P0 blockers

Flag as P0 only when:
- build/load fails for an existing app or workflow.
- core calculation output is wrong or unvalidated.
- personal financial data may be lost or exposed.
- secrets or credentials are introduced.
- external account or trading writes are introduced.
- financial, investment, tax, legal, or retirement advice claims are introduced.
- guarantee language is introduced.

## P1 improvements

Flag as P1 when:
- assumptions are unclear.
- changed behavior lacks deterministic validation evidence.
- currency, inflation, return, withdrawal, or tax labels are ambiguous.
- UX could cause the user to misread a scenario as advice.
- manual review gates are missing.

## Output contract

Return:
1. Verdict: Pass / Partial Pass / Fail
2. P0 blockers
3. P1 improvements
4. Exact files to change
5. Acceptance criteria

Do not include P2 wishlist items unless explicitly requested.
Do not suggest broad rewrites.
