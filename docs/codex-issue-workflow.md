# Issue-to-PR Workflow

Use a short trigger after the issue contains the decision-ready contract:

```text
Implement GitHub issue #<number> following AGENTS.md, REVIEW.md, and .github/pull_request_template.md. Keep scope minimal, create one branch, run required validation, open one PR, and do not merge automatically.
```

## Required Issue Contract

Each implementation issue should include:

- `Status`, `Priority`, `Risk Tier`, `AI Owner`, and `Area`
- Goal and user problem
- Scope and likely files
- Financial, data, and safety constraints
- Validation required
- Acceptance criteria
- A short Codex trigger

## Execution

Codex reads the repo contract, verifies the FIRE remote, syncs `main`, creates one task branch, implements only the selected issue, validates it, and opens a PR. Review follows `REVIEW.md`. No automatic merge is allowed.
