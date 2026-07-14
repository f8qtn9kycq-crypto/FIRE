---
name: fire-pr-review-gate
description: Review FIRE pull requests by retrieving live GitHub review comments, requested changes, and merge-gate status; use when asked to inspect or explain PR feedback, address actionable comments, update PR bodies or comments, validate current-head checks, or decide whether a FIRE PR is safe to squash-merge after explicit human approval.
---

# FIRE PR Review Gate

## Overview

Use this skill for FIRE PRs only. Treat live GitHub review threads, requested-changes state, and current-head checks as the source of truth. Prefer the smallest fix that clears the review comment or merge gate.

## Workflow

1. Read `AGENTS.md`, `REVIEW.md`, `.github/pull_request_template.md`, `.github/ai-automation.yml`, `README.md`, and the relevant `docs/` files before any judgment.
2. Verify repo identity, branch, PR number, and exact head SHA before making a recommendation.
3. Retrieve live review comments and thread state from GitHub. When thread resolution matters, inspect the thread state, not only flat comment text. If the user asks why review feedback was "not triggered", explain whether there were no live review threads, the task was really merge-gate validation, or the comments were already resolved/stale.
4. Classify each comment as actionable fix, informational note, stale/resolved, or merge-gate blocker.
5. If a comment is actionable, implement the smallest scoped change, rerun validation, and reply on the PR with the fix summary.
6. Recheck current-head `Build` and project-sync checks, draft state, requested-changes state, and mergeability on the exact PR head.
7. Recommend `Pass` only when the PR is non-draft, mergeable/clean, current-head checks pass, no P0 remains, P1 items are fixed or explicitly deferred, and the required review routing for the risk tier is satisfied.
8. Squash merge only after explicit human approval and only when the gate is clean. Never auto-merge.
9. After merge, confirm the PR merged into `main`, then delete the branch only if no follow-up work depends on it.

## Review Output

Use a verdict-first response with:

- Verdict
- P0 blockers
- P1 improvements
- Files to change or inspect
- Acceptance criteria
- Next recommended action

## Guardrails

- Use one issue, one branch, one PR.
- Keep scope minimal and preserve existing behavior.
- Do not widen into unrelated refactors.
- For workflow-only changes, preserve `PROJECTS_TOKEN` as the only Projects V2 write path; never fall back to `GITHUB_TOKEN`.
- For Tier 3 PRs, require the full review routing and human approval before merge.
- If the task is only merge status or approval state, do not invent code feedback; explain the distinction directly.
