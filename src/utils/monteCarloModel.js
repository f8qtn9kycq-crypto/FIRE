// The current model is intentionally explicit so a future historical calibration
// can replace this sampler without changing withdrawal or survival bookkeeping.
export const SIMPLE_MODEL_VOLATILITY = 0.1;
export const SIMPLE_MODEL_ID = "simple-uniform-v1";

export function sampleSimpleAnnualReturn(expectedReturn, randomValue) {
  return expectedReturn + (randomValue - 0.5) * SIMPLE_MODEL_VOLATILITY;
}
