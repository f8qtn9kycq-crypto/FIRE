# FIRE Planner Review Contract

## Review Objective

Review for merge readiness with the smallest useful scope. Before reviewing, read `AGENTS.md`, this file, and `.github/pull_request_template.md`.

## Severity

### P0

Must fix before merge:

- build or CI failure
- broken primary planning flow
- loss or corruption of saved user inputs
- incorrect financial result that can materially mislead a user
- security or data exposure issue

### P1

Should fix in this PR:

- important mobile control is confusing or unusable
- user-facing copy is materially unclear or untranslated
- primary action lacks an accessible label or error state
- changed behavior lacks the required validation evidence
- an edge case is likely to affect normal users

### P2

Backlog only. Do not block the current PR for polish or unrelated refactoring.

## Review Behavior

- Prefer high-confidence, reproducible findings.
- Do not request broad rewrites or duplicate another reviewer’s finding.
- Every P0/P1 finding must include file, behavior, risk, and acceptance criterion.
- Check that the PR stays within its declared risk tier and issue scope.
- For Tier 2 or Tier 3 work, check LocalStorage compatibility, URL state, calculation assumptions, explainability, and mobile regression risk.
- For workflow changes, check repo identity, token requirements, event coverage, idempotency, and that no `github.token` fallback writes Projects V2 fields.

## Merge Gate

Before recommending merge, confirm:

- no P0 remains
- P1 findings are fixed or explicitly deferred
- acceptance criteria are met
- PR template evidence is complete
- the branch contains no unrelated generated files
- no automatic merge is enabled without explicit approval

## Review Output

Use this format:

```text
Verdict: Pass / Partial Pass / Fail
P0:
P1:
Files:
Acceptance criteria:
Suggested next Codex command:
```

Do not include P2 wishlist items unless requested.
