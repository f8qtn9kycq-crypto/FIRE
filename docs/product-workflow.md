# FIRE Product Workflow

FIRE Planner is a Taiwan-focused retirement planning tool for people who want understandable life-planning support, not a trading terminal.

## Product Boundaries

- Keep the primary flow understandable on a mobile screen.
- Show assumptions, contributions, growth, and context behind major results.
- Use Traditional Chinese and Taiwan-native units such as `萬` and `千萬` where appropriate.
- Prefer conservative, balanced, and aggressive assumptions with explanations over arbitrary controls.
- Use narrative status alongside numeric outputs.
- Keep advanced settings behind progressive disclosure.

## Financial Engine Boundaries

Financial calculations must be pure, isolated, testable, and explainable. UI components should collect inputs and render results, not own formulas. A change to formulas, assumptions, simulation behavior, or saved financial data is Tier 3 unless the issue explicitly establishes a lower-risk classification.

Do not promise outcomes, imply certainty, or hide material assumptions. When a result changes, provide a contribution or assumption explanation and update the relevant validation evidence.

## Change Routing

- Workflow and documentation: Tier 0.
- Copy, accessibility, and low-risk layout: Tier 1.
- URL state, LocalStorage, and planning-flow state: Tier 2.
- Financial formulas, simulation assumptions, data migration, or security: Tier 3.
