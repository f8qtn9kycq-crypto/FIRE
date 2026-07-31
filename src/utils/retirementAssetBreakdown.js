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

export function reconcileRetirementAssetBreakdownForDisplay(assetBreakdown, roundMoney) {
  const sourceKeys = [
    "cashAtRetirement",
    "startingInvestmentPrincipal",
    "cumulativeContributions",
    "projectedInvestmentGrowth",
  ];
  const rounded = Object.fromEntries(
    sourceKeys.map((key) => [key, roundMoney(assetBreakdown[key])]),
  );
  const roundedTotal = roundMoney(assetBreakdown.total);
  const roundedSourceTotal = sourceKeys.reduce((sum, key) => sum + rounded[key], 0);
  const adjustmentKey = sourceKeys.reduce((largestKey, key) =>
    Math.abs(assetBreakdown[key]) > Math.abs(assetBreakdown[largestKey]) ? key : largestKey,
  );

  rounded[adjustmentKey] += roundedTotal - roundedSourceTotal;

  return {
    ...assetBreakdown,
    ...rounded,
    total: roundedTotal,
  };
}
