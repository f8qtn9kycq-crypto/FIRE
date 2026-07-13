# FIRE AI Workflow

## Source of Truth

Use this order when instructions conflict:

1. `AGENTS.md`, `REVIEW.md`, `.github/pull_request_template.md`, and `.github/ai-automation.yml`
2. Relevant documents under `docs/`
3. The current issue and PR description
4. The current user request
5. Prior chat memory or uploaded project files

Repo-tracked files override pasted prompts and stale project context.

## Tool Roles

- ChatGPT: product triage, prioritization, issue framing, and review synthesis.
- Codex: repository inspection, implementation, validation, branch creation, and PR creation.
- Claude: deeper review for Tier 2 or Tier 3 state, storage, routing, financial-engine, or security risk.
- Gemini: optional mobile UX and language comparison.

No tool is the system of record. GitHub issues, PRs, tracked workflow files, and validation output are the evidence.

## One-Unit Execution

Every automated or interactive implementation run may select and implement at most one issue or PR unit. The unit must have a clear scope and acceptance criteria. Split broad requests into separate issues and PRs.

Codex must:

1. Verify the remote is `f8qtn9kycq-crypto/FIRE`.
2. Read `AGENTS.md`, `REVIEW.md`, the PR template, and relevant docs.
3. Sync from `main` before creating a branch.
4. Create one `codex/<scope>` branch.
5. Make the smallest safe change.
6. Run the required validation.
7. Open a PR with concrete evidence.
8. Stop before merge unless the user explicitly requests and approves it.

## Risk Routing

Tier 0 workflow and docs changes normally need Codex review and syntax evidence. Tier 1 needs build and mobile evidence. Tier 2 needs state, storage, URL, and regression evidence. Tier 3 needs financial-engine or security review before merge.

## Feedback to Issues

Production bugs, data-loss risks, incorrect financial results, and blockers become GitHub issues immediately. Ideas and observations should be clarified before issue creation. Each implementation issue should include priority, risk tier, AI owner, area, scope, validation, and acceptance criteria so Project #4 can classify it.
