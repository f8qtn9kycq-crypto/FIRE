import { runMC } from "./monteCarlo.js";
import { buildScenarioResults, runBearScenario } from "./scenarios.js";
import { CURRENCIES, moneyWanToTwd, twdToMoneyWan } from "./formatters.js";
import { buildRetirementAssetBreakdown } from "./retirementAssetBreakdown.js";
import {
  calculateRetirementReadiness,
  defaultCgTaxForCurrency,
  findEarliestRetirementAgeForPlan,
} from "./retirementReadiness.js";
import {
  DEFAULT_PLAN_END_AGE as VALIDATION_DEFAULT_PLAN_END_AGE,
  SUPPORT_MAX_AGE as VALIDATION_SUPPORT_MAX_AGE,
  generateValidationSummary,
  suggestAutoCorrection,
  validateAndAssess,
} from "./validateRetirementAssumptions.js";

export const DEFAULT_PLAN_END_AGE = VALIDATION_DEFAULT_PLAN_END_AGE;
export const SUPPORT_MAX_AGE = VALIDATION_SUPPORT_MAX_AGE;

export const initialInputs = {
  age: 0,
  lifeExp: DEFAULT_PLAN_END_AGE,
  cash: 0,
  investments: 0,
  income: 0,
  expenses: 0,
  annualContrib: 0,
  retAge: 0,
  retPre: 7,
  retPost: 5,
  swr: 3.5,
  inf: 2.5,
  incTax: 40,
  currencyCode: "TWD",
  cgTax: 0,
};

export { defaultCgTaxForCurrency };

const INPUT_NUMBER_FIELDS = [
  "age",
  "lifeExp",
  "cash",
  "investments",
  "income",
  "expenses",
  "annualContrib",
  "retAge",
  "retPre",
  "retPost",
  "swr",
  "inf",
  "incTax",
  "cgTax",
];

export const MONEY_INPUT_FIELDS = ["cash", "investments", "income", "expenses", "annualContrib"];

export function normalizeInputs(value = {}) {
  const hadCurrency = Boolean(value.currencyCode);
  const merged = { ...initialInputs, ...value };
  merged.currencyCode = CURRENCIES[merged.currencyCode] ? merged.currencyCode : "TWD";

  for (const field of INPUT_NUMBER_FIELDS) {
    const parsed = parseFloat(merged[field]);
    merged[field] = Number.isFinite(parsed) ? parsed : initialInputs[field];
  }

  const autoCorrection = suggestAutoCorrection(merged);
  if (autoCorrection.hasAutoCorrections) {
    console.warn("[normalizeInputs] Auto-corrections applied:", autoCorrection.changedFields);
    Object.assign(merged, autoCorrection.corrected);
  }

  if (!hadCurrency) {
    merged.cgTax = defaultCgTaxForCurrency(merged.currencyCode);
  }

  return merged;
}

export function parseInputsFromSearch(search) {
  if (!search) return null;

  const params = new URLSearchParams(search);
  if (params.get("blank") === "1") return normalizeInputs(initialInputs);
  const next = {};
  let found = false;

  for (const field of INPUT_NUMBER_FIELDS) {
    if (!params.has(field)) continue;
    next[field] = params.get(field);
    found = true;
  }

  if (params.has("currencyCode")) {
    next.currencyCode = params.get("currencyCode");
    found = true;
  }

  return found ? normalizeInputs(next) : null;
}

export function serializeInputsToSearch(inputs) {
  const params = new URLSearchParams();

  for (const field of INPUT_NUMBER_FIELDS) {
    params.set(field, String(inputs[field] ?? initialInputs[field]));
  }

  params.set("currencyCode", inputs.currencyCode || "TWD");
  return params.toString();
}

export function convertMoneyInputsForCurrency(inputs, nextCurrencyCode) {
  const currentCurrency = CURRENCIES[inputs.currencyCode] || CURRENCIES.TWD;
  const nextCurrency = CURRENCIES[nextCurrencyCode] || CURRENCIES.TWD;
  const converted = { ...inputs, currencyCode: nextCurrency.code };

  for (const field of MONEY_INPUT_FIELDS) {
    converted[field] = twdToMoneyWan(moneyWanToTwd(inputs[field], currentCurrency), nextCurrency);
  }

  converted.cgTax = defaultCgTaxForCurrency(nextCurrency.code);
  return converted;
}

export function isReady(inp) {
  return (
    inp.age > 0 &&
    inp.retAge >= inp.age &&
    (inp.cash > 0 || inp.investments > 0) &&
    inp.expenses > 0
  );
}

const REQUIRED_INPUT_FIELDS = [
  { key: "age", focusKey: "age", label: "目前年齡", isComplete: (inp) => inp.age > 0 },
  { key: "retAge", focusKey: "retAge", label: "退休年齡", isComplete: (inp) => inp.retAge > 0 },
  {
    key: "assets",
    focusKey: "cash",
    label: "現金或投資總額",
    isComplete: (inp) => inp.cash > 0 || inp.investments > 0,
  },
  { key: "expenses", focusKey: "expenses", label: "退休生活費", isComplete: (inp) => inp.expenses > 0 },
];

export function getInputCompletion(inp) {
  const fields = REQUIRED_INPUT_FIELDS.map(({ isComplete, ...field }) => ({
    ...field,
    isComplete: isComplete(inp),
  }));
  const completedCount = fields.filter((field) => field.isComplete).length;

  return {
    fields,
    completedCount,
    totalCount: fields.length,
    allComplete: completedCount === fields.length,
    firstMissing: fields.find((field) => !field.isComplete) || null,
  };
}

export function validateInputsForDisplay(inp) {
  return validateAndAssess(inp);
}

export function getValidationAlert(inp) {
  return generateValidationSummary(validateInputsForDisplay(inp));
}

function supportAgeFromSeries(series, retAge, maxAge) {
  const depletedIndex = series.findIndex((value, index) => index > 0 && value <= 0);
  if (depletedIndex === -1) {
    return { age: maxAge, label: `至少 ${maxAge} 歲`, depleted: false };
  }

  const age = retAge + depletedIndex;
  return { age, label: `${age} 歲`, depleted: true };
}

export function runProjection(saved, retPost, inf, cgTax, expenses, retYears, shockYr1 = 0) {
  let p = saved * (1 + shockYr1);
  const out = [Math.round(p)];

  for (let y = 1; y <= retYears; y++) {
    const adjExp = expenses * Math.pow(1 + inf, y);
    const grossW = adjExp / (1 - cgTax);
    p = Math.max(0, p * (1 + retPost) - grossW);
    out.push(Math.round(p));
  }

  return out;
}

export function getRiskScores({ inp, res }) {
  const { bearData, portAtRet, retYears } = res;
  const bearOk = bearData[bearData.length - 1] > 0;

  return {
    withdrawal: inp.swr <= 3 ? 15 : inp.swr <= 3.5 ? 30 : inp.swr <= 4 ? 50 : 75,
    sequence: bearData[bearData.length - 1] > portAtRet * 0.5 ? 20 : bearOk ? 45 : 85,
    inflation: Math.min(100, (inp.inf / 6) * 100),
    longevity: Math.min(100, (retYears / 50) * 100),
  };
}

export function calculateResults(inp) {
  if (!isReady(inp)) return null;

  const validation = validateInputsForDisplay(inp);
  if (validation.hasErrors) return null;

  const validationAlert = generateValidationSummary(validation);
  const { age, retAge, retPost, swr, inf } = inp;
  const lifeExp = Math.max(inp.lifeExp || DEFAULT_PLAN_END_AGE, retAge + 1);
  const calculationInputs = lifeExp === inp.lifeExp ? inp : { ...inp, lifeExp };
  const readiness = calculateRetirementReadiness(calculationInputs, retAge);
  if (!readiness) return null;
  const {
    annualContrib,
    cash,
    contributionPeriods,
    currency,
    currentAlreadyFIRE,
    currentFireTarget,
    expenses,
    fireReadyAtRet,
    fireTarget,
    investments,
    investmentsAtRet,
    portAtRet,
    retirementExpenses,
    rCG,
    saved,
    yToRet,
  } = readiness;
  const rPost = retPost / 100;
  const rInf = inf / 100;
  const retYears = Math.max(1, lifeExp - retAge);
  const retirementAssetBreakdown = buildRetirementAssetBreakdown({
    cash,
    initialInvestments: investments,
    annualContribution: annualContrib,
    contributionPeriods,
    investmentsAtRetirement: investmentsAtRet,
  });

  const baseData = runProjection(portAtRet, rPost, rInf, rCG, retirementExpenses, retYears);
  const bearData = runBearScenario(portAtRet, rPost, rInf, rCG, retirementExpenses, retYears);
  const supportYears = Math.max(1, SUPPORT_MAX_AGE - retAge);
  const baseSupportData = runProjection(portAtRet, rPost, rInf, rCG, retirementExpenses, supportYears);
  const bearSupportData = runBearScenario(portAtRet, rPost, rInf, rCG, retirementExpenses, supportYears);
  const baseSupport = supportAgeFromSeries(baseSupportData, retAge, SUPPORT_MAX_AGE);
  const bearSupport = supportAgeFromSeries(bearSupportData, retAge, SUPPORT_MAX_AGE);
  const spendData = Array.from({ length: retYears + 1 }, (_, y) =>
    Math.round(retirementExpenses * Math.pow(1 + rInf, y)),
  );
  const mcData = runMC(
    portAtRet,
    rPost,
    rInf,
    rCG,
    retirementExpenses,
    retYears,
    300,
    JSON.stringify({ age, lifeExp, retAge, rPost, rInf, rCG, retirementExpenses, portAtRet }),
  );
  const grossAtRet = Math.round(retirementExpenses / (1 - rCG));
  const taxDrag = grossAtRet - retirementExpenses;
  const lifetimeTax = Math.round(taxDrag * retYears * Math.pow(1 + rInf, retYears / 2));
  const assessmentPortfolio = portAtRet;

  return {
    portAtRet,
    fireTarget,
    baseData,
    bearData,
    baseSupport,
    bearSupport,
    spendData,
    mcData,
    yToRet,
    retYears,
    rCG,
    currency,
    grossAtRet,
    taxDrag,
    lifetimeTax,
    cashRaw: cash,
    investmentsRaw: investments,
    investmentsAtRet,
    retirementAssetBreakdown,
    savedRaw: saved,
    expensesRaw: expenses,
    retirementExpensesRaw: retirementExpenses,
    currentFireTarget,
    assessmentPortfolio,
    assessmentGap: assessmentPortfolio - fireTarget,
    grossW: assessmentPortfolio * (swr / 100),
    netW: assessmentPortfolio * (swr / 100) * (1 - rCG),
    currentAlreadyFIRE,
    fireReadyAtRet,
    alreadyFIRE: fireReadyAtRet,
    earliestRetirementAge: findEarliestRetirementAgeForPlan(calculationInputs),
    validationAlert,
    lifeExpectancyRisk: validation.lifeExpectancyRisks,
    scenarioResults: buildScenarioResults({
      portAtRet,
      retPost,
      inf,
      rCG,
      expenses: retirementExpenses,
      retYears,
      lifeExp,
      project: runProjection,
    }),
  };
}
