import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { calculateResults } from "../src/utils/fireEngine.js";
import { calculateRetirementReadiness, findEarliestRetirementAgeForPlan } from "../src/utils/retirementReadiness.js";

const basePlan = {
  age: 40, lifeExp: 95, retAge: 65,
  cash: 0, investments: 100, annualContrib: 100, expenses: 100,
  retPre: 0, inf: 0, swr: 4,
  currencyCode: "TWD", cgTax: 0,
};

test("uses the current readiness formula for a candidate retirement age", () => {
  const result = calculateRetirementReadiness(basePlan, 64);
  assert.equal(result.portAtRet, 25_000_000);
  assert.equal(result.fireTarget, 25_000_000);
  assert.equal(result.fireReadyAtRet, true);
  assert.equal(result.contributionPeriods, 24);
});

test("preserves the existing default plan-end fallback", () => {
  const result = calculateResults({ ...basePlan, lifeExp: 0 });
  assert.equal(result.portAtRet, 26_000_000);
  assert.equal(result.fireTarget, 25_000_000);
  assert.equal(result.retirementAssetBreakdown.contributionPeriods, 25);
  assert.equal(result.earliestRetirementAge.maxRetirementAge, 94);

  const zeroWithdrawalRate = calculateResults({ ...basePlan, swr: 0 });
  assert.equal(zeroWithdrawalRate.fireTarget, Number.POSITIVE_INFINITY);
  assert.equal(zeroWithdrawalRate.fireReadyAtRet, false);
  assert.equal(zeroWithdrawalRate.earliestRetirementAge.status, "not_found");
});

test("preserves whole contribution-period counting for fractional ages", () => {
  const result = calculateRetirementReadiness({ ...basePlan, age: 40.2 }, 41);
  assert.ok(Math.abs(result.yToRet - 0.8) < 1e-12);
  assert.equal(result.contributionPeriods, 1);
  assert.equal(result.investmentsAtRet, 2_000_000);
});

test("distinguishes already-ready, later-ready, not-found, and invalid plans", () => {
  const alreadyReady = findEarliestRetirementAgeForPlan({ ...basePlan, cash: 2_500, investments: 0, annualContrib: 0 });
  assert.equal(alreadyReady.age, 40);
  assert.equal(alreadyReady.reason, "already-ready");
  assert.equal(alreadyReady.maxRetirementAge, 94);

  const laterReady = findEarliestRetirementAgeForPlan(basePlan);
  assert.equal(laterReady.age, 64);
  assert.equal(basePlan.retAge, 65);

  const notFound = findEarliestRetirementAgeForPlan({ ...basePlan, lifeExp: 45, annualContrib: 0 });
  assert.deepEqual(notFound, {
    status: "not_found",
    age: null,
    checkedAges: 5,
    reason: "no-qualifying-age",
    maxRetirementAge: 44,
  });

  const invalid = findEarliestRetirementAgeForPlan({ ...basePlan, investments: 0 });
  assert.equal(invalid.status, "invalid");
  assert.equal(invalid.reason, "invalid-readiness-inputs");
  assert.equal(invalid.checkedAges, 0);
});

test("includes the last whole retirement age below a fractional plan end", () => {
  const result = findEarliestRetirementAgeForPlan({ ...basePlan, lifeExp: 45.5, annualContrib: 0 });
  assert.equal(result.maxRetirementAge, 45);
  assert.equal(result.checkedAges, 6);
});

test("candidate search stays deterministic and excludes Monte Carlo work", async () => {
  const first = findEarliestRetirementAgeForPlan(basePlan);
  const source = await readFile(new URL("../src/utils/retirementReadiness.js", import.meta.url), "utf8");
  assert.deepEqual(first, findEarliestRetirementAgeForPlan(basePlan));
  assert.doesNotMatch(source, /runMC|monteCarlo/i);
});

test("result storytelling distinguishes found, not-found, and invalid states", async () => {
  const source = await readFile(new URL("../src/components/EarliestRetirementStory.jsx", import.meta.url), "utf8");
  assert.match(source, /最早約.*歲可退休/);
  assert.match(source, /目前範圍內尚未找到達標年齡/);
  assert.match(source, /目前無法反推退休年齡/);
  assert.match(source, /不代表保證/);
  assert.match(source, /不代表你無法退休/);
  assert.match(source, /從你現在的年齡開始，一歲一歲試算/);
  assert.match(source, /「長期規劃到幾歲」的前一歲/);
});
