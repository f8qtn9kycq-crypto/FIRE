# FIRE Planner Agent Instructions

## Mandatory Workflow Bootstrap

Before any AI-assisted task in this repository:

1. Read `AGENTS.md`, `REVIEW.md`, and `.github/pull_request_template.md`.
2. Read `.github/ai-automation.yml` before issue selection, PR gating, or GitHub mutation.
3. Read the relevant document under `docs/` before changing workflow, product scope, or financial behavior.
4. Verify that the local remote and queried GitHub repository are `f8qtn9kycq-crypto/FIRE`.
5. Classify the work as Tier 0, Tier 1, Tier 2, or Tier 3 before editing.
6. Work on one issue at a time, using one branch and one PR per issue.
7. Keep the change minimal, preserve existing behavior, and never merge automatically.

Repo-tracked workflow files are the source of truth over pasted prompts, uploaded project files, or prior chat memory.

## Product Context

FIRE Planner is a Taiwan-focused retirement and financial planning tool. It is a life-planning experience for Taiwanese households, families, couples, and non-financial experts, not a trading terminal.

Priorities:

- trust and explainability before extra features
- mobile-first clarity and low cognitive load
- Traditional Chinese and Taiwan-native money mental models
- visible assumptions, contribution breakdowns, and contextual narratives
- simple wording for users aged roughly 40-60

Use `docs/product-workflow.md` for product and financial-engineering boundaries.

## Engineering Rules

- Keep components small and predictable; business logic belongs in pure utilities or hooks, not UI components.
- Centralize shared types and financial models when adding TypeScript or shared data.
- Do not duplicate calculation logic or introduce unexplained magic numbers.
- Preserve existing LocalStorage keys and saved data formats unless the issue explicitly requires migration.
- Keep localization-friendly strings and avoid new hardcoded user-facing copy where an existing i18n pattern applies.
- Prefer the existing React/Vite conventions in this repository over a framework rewrite.
- Do not add a new abstraction unless it removes meaningful duplication or matches an established local pattern.

## Financial Trust Rules

- Every major result must make its assumptions and contribution sources understandable.
- Format large Taiwan-dollar values in `萬` or `千萬` where the existing UI supports it.
- Prefer named return assumptions such as conservative, balanced, and aggressive over unexplained sliders.
- Do not make guaranteed-return, diagnosis, or certainty claims.
- Do not change calculation formulas, retirement assumptions, or safety-related copy without a Tier 2 or Tier 3 issue and explicit acceptance criteria.

## Mobile and Accessibility Rules

- Optimize for one-column mobile layouts, readable type, large touch targets, and short visible steps.
- Use progressive disclosure for common and advanced assumptions.
- Keep the primary result and the next action understandable within a few seconds on mobile.
- Check 320px and 375px widths when a user-facing layout changes.
- Preserve keyboard access, visible focus, labels, and useful error messages.

## Risk Tiers

### Tier 0: Docs and Workflow

Documentation, PR templates, repository workflow, CI configuration, and non-runtime automation instructions. No product behavior changes.

### Tier 1: UI and Low-Risk UX

Copy, labels, layout, accessibility wording, and low-risk navigation changes. Build and focused mobile QA are required.

### Tier 2: State, Routing, and Storage

LocalStorage, URL state, routing, calculation inputs, or shared user state. Build, focused behavior QA, compatibility review, and regression evidence are required.

### Tier 3: Financial Engine and Security

Calculation formulas, simulation assumptions, data migration, authentication, or security-sensitive behavior. Require focused tests, explainability review, and explicit approval before merge.

## Git and Pull Requests

- Do not commit directly to `main`.
- Use `codex/<scope>` branches and open a separate PR for each issue.
- Keep unrelated local changes and generated files out of the PR.
- Fill the PR template with scope, risk tier, validation evidence, and merge readiness.
- Do not merge or enable blind auto-merge. A human must approve the final merge gate.
- After merge, verify the PR is merged and the head branch is deleted or scheduled for deletion.

## Project Custom Fields

The reference `rehab-workout` repository uses user-owned Project #2. FIRE uses the same field contract so one operational view can track both repos:

- `Status`: `Backlog`, `Ready for Codex`, `In Progress`, `PR Review`, `Review`, `Ready to Merge`, `Done`
- `Priority`: `P0`, `P1`, `P2`
- `Risk Tier`: `Tier 0`, `Tier 1`, `Tier 2`, `Tier 3`
- `AI Owner`: `Codex`, `Claude`, `ChatGPT`, `Gemini`
- `Area`: `Safety`, `i18n`, `Progress`, `UX`, `Workflow`

The workflow skips a field or option that is absent, but the project should contain these fields before automation is treated as fully configured. `PROJECTS_TOKEN` is required for Projects V2 writes; `GITHUB_TOKEN` is not a substitute.

## Required Validation

For workflow or documentation-only changes:

- validate changed YAML or shell syntax when practical
- run `git diff --check`
- confirm no product source files changed

For runtime changes:

- run `npm run build`
- run focused tests when available
- record mobile, LocalStorage, URL, or financial-engine QA evidence as applicable

## Source of Truth Map

- `REVIEW.md`: severity rules and review output contract
- `.github/pull_request_template.md`: required PR evidence
- `.github/ai-automation.yml`: repo identity, one-unit execution, and merge rules
- `.github/workflows/project-auto-add.yml`: Project #2 field synchronization
- `docs/ai-workflow.md`: AI roles and source-of-truth order
- `docs/project-workflow.md`: Project fields and lifecycle semantics
- `docs/pr-workflow.md`: branch, review, merge, and cleanup process
- `docs/codex-issue-workflow.md`: issue-to-PR execution contract
- `docs/product-workflow.md`: FIRE product and financial-engineering boundaries
