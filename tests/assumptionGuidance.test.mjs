import assert from "node:assert/strict";
import test from "node:test";
import {
  ASSUMPTION_DISCLAIMER,
  ASSUMPTION_GUIDANCE,
  getAssumptionGuidance,
  getAssumptionScenarioId,
} from "../src/utils/assumptionGuidance.js";

const EXPECTED_SCENARIOS = {
  retPre: { conservative: 4, neutral: 7, aggressive: 10 },
  retPost: { conservative: 3, neutral: 5, aggressive: 7 },
  inf: { conservative: 4, neutral: 2.5, aggressive: 1.5 },
};

test("guidance preserves the existing scenario values", () => {
  for (const [key, expected] of Object.entries(EXPECTED_SCENARIOS)) {
    const values = Object.fromEntries(
      getAssumptionGuidance(key).scenarios.map(({ id, value }) => [id, value]),
    );
    assert.deepEqual(values, expected);
  }
});

test("every assumption includes all three plain-language scenario explanations", () => {
  for (const guidance of Object.values(ASSUMPTION_GUIDANCE)) {
    assert.deepEqual(guidance.scenarios.map(({ id }) => id), ["conservative", "neutral", "aggressive"]);
    assert.ok(guidance.impact.length > 20);
    for (const scenario of guidance.scenarios) assert.ok(scenario.description.length > 20);
  }
});

test("return assumptions classify lower, middle, and higher values deterministically", () => {
  assert.equal(getAssumptionScenarioId("retPre", 2), "conservative");
  assert.equal(getAssumptionScenarioId("retPre", 7), "neutral");
  assert.equal(getAssumptionScenarioId("retPre", 15), "aggressive");
  assert.equal(getAssumptionScenarioId("retPost", 1), "conservative");
  assert.equal(getAssumptionScenarioId("retPost", 5), "neutral");
  assert.equal(getAssumptionScenarioId("retPost", 12), "aggressive");
});

test("inflation treats a higher rate as the conservative planning scenario", () => {
  assert.equal(getAssumptionScenarioId("inf", 0), "aggressive");
  assert.equal(getAssumptionScenarioId("inf", 2.5), "neutral");
  assert.equal(getAssumptionScenarioId("inf", 8), "conservative");
});

test("invalid guidance requests do not invent an assumption", () => {
  assert.equal(getAssumptionGuidance("unknown"), null);
  assert.equal(getAssumptionScenarioId("unknown", 5), null);
  assert.equal(getAssumptionScenarioId("retPre", "not-a-number"), null);
});

test("disclaimer states that guidance is not advice and outcomes are not guaranteed", () => {
  assert.match(ASSUMPTION_DISCLAIMER, /不是投資建議/);
  assert.match(ASSUMPTION_DISCLAIMER, /不保證/);
});
