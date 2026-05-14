import { runMC } from "./monteCarlo";
import { buildScenarioResults, runBearScenario } from "./scenarios";
import { CURRENCIES, moneyWanToTwd, twdToMoneyWan } from "./formatters";

export const initialInputs = {
  age: 0,
  lifeExp: 0,
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

export const defaultCgTaxForCurrency = (currencyCode) => (currencyCode === "TWD" ? 0 : 20);

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

  if (!hadCurrency) {
    merged.cgTax = defaultCgTaxForCurrency(merged.currencyCode);
  }

  return merged;
}

export function parseInputsFromSearch(search) {
  if (!search) return null;

  const params = new URLSearchParams(search);
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
    inp.lifeExp > inp.age &&
    (inp.cash > 0 || inp.investments > 0) &&
    inp.expenses > 0 &&
    inp.retAge >= inp.age
  );
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

  const { age, lifeExp, retAge, retPre, retPost, swr, inf } = inp;
  const currency = CURRENCIES[inp.currencyCode] || CURRENCIES.TWD;
  const cgTax = Number.isFinite(inp.cgTax) ? inp.cgTax : defaultCgTaxForCurrency(currency.code);
  const cash = moneyWanToTwd(inp.cash, currency);
  const investments = moneyWanToTwd(inp.investments, currency);
  const saved = cash + investments;
  const expenses = moneyWanToTwd(inp.expenses, currency);
  const annualContrib = moneyWanToTwd(inp.annualContrib, currency);

  const rPre = retPre / 100;
  const rPost = retPost / 100;
  const rInf = inf / 100;
  const rCG = cgTax / 100;
  const yToRet = Math.max(0, retAge - age);
  const retYears = Math.max(1, lifeExp - retAge);

  let investmentsAtRet = investments;
  for (let y = 0; y < yToRet; y++) {
    investmentsAtRet = investmentsAtRet * (1 + rPre) + annualContrib;
  }

  const portAtRet = cash + investmentsAtRet;

  const fireTarget = expenses / (swr / 100);
  const baseData = runProjection(portAtRet, rPost, rInf, rCG, expenses, retYears);
  const bearData = runBearScenario(portAtRet, rPost, rInf, rCG, expenses, retYears);
  const spendData = Array.from({ length: retYears + 1 }, (_, y) =>
    Math.round(expenses * Math.pow(1 + rInf, y)),
  );
  const mcData = runMC(
    portAtRet,
    rPost,
    rInf,
    rCG,
    expenses,
    retYears,
    300,
    JSON.stringify({ age, lifeExp, retAge, rPost, rInf, rCG, expenses, portAtRet }),
  );
  const grossAtRet = Math.round(expenses / (1 - rCG));
  const taxDrag = grossAtRet - expenses;
  const lifetimeTax = Math.round(taxDrag * retYears * Math.pow(1 + rInf, retYears / 2));
  const currentAlreadyFIRE = saved >= fireTarget;
  const fireReadyAtRet = portAtRet >= fireTarget;
  const assessmentPortfolio = portAtRet;

  return {
    portAtRet,
    fireTarget,
    baseData,
    bearData,
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
    savedRaw: saved,
    expensesRaw: expenses,
    assessmentPortfolio,
    assessmentGap: assessmentPortfolio - fireTarget,
    grossW: assessmentPortfolio * (swr / 100),
    netW: assessmentPortfolio * (swr / 100) * (1 - rCG),
    currentAlreadyFIRE,
    fireReadyAtRet,
    alreadyFIRE: fireReadyAtRet,
    scenarioResults: buildScenarioResults({
      portAtRet,
      retPost,
      inf,
      rCG,
      expenses,
      retYears,
      lifeExp,
      project: runProjection,
    }),
  };
}
