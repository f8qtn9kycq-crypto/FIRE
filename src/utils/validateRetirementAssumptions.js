export const DEFAULT_PLAN_END_AGE = 95;
export const SUPPORT_MAX_AGE = 120;

export const WARNING_LEVELS = {
  NONE: "none",
  INFO: "info",
  CAUTION: "caution",
  WARNING: "warning",
};

const RISK_RANK = {
  [WARNING_LEVELS.NONE]: 0,
  [WARNING_LEVELS.INFO]: 1,
  [WARNING_LEVELS.CAUTION]: 2,
  [WARNING_LEVELS.WARNING]: 3,
};

function maxRisk(current, next) {
  return RISK_RANK[next] > RISK_RANK[current] ? next : current;
}

function isFilledNumber(value) {
  return Number.isFinite(value) && value > 0;
}

export function validateInputBoundaries(inputs) {
  const errors = [];
  const age = Number(inputs.age) || 0;
  const retAge = Number(inputs.retAge) || 0;
  const lifeExp = Number(inputs.lifeExp) || DEFAULT_PLAN_END_AGE;

  if (age <= 0) {
    errors.push({ field: "age", message: "目前年齡必須大於 0。", severity: "error" });
  }

  if (age > SUPPORT_MAX_AGE) {
    errors.push({ field: "age", message: `目前年齡超過系統上限 ${SUPPORT_MAX_AGE} 歲。`, severity: "error" });
  }

  if (isFilledNumber(age) && isFilledNumber(retAge) && retAge < age) {
    errors.push({ field: "retAge", message: "退休年齡不能小於目前年齡。", severity: "error" });
  }

  if (isFilledNumber(retAge) && lifeExp <= retAge) {
    errors.push({ field: "lifeExp", message: "長期規劃年齡必須大於退休年齡。", severity: "error" });
  }

  if (lifeExp > SUPPORT_MAX_AGE) {
    errors.push({ field: "lifeExp", message: `長期規劃年齡不能超過 ${SUPPORT_MAX_AGE} 歲。`, severity: "error" });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function assessLifeExpectancyRisk(inputs) {
  const warnings = [];
  const recommendations = [];
  let riskLevel = WARNING_LEVELS.NONE;

  const age = Number(inputs.age) || 0;
  const retAge = Number(inputs.retAge) || age;
  const lifeExp = Number(inputs.lifeExp) || DEFAULT_PLAN_END_AGE;
  const retirementYears = lifeExp - retAge;

  if (!isFilledNumber(age) || !isFilledNumber(retAge) || retirementYears <= 0) {
    return { riskLevel, warnings, recommendations };
  }

  if (retirementYears <= 20) {
    riskLevel = maxRisk(riskLevel, WARNING_LEVELS.INFO);
    warnings.push({
      level: WARNING_LEVELS.INFO,
      message: `退休後規劃期約 ${retirementYears} 年，時間偏短。`,
      code: "SHORT_RETIREMENT_HORIZON",
    });
    recommendations.push(`若希望保守一點，可把長期規劃年齡調高到 ${DEFAULT_PLAN_END_AGE} 歲或以上。`);
  }

  if (age > 60 && lifeExp < 90) {
    riskLevel = maxRisk(riskLevel, WARNING_LEVELS.CAUTION);
    warnings.push({
      level: WARNING_LEVELS.CAUTION,
      message: `目前 ${age} 歲，規劃到 ${lifeExp} 歲可能低估長壽風險。`,
      code: "UNDERESTIMATED_LONGEVITY_RISK",
    });
    recommendations.push("建議至少檢查規劃到 90-95 歲的結果，避免退休後期資金壓力被低估。");
  }

  if (age > 75 && lifeExp <= age + 5) {
    riskLevel = maxRisk(riskLevel, WARNING_LEVELS.WARNING);
    warnings.push({
      level: WARNING_LEVELS.WARNING,
      message: `目前 ${age} 歲，但只規劃到 ${lifeExp} 歲，緩衝非常短。`,
      code: "CRITICAL_LONGEVITY_MISMATCH",
    });
    recommendations.push("請確認是否有退休金、家人支持、保險或其他現金流作為後備。");
  }

  if (retAge === age && lifeExp - age < 30) {
    riskLevel = maxRisk(riskLevel, WARNING_LEVELS.CAUTION);
    warnings.push({
      level: WARNING_LEVELS.CAUTION,
      message: `立即退休模式下，規劃期只有 ${lifeExp - age} 年。`,
      code: "SHORT_IMMEDIATE_RETIREMENT",
    });
    recommendations.push("立即退休者通常需要更長的測試期，建議至少檢查 30 年以上。");
  }

  return {
    riskLevel,
    warnings,
    recommendations,
  };
}

export function validateAndAssess(inputs) {
  const boundaries = validateInputBoundaries(inputs);
  const lifeExpectancy = assessLifeExpectancyRisk(inputs);

  return {
    hasErrors: !boundaries.isValid,
    boundaryErrors: boundaries.errors,
    lifeExpectancyRisks: lifeExpectancy,
  };
}

export function suggestAutoCorrection(inputs) {
  const corrected = { ...inputs };
  const changedFields = [];
  const age = Number(corrected.age) || 0;
  const retAge = Number(corrected.retAge) || 0;

  if (age > 0 && retAge > 0 && corrected.retAge < corrected.age) {
    corrected.retAge = corrected.age;
    changedFields.push({
      field: "retAge",
      oldValue: inputs.retAge,
      newValue: corrected.retAge,
      reason: "退休年齡不能早於目前年齡",
    });
  }

  if (corrected.lifeExp <= Math.max(age, corrected.retAge || 0)) {
    corrected.lifeExp = Math.max(DEFAULT_PLAN_END_AGE, age + 1, (corrected.retAge || 0) + 1);
    changedFields.push({
      field: "lifeExp",
      oldValue: inputs.lifeExp,
      newValue: corrected.lifeExp,
      reason: "長期規劃年齡必須晚於目前年齡與退休年齡",
    });
  }

  if (corrected.lifeExp > SUPPORT_MAX_AGE) {
    corrected.lifeExp = SUPPORT_MAX_AGE;
    changedFields.push({
      field: "lifeExp",
      oldValue: inputs.lifeExp,
      newValue: corrected.lifeExp,
      reason: "長期規劃年齡超過系統上限",
    });
  }

  return {
    corrected,
    changedFields,
    hasAutoCorrections: changedFields.length > 0,
  };
}

export function generateValidationSummary(validationResult) {
  const { hasErrors, boundaryErrors, lifeExpectancyRisks } = validationResult;

  if (hasErrors) {
    return {
      statusText: "輸入需要修正",
      alertType: "error",
      details: boundaryErrors.map((error) => error.message),
    };
  }

  const { riskLevel, warnings, recommendations } = lifeExpectancyRisks;
  if (riskLevel === WARNING_LEVELS.WARNING) {
    return {
      statusText: "長期規劃年齡風險較高",
      alertType: "warning",
      details: [...warnings.map((warning) => warning.message), ...recommendations.slice(0, 2)],
    };
  }

  if (riskLevel === WARNING_LEVELS.CAUTION || riskLevel === WARNING_LEVELS.INFO) {
    return {
      statusText: "請確認長期規劃年齡",
      alertType: riskLevel,
      details: [...warnings.map((warning) => warning.message), ...recommendations.slice(0, 1)],
    };
  }

  return {
    statusText: "輸入有效",
    alertType: "success",
    details: [],
  };
}
