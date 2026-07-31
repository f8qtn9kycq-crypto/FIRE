import assert from "node:assert/strict";
import test from "node:test";
import { buildRetirementAssetBreakdown } from "../src/utils/retirementAssetBreakdown.js";

test("breaks a retirement portfolio into reconciling asset sources", () => {
  const result = buildRetirementAssetBreakdown({
    cash: 1_000_000,
    initialInvestments: 2_000_000,
    annualContribution: 100_000,
    contributionPeriods: 10,
    investmentsAtRetirement: 4_500_000,
  });

  assert.deepEqual(result, {
    cashAtRetirement: 1_000_000,
    startingInvestmentPrincipal: 2_000_000,
    cumulativeContributions: 1_000_000,
    projectedInvestmentGrowth: 1_500_000,
    contributionPeriods: 10,
    total: 5_500_000,
  });
});

test("immediate retirement adds no future contributions", () => {
  const result = buildRetirementAssetBreakdown({
    cash: 300_000,
    initialInvestments: 700_000,
    annualContribution: 120_000,
    contributionPeriods: 0,
    investmentsAtRetirement: 700_000,
  });

  assert.equal(result.cumulativeContributions, 0);
  assert.equal(result.projectedInvestmentGrowth, 0);
  assert.equal(result.total, 1_000_000);
});

test("supports zero assets and negative projected growth without clamping", () => {
  const result = buildRetirementAssetBreakdown({
    cash: 0,
    initialInvestments: 1_000_000,
    annualContribution: 100_000,
    contributionPeriods: 2,
    investmentsAtRetirement: 900_000,
  });

  assert.equal(result.cumulativeContributions, 200_000);
  assert.equal(result.projectedInvestmentGrowth, -300_000);
  assert.equal(result.total, 900_000);
});

test("normalizes missing and non-finite values deterministically", () => {
  const result = buildRetirementAssetBreakdown({
    cash: Number.NaN,
    initialInvestments: undefined,
    annualContribution: Number.POSITIVE_INFINITY,
    contributionPeriods: -4,
    investmentsAtRetirement: undefined,
  });

  assert.deepEqual(result, {
    cashAtRetirement: 0,
    startingInvestmentPrincipal: 0,
    cumulativeContributions: 0,
    projectedInvestmentGrowth: 0,
    contributionPeriods: 0,
    total: 0,
  });
});

test("keeps unusually large values reconcilable", () => {
  const result = buildRetirementAssetBreakdown({
    cash: 1_000_000_000_000,
    initialInvestments: 2_000_000_000_000,
    annualContribution: 100_000_000_000,
    contributionPeriods: 40,
    investmentsAtRetirement: 9_000_000_000_000,
  });

  const sourceTotal =
    result.cashAtRetirement +
    result.startingInvestmentPrincipal +
    result.cumulativeContributions +
    result.projectedInvestmentGrowth;

  assert.equal(sourceTotal, result.total);
  assert.equal(result.total, 10_000_000_000_000);
});
