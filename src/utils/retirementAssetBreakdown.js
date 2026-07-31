function finiteOrZero(value) {
  return Number.isFinite(value) ? value : 0;
}

export function buildRetirementAssetBreakdown({
  cash,
  initialInvestments,
  annualContribution,
  contributionPeriods,
  investmentsAtRetirement,
} = {}) {
  const cashAtRetirement = finiteOrZero(cash);
  const startingInvestmentPrincipal = finiteOrZero(initialInvestments);
  const contribution = finiteOrZero(annualContribution);
  const periods = Math.max(0, Math.floor(finiteOrZero(contributionPeriods)));
  const projectedInvestments = finiteOrZero(investmentsAtRetirement);
  const cumulativeContributions = contribution * periods;
  const projectedInvestmentGrowth =
    projectedInvestments - startingInvestmentPrincipal - cumulativeContributions;

  return {
    cashAtRetirement,
    startingInvestmentPrincipal,
    cumulativeContributions,
    projectedInvestmentGrowth,
    contributionPeriods: periods,
    total: cashAtRetirement + projectedInvestments,
  };
}
