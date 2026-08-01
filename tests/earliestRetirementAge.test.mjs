import assert from "node:assert/strict";
import test from "node:test";
import { findEarliestRetirementAge } from "../src/utils/earliestRetirementAge.js";

test("returns the current age when the plan is already ready", () => {
  const result = findEarliestRetirementAge({
    currentAge: 45,
    maxRetirementAge: 70,
    isReadyAtAge: () => true,
  });

  assert.deepEqual(result, {
    status: "found",
    age: 45,
    checkedAges: 1,
    reason: "already-ready",
  });
});

test("returns the first qualifying integer age and stops evaluating", () => {
  const checked = [];
  const result = findEarliestRetirementAge({
    currentAge: 40,
    maxRetirementAge: 70,
    isReadyAtAge: (age) => {
      checked.push(age);
      return age >= 58;
    },
  });

  assert.equal(result.age, 58);
  assert.equal(result.checkedAges, 19);
  assert.deepEqual(checked, Array.from({ length: 19 }, (_, index) => 40 + index));
});

test("returns an explicit not-found result after checking the full range", () => {
  const result = findEarliestRetirementAge({
    currentAge: 65,
    maxRetirementAge: 67,
    isReadyAtAge: () => false,
  });

  assert.deepEqual(result, {
    status: "not_found",
    age: null,
    checkedAges: 3,
    reason: "no-qualifying-age",
  });
});

test("normalizes fractional boundaries to candidate integer ages", () => {
  const checked = [];
  const result = findEarliestRetirementAge({
    currentAge: 40.2,
    maxRetirementAge: 42.9,
    isReadyAtAge: (age) => {
      checked.push(age);
      return false;
    },
  });

  assert.equal(result.status, "not_found");
  assert.deepEqual(checked, [41, 42]);
});

test("rejects invalid boundaries without evaluating the predicate", () => {
  let calls = 0;
  const predicate = () => {
    calls += 1;
    return true;
  };
  const cases = [
    { currentAge: Number.NaN, maxRetirementAge: 70 },
    { currentAge: 40, maxRetirementAge: Number.POSITIVE_INFINITY },
    { currentAge: 70, maxRetirementAge: 69 },
    { currentAge: 0, maxRetirementAge: 70 },
    { currentAge: -1, maxRetirementAge: 70 },
  ];

  for (const boundaries of cases) {
    assert.equal(
      findEarliestRetirementAge({ ...boundaries, isReadyAtAge: predicate }).status,
      "invalid",
    );
  }

  assert.equal(calls, 0);
});

test("rejects a missing readiness predicate deterministically", () => {
  assert.deepEqual(findEarliestRetirementAge({ currentAge: 40, maxRetirementAge: 70 }), {
    status: "invalid",
    age: null,
    checkedAges: 0,
    reason: "missing-readiness-predicate",
  });
});

test("produces the same result for the same deterministic predicate", () => {
  const input = {
    currentAge: 50,
    maxRetirementAge: 80,
    isReadyAtAge: (age) => age === 63,
  };

  assert.deepEqual(findEarliestRetirementAge(input), findEarliestRetirementAge(input));
});
