# GitHub Project Workflow

FIRE follows the Project V2 operating pattern used by the reference `f8qtn9kycq-crypto/rehab-workout` repository.

## Project Configuration

- Owner: `f8qtn9kycq-crypto`
- Owner type: `user`
- Project number: `2`
- Required repository secret: `PROJECTS_TOKEN`
- Workflow: `.github/workflows/project-auto-add.yml`

The token must have Projects V2 read/write access and repository access. `GITHUB_TOKEN` does not provide the required Projects V2 field access and must never be used as a fallback.

## Custom Fields

Create or preserve these Project #2 single-select fields and options:

| Field | Options |
| --- | --- |
| Status | `Backlog`, `Ready for Codex`, `In Progress`, `PR Review`, `Review`, `Ready to Merge`, `Done` |
| Priority | `P0`, `P1`, `P2` |
| Risk Tier | `Tier 0`, `Tier 1`, `Tier 2`, `Tier 3` |
| AI Owner | `Codex`, `Claude`, `ChatGPT`, `Gemini` |
| Area | `Safety`, `i18n`, `Progress`, `UX`, `Workflow` |

For FIRE, use `Progress` for calculator, retirement projection, and financial-engine work; use `Trust` only in issue text unless the shared project later adds it as an option.

## Lifecycle Rules

- Open or reopened issues become `Backlog`.
- Open PRs that are not strictly ready become `Review`, then `PR Review`, or `In Progress` when those options are unavailable.
- `Ready to Merge` requires an open, non-draft PR with clean mergeability, a successful current-head `Build` check, and no active requested-changes review.
- Merged PRs become `Done`.
- Completed linked issues become `Done` when their closing PR merges.
- Closed issues or PRs that were not completed or merged must not be marked `Done`.

The workflow is idempotent: it adds an item if needed, finds an existing item when GitHub reports a duplicate, and only writes fields when a matching field option exists.

## Backfill

After `PROJECTS_TOKEN` and the custom fields are configured, backfill missed content from Actions:

```text
Actions -> Project auto-add -> Run workflow
target_type=issue or pull_request
target_number=<number>
```

Verify one test issue and one test PR before backfilling a larger set. If the project query fails, treat the missing token or project access as the blocker; do not weaken the workflow permissions or use `GITHUB_TOKEN`.
