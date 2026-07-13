## Scope

What changed:

Closes #

## User impact

What user or workflow problem this addresses:

## Workflow contract

- [ ] Read `AGENTS.md`
- [ ] Read `REVIEW.md`
- [ ] Read this PR template
- [ ] Read `.github/ai-automation.yml` when workflow, issue, PR, or GitHub mutation behavior is touched
- [ ] Implemented one issue on one branch with one PR
- [ ] Kept the change minimal and localized
- [ ] Did not merge automatically

## Risk tier

- [ ] Tier 0: docs / workflow
- [ ] Tier 1: UI / copy / low-risk UX
- [ ] Tier 2: state / routing / LocalStorage
- [ ] Tier 3: financial engine / data migration / security

## Financial and safety impact

- [ ] No financial calculation or user-data behavior changed
- [ ] Assumptions and result explanations remain truthful
- [ ] LocalStorage compatibility considered
- [ ] No certainty, diagnosis, or guaranteed-return claim added

## QA evidence

- [ ] `npm run build` passed when runtime files changed
- [ ] Focused tests passed when available
- [ ] `git diff --check` passed
- [ ] Mobile layout checked when UI changed
- [ ] URL / LocalStorage behavior checked when applicable
- [ ] Workflow or YAML syntax checked when workflow files changed

## AI review routing

- [ ] Codex review completed
- [ ] Claude review requested for meaningful Tier 2 or Tier 3 risk
- [ ] ChatGPT PM synthesis requested only for conflicting or high-risk findings

## Merge readiness

- [ ] No P0 remains
- [ ] P1 findings are fixed or explicitly deferred
- [ ] Acceptance criteria are met
- [ ] This PR is ready for human approval

## Post-merge cleanup

- [ ] Head branch can be deleted after merge
- [ ] No follow-up work depends on this branch
