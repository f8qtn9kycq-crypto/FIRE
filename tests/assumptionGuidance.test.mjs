import assert from "node:assert/strict";
import test from "node:test";
import {
  ASSUMPTION_DISCLAIMER,
  ASSUMPTION_GUIDANCE,
  getAssumptionGuidance,
  getAssumptionPresets,
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

test("every catalog value classifies back to its own scenario", () => {
  for (const [key, guidance] of Object.entries(ASSUMPTION_GUIDANCE)) {
    for (const scenario of guidance.scenarios) {
      assert.equal(getAssumptionScenarioId(key, scenario.value), scenario.id);
    }
  }
});

test("slider presets share catalog labels and values without duplication", () => {
  for (const [key, guidance] of Object.entries(ASSUMPTION_GUIDANCE)) {
    assert.deepEqual(
      getAssumptionPresets(key),
      guidance.scenarios.map(({ label, value }) => ({ label, value })),
    );
  }
  assert.deepEqual(getAssumptionPresets("unknown"), []);
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

test("classification thresholds handle equal, slightly lower, and slightly higher values", () => {
  const cases = [
    { key: "retPre", threshold: 5.5, below: "conservative", equal: "neutral", above: "neutral" },
    { key: "retPre", threshold: 8.5, below: "neutral", equal: "neutral", above: "aggressive" },
    { key: "retPost", threshold: 4, below: "conservative", equal: "neutral", above: "neutral" },
    { key: "retPost", threshold: 6, below: "neutral", equal: "neutral", above: "aggressive" },
    { key: "inf", threshold: 2, below: "aggressive", equal: "neutral", above: "neutral" },
    { key: "inf", threshold: 3.25, below: "neutral", equal: "neutral", above: "conservative" },
  ];

  for (const { key, threshold, below, equal, above } of cases) {
    assert.equal(getAssumptionScenarioId(key, threshold - 0.01), below);
    assert.equal(getAssumptionScenarioId(key, threshold), equal);
    assert.equal(getAssumptionScenarioId(key, threshold + 0.01), above);
  }
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

test("all guidance copy avoids advice and positive guarantee language", () => {
  const forbiddenClaims = /(?<!不)保證|一定會|必然|建議你|應該買|應該賣|推薦/;
  const copy = [
    ASSUMPTION_DISCLAIMER,
    ...Object.values(ASSUMPTION_GUIDANCE).flatMap((guidance) => [
      guidance.impact,
      ...guidance.scenarios.map((scenario) => scenario.description),
    ]),
  ];

  for (const text of copy) assert.doesNotMatch(text, forbiddenClaims);
});
