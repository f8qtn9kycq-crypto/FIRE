## Scope

What changed:

## User impact

What user problem this addresses:

## Workflow contract

- [ ] Read `AGENTS.md`
- [ ] Read `.github/ai-automation.yml`
- [ ] Read `README.md`
- [ ] Kept changes minimal and localized
- [ ] Did not rewrite unrelated repo areas

## Risk tier

- [ ] Tier 0: docs / templates / workflow instructions only
- [ ] Tier 1: copy / UI polish / non-calculation presentation
- [ ] Tier 2: data import/export / state / charts / scenario controls / non-core calculation plumbing
- [ ] Tier 3: FIRE calculations / withdrawal assumptions / tax / inflation / currency / portfolio allocation / privacy / security

## Financial safety impact

- [ ] No finance calculation, assumption, data, privacy, or integration behavior changed
- [ ] Finance logic changed and deterministic validation is included
- [ ] Assumptions are explicit
- [ ] No financial, investment, tax, legal, or retirement advice claims introduced
- [ ] No guarantee language introduced
- [ ] No trading, broker, exchange, or external account write behavior introduced
- [ ] No secrets or credentials introduced

## QA evidence

- [ ] Build/test passed if available
- [ ] Docs-only validation completed if no runtime files changed
- [ ] Formula/sample-scenario validation completed when finance calculations changed
- [ ] Currency, inflation, withdrawal, return, contribution, and tax assumptions reviewed when relevant
- [ ] Edge cases checked when finance calculations changed
- [ ] Privacy/data handling reviewed when personal data changed

## AI review routing

- [ ] Codex review needed
- [ ] Claude review needed for Tier 3 or conflicting findings
- [ ] ChatGPT PM synthesis needed before merge
- [ ] Human review required before merge

## Merge readiness

- [ ] No P0
- [ ] P1 either fixed or explicitly deferred
- [ ] Acceptance criteria met
- [ ] Explicit human merge approval retained

## Post-merge cleanup

- [ ] Branch can be deleted after merge
- [ ] No follow-up work depends on this branch


## Review contract

- [ ] Read `REVIEW.md`
- [ ] Read the relevant `docs/` workflow or product document
- [ ] Used one issue, one branch, and one PR
- [ ] Kept Project V2 writes dependent on `PROJECTS_TOKEN`
- [ ] Did not use `GITHUB_TOKEN` as a Projects V2 fallback

## Project fields

If this PR is an issue or PR workflow event, metadata is explicit where applicable:

- Status:
- Priority:
- Risk Tier:
- AI Owner:
- Area:

## Single-unit execution

- [ ] This PR implements one scoped issue or one repository setup unit
- [ ] No unrelated generated files are included
- [ ] No automatic merge is enabled
