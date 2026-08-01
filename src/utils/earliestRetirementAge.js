function invalidResult(reason) {
  return {
    status: "invalid",
    age: null,
    checkedAges: 0,
    reason,
  };
}

export function findEarliestRetirementAge({
  currentAge,
  maxRetirementAge,
  isReadyAtAge,
} = {}) {
  if (typeof isReadyAtAge !== "function") {
    return invalidResult("missing-readiness-predicate");
  }

  if (!Number.isFinite(currentAge) || !Number.isFinite(maxRetirementAge)) {
    return invalidResult("invalid-age-boundary");
  }

  const firstCandidateAge = Math.ceil(currentAge);
  const lastCandidateAge = Math.floor(maxRetirementAge);

  if (firstCandidateAge <= 0 || lastCandidateAge < firstCandidateAge) {
    return invalidResult("invalid-age-range");
  }

  let checkedAges = 0;

  for (let age = firstCandidateAge; age <= lastCandidateAge; age += 1) {
    checkedAges += 1;

    if (isReadyAtAge(age) === true) {
      return {
        status: "found",
        age,
        checkedAges,
        reason: age === firstCandidateAge ? "already-ready" : "first-qualifying-age",
      };
    }
  }

  return {
    status: "not_found",
    age: null,
    checkedAges,
    reason: "no-qualifying-age",
  };
}
