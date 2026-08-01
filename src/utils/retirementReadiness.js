import { findEarliestRetirementAge } from "./earliestRetirementAge.js";
import { CURRENCIES, moneyWanToTwd } from "./formatters.js";

export const defaultCgTaxForCurrency = (currencyCode) => (currencyCode === "TWD" ? 0 : 20);

function hasValidReadinessInputs(inp, retirementAge) {
  const finiteInputs = [
    inp?.age,
    inp?.lifeExp,
    inp?.cash,
    inp?.investments,
    inp?.expenses,
    inp?.annualContrib,
    inp?.retPre,
    inp?.inf,
    inp?.swr,
  ];

  return (
    finiteInputs.every(Number.isFinite) &&
    inp.age > 0 &&
    Number.isFinite(retirementAge) &&
    retirementAge >= inp.age &&
    Number.isFinite(inp.lifeExp) &&
    retirementAge < inp.lifeExp &&
    (inp.cash > 0 || inp.investments > 0) &&
    inp.expenses > 0 &&
    inp.swr > 0
  );
}

export function calculateRetirementReadiness(inp, retirementAge = inp?.retAge) {
  if (!hasValidReadinessInputs(inp, retirementAge)) return null;

  const currency = CURRENCIES[inp.currencyCode] || CURRENCIES.TWD;
  const cgTax = Number.isFinite(inp.cgTax) ? inp.cgTax : defaultCgTaxForCurrency(currency.code);
  const cash = moneyWanToTwd(inp.cash, currency);
  const investments = moneyWanToTwd(inp.investments, currency);
  const expenses = moneyWanToTwd(inp.expenses, currency);
  const annualContrib = moneyWanToTwd(inp.annualContrib, currency);
  const rPre = inp.retPre / 100;
  const rInf = inp.inf / 100;
  const yToRet = Math.max(0, retirementAge - inp.age);
  const retirementExpenses = expenses * Math.pow(1 + rInf, yToRet);

  let investmentsAtRet = investments;
  let contributionPeriods = 0;
  for (let year = 0; year < yToRet; year += 1) {
    investmentsAtRet = investmentsAtRet * (1 + rPre) + annualContrib;
    contributionPeriods += 1;
  }

  const saved = cash + investments;
  const portAtRet = cash + investmentsAtRet;
  const currentFireTarget = expenses / (inp.swr / 100);
  const fireTarget = retirementExpenses / (inp.swr / 100);

  return {
    cash,
    investments,
    annualContrib,
    expenses,
    saved,
    investmentsAtRet,
    contributionPeriods,
    portAtRet,
    currentFireTarget,
    fireTarget,
    retirementExpenses,
    yToRet,
    currency,
    cgTax,
    rPre,
    rInf,
    rCG: cgTax / 100,
    currentAlreadyFIRE: saved >= currentFireTarget,
    fireReadyAtRet: portAtRet >= fireTarget,
  };
}

export function findEarliestRetirementAgeForPlan(inp) {
  const maxRetirementAge = Math.ceil(inp?.lifeExp) - 1;
  if (!hasValidReadinessInputs(inp, Math.ceil(inp?.age))) {
    return {
      status: "invalid",
      age: null,
      checkedAges: 0,
      reason: "invalid-readiness-inputs",
      maxRetirementAge,
    };
  }

  const result = findEarliestRetirementAge({
    currentAge: inp?.age,
    maxRetirementAge,
    isReadyAtAge: (retirementAge) =>
      calculateRetirementReadiness(inp, retirementAge)?.fireReadyAtRet === true,
  });

  return { ...result, maxRetirementAge };
}
