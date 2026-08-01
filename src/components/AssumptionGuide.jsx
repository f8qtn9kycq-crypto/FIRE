import {
  ASSUMPTION_DISCLAIMER,
  getAssumptionGuidance,
  getAssumptionScenarioId,
} from "../utils/assumptionGuidance";

export default function AssumptionGuide({ assumptionKey, value }) {
  const guidance = getAssumptionGuidance(assumptionKey);
  if (!guidance) return null;

  const activeScenarioId = getAssumptionScenarioId(assumptionKey, value);

  return (
    <details className="assumption-guide" data-assumption={assumptionKey}>
      <summary>
        如何理解這個假設？
        <span>目前 {value}%</span>
      </summary>
      <div className="assumption-guide-body">
        <p>{guidance.impact}</p>
        <div className="assumption-scenarios" aria-label={`${guidance.title}情境說明`}>
          {guidance.scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className={`assumption-scenario${scenario.id === activeScenarioId ? " is-current" : ""}`}
            >
              <div className="assumption-scenario-heading">
                <strong>{scenario.label}</strong>
                <span>{scenario.value}%</span>
                {scenario.id === activeScenarioId && <small>目前接近</small>}
              </div>
              <p>{scenario.description}</p>
            </div>
          ))}
        </div>
        <p className="assumption-disclaimer">{ASSUMPTION_DISCLAIMER}</p>
      </div>
    </details>
  );
}
