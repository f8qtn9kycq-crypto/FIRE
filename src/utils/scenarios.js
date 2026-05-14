export function runBearScenario(startingPortfolio, retPost, inf, cgTax, expenses, retYears) {
  let p = startingPortfolio;
  const series = [Math.round(p)];

  for (let y = 1; y <= retYears; y++) {
    let yearlyReturn = retPost;

    if (y === 1) yearlyReturn = -0.3;
    else if (y === 2) yearlyReturn = -0.1;
    else if (y === 3) yearlyReturn = 0.04;

    const adjExp = expenses * Math.pow(1 + inf, y);
    const grossW = adjExp / (1 - cgTax);
    p = Math.max(0, p * (1 + yearlyReturn) - grossW);
    series.push(Math.round(p));
  }

  return series;
}

export function buildScenarioResults({ portAtRet, retPost, inf, rCG, expenses, retYears, lifeExp, project }) {
  return [
    [`基準情境（${retPost}% 報酬）`, retPost / 100, inf / 100, 0, retYears],
    ["保守情境（報酬率 −2%）", retPost / 100 - 0.02, inf / 100, 0, retYears],
    ["高通膨（+2%）", retPost / 100, inf / 100 + 0.02, 0, retYears],
    [`長壽情境（${lifeExp + 10}歲）`, retPost / 100, inf / 100, 0, retYears + 10],
  ].map(([lbl, r, i, shock, yrs]) => ({
    lbl,
    end: project(portAtRet, r, i, rCG, expenses, yrs, shock)[yrs],
  })).concat({
    lbl: "熊市前三年（-30%, -10%, +4%）",
    end: runBearScenario(portAtRet, retPost / 100, inf / 100, rCG, expenses, retYears)[retYears],
  });
}
