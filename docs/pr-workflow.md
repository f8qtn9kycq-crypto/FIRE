# Pull Request Workflow

## Before Implementation

Read `AGENTS.md`, `REVIEW.md`, `.github/pull_request_template.md`, `.github/ai-automation.yml`, and the relevant issue and docs. Confirm the repository identity and classify the risk tier.

## Branch and PR

Do not push directly to `main`. Use one branch and one PR for one issue:

```text
codex/p0-...
codex/p1-...
codex/docs-...
codex/workflow-...
```

Keep the diff limited to the issue. Do not include generated files, local environment files, unrelated product edits, or broad refactors.

## Evidence

Every PR must state:

- changed scope and user impact
- risk tier
- financial or data-storage impact
- exact build, test, syntax, and manual QA evidence
- whether additional AI review is required
- acceptance criteria and merge readiness

Workflow-only PRs must also confirm that `PROJECTS_TOKEN` remains required and no Projects V2 write falls back to `github.token`.

## Merge Gate

Do not merge until the PR is open, non-draft, cleanly mergeable, has a successful current-head `Build` check, has no active requested changes, and has no unresolved P0. P1 findings must be fixed or explicitly deferred.

Merge approval is risk-based:

- Tier 0/1: AI review plus all required current-head checks may satisfy the merge gate and enable auto-merge when no P0/P1 blocker remains.
- Tier 2/3, P0, or any change to calculations, withdrawal assumptions, tax, inflation, currency, portfolio allocation, privacy, or security: explicit human approval is required.

Auto-merge must never be enabled when the PR changes financial model behavior or personal-finance data handling.

## Cleanup

After merge, verify the PR merged into `main`, confirm no follow-up work depends on the branch, and verify GitHub deleted the head branch or delete it deliberately.
