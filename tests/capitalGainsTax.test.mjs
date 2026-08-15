import assert from "node:assert/strict";
import test from "node:test";
import { calculateResults, runProjection } from "../src/utils/fireEngine.js";
import { runMC } from "../src/utils/monteCarlo.js";
import { calculateRetirementReadiness } from "../src/utils/retirementReadiness.js";
import { runBearScenario } from "../src/utils/scenarios.js";
import {
  grossUpWithdrawalForTax,
  isValidCapitalGainsTaxPercent,
  isValidCapitalGainsTaxRate,
} from "../src/utils/taxAssumptions.js";
import { validateInputBoundaries } from "../src/utils/validateRetirementAssumptions.js";

const validPlan = {
  age: 45,
  retAge: 65,
  lifeExp: 95,
  cash: 500,
  investments: 2_500,
  expenses: 100,
  annualContrib: 20,
  retPre: 7,
  retPost: 5,
  inf: 2.5,
  swr: 3.5,
  currencyCode: "TWD",
  cgTax: 20,
};

test("capital-gains tax percent accepts the full supported domain", () => {
  assert.equal(isValidCapitalGainsTaxPercent(0), true);
  assert.equal(isValidCapitalGainsTaxPercent(20), true);
  assert.equal(isValidCapitalGainsTaxPercent(99.999), true);
});

test("capital-gains tax percent rejects finite values outside the supported boundaries", () => {
  for (const value of [-1, 100, 120]) {
    assert.equal(isValidCapitalGainsTaxPercent(value), false);
    const validation = validateInputBoundaries({ ...validPlan, cgTax: value });
    assert.equal(validation.isValid, false);
    assert.deepEqual(
      validation.errors.filter((error) => error.field === "cgTax"),
      [{
        field: "cgTax",
        message: "資本利得稅率必須介於 0%（含）與 100%（不含）之間。",
        severity: "error",
      }],
    );
  }
});

test("missing and non-finite tax inputs retain the existing fallback path", () => {
  for (const value of [undefined, Number.NaN, Number.POSITIVE_INFINITY]) {
    const validation = validateInputBoundaries({ ...validPlan, cgTax: value });
    assert.equal(validation.errors.some((error) => error.field === "cgTax"), false);

    const readiness = calculateRetirementReadiness({ ...validPlan, cgTax: value });
    assert.equal(readiness.cgTax, 0);
    assert.equal(readiness.rCG, 0);
  }
});

test("gross-up remains deterministic and finite for valid rates", () => {
  assert.equal(grossUpWithdrawalForTax(1_000_000, 0), 1_000_000);
  assert.equal(grossUpWithdrawalForTax(1_000_000, 0.2), 1_250_000);
  assert.equal(Number.isFinite(grossUpWithdrawalForTax(1_000_000, 0.99999)), true);
  assert.equal(Number.isFinite(grossUpWithdrawalForTax(Number.MAX_SAFE_INTEGER, 0.2)), true);
});

test("projection helpers reject invalid fractional rates before producing output", () => {
  for (const value of [-0.01, 1, 1.2, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.equal(isValidCapitalGainsTaxRate(value), false);
    assert.throws(
      () => grossUpWithdrawalForTax(1_000_000, value),
      /Capital gains tax rate must be at least 0 and less than 1/,
    );
    assert.throws(() => runProjection(10_000_000, 0.05, 0.025, value, 1_000_000, 30));
    assert.throws(() => runBearScenario(10_000_000, 0.05, 0.025, value, 1_000_000, 30));
    assert.throws(() => runMC(10_000_000, 0.05, 0.025, value, 1_000_000, 30, 10));
  }
});

test("invalid finite percentages cannot produce FIRE results", () => {
  for (const cgTax of [-1, 100, 120]) {
    assert.equal(calculateResults({ ...validPlan, cgTax }), null);
  }

  const validResult = calculateResults(validPlan);
  assert.ok(validResult);
  assert.equal(Number.isFinite(validResult.grossAtRet), true);
  assert.equal(Number.isFinite(validResult.lifetimeTax), true);
  assert.equal(validResult.baseData.every(Number.isFinite), true);
  assert.equal(validResult.bearData.every(Number.isFinite), true);
  assert.equal(validResult.mcData.every(Number.isFinite), true);
});

test("readiness rejects invalid finite rates", () => {
  assert.equal(calculateRetirementReadiness({ ...validPlan, cgTax: 100 }), null);
  assert.equal(calculateRetirementReadiness({ ...validPlan, cgTax: 120 }), null);
  assert.equal(calculateRetirementReadiness({ ...validPlan, cgTax: -1 }), null);
});
