function clampIndex(index, data) {
  if (!data?.length) return 0;
  return Math.max(0, Math.min(index, data.length - 1));
}

function milestoneValue(data, retAge, age) {
  return data?.[clampIndex(age - retAge, data)] ?? 0;
}

export function buildReadinessBreakdown(inp, res) {
  if (!inp || !res) return null;

  const mcSuccess = res.mcData?.length ? res.mcData[res.mcData.length - 1] : null;
  const achievementRate = Math.max(0, Math.round((res.assessmentPortfolio / Math.max(res.fireTarget, 1)) * 100));
  const netWithdrawal = res.netW ?? res.assessmentPortfolio * (inp.swr / 100) * (1 - (res.rCG || 0));
  const grossWithdrawal = res.grossW ?? res.assessmentPortfolio * (inp.swr / 100);
  const spending = res.retirementExpensesRaw || 0;
  const surplus = Math.max(0, netWithdrawal - spending);
  const shortfall = Math.max(0, spending - netWithdrawal);
  const planEndAge = inp.lifeExp || inp.retAge + res.retYears;
  const milestoneAges = Array.from(new Set([inp.retAge, 65, 80, planEndAge]))
    .filter((age) => Number.isFinite(age) && age >= inp.retAge)
    .sort((a, b) => a - b);

  return {
    fireReadyAtRet: Boolean(res.fireReadyAtRet),
    achievementRate,
    grossWithdrawal,
    netWithdrawal,
    spending,
    surplus,
    shortfall,
    planEndAge,
    baselineOk: (res.baseData?.[res.baseData.length - 1] || 0) > 0,
    bearMarketOk: (res.bearData?.[res.bearData.length - 1] || 0) > 0,
    mcSuccess,
    milestones: milestoneAges.map((age) => ({
      age,
      label: age === inp.retAge ? `${age}歲（退休時）` : age === planEndAge ? `${age}歲（長期規劃）` : `${age}歲`,
      baseline: milestoneValue(res.baseData, inp.retAge, age),
      bear: milestoneValue(res.bearData, inp.retAge, age),
    })),
  };
}
