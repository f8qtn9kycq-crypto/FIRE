import test from "node:test";
import assert from "node:assert/strict";
import { sampleSimpleAnnualReturn, SIMPLE_MODEL_ID, SIMPLE_MODEL_VOLATILITY } from "../src/utils/monteCarloModel.js";

test("current Monte Carlo model exposes an explicit calibration seam", () => {
  assert.equal(SIMPLE_MODEL_ID, "simple-uniform-v1");
  assert.equal(sampleSimpleAnnualReturn(0.05, 0), 0);
  assert.equal(sampleSimpleAnnualReturn(0.05, 1), 0.1);
  assert.equal(SIMPLE_MODEL_VOLATILITY, 0.1);
});

test("simple model keeps returns within the documented range", () => {
  const samples = [0, 0.25, 0.5, 0.75, 1].map((value) => sampleSimpleAnnualReturn(0.05, value));
  assert.deepEqual(samples, [0, 0.025, 0.05, 0.07500000000000001, 0.1]);
});
