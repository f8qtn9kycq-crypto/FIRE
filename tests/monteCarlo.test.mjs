import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_MONTE_CARLO_RUNS, runMC } from "../src/utils/monteCarlo.js";

const base = {
  saved: 1_000,
  retPost: 0.05,
  inf: 0.02,
  cgTax: 0.2,
  expenses: 30,
  retYears: 12,
  N: 300,
};

test("Monte Carlo audit contract is deterministic for the same inputs and seed", () => {
  const first = runMC(base.saved, base.retPost, base.inf, base.cgTax, base.expenses, base.retYears, base.N, "audit-seed");
  const second = runMC(base.saved, base.retPost, base.inf, base.cgTax, base.expenses, base.retYears, base.N, "audit-seed");

  assert.deepEqual(first, second);
  assert.equal(first.length, base.retYears);
});

test("default run count is explicit and used when omitted", () => {
  assert.equal(DEFAULT_MONTE_CARLO_RUNS, 300);
  const omitted = runMC(base.saved, base.retPost, base.inf, base.cgTax, base.expenses, base.retYears, undefined, "default-count");
  const explicit = runMC(base.saved, base.retPost, base.inf, base.cgTax, base.expenses, base.retYears, DEFAULT_MONTE_CARLO_RUNS, "default-count");
  assert.deepEqual(omitted, explicit);
});

test("Monte Carlo returns bounded whole-number percentages", () => {
  const result = runMC(base.saved, base.retPost, base.inf, base.cgTax, base.expenses, base.retYears, base.N, "bounds-seed");

  assert.ok(result.every((value) => Number.isInteger(value) && value >= 0 && value <= 100));
});

test("zero starting assets fail every positive-expense path", () => {
  const result = runMC(0, base.retPost, base.inf, base.cgTax, base.expenses, 4, base.N, "zero-assets");

  assert.deepEqual(result, [0, 0, 0, 0]);
});
