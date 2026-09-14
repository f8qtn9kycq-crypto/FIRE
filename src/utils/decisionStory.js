export function getPlanStory(res) {
  if (!res) return { status: "先填核心數字", tone: "neutral", success: null, achievementRate: null };

  const success = res.mcData?.length ? res.mcData[res.mcData.length - 1] : null;
  const achievementRate = Math.max(0, Math.round((res.assessmentPortfolio / Math.max(res.fireTarget, 1)) * 100));
  // FIRE 門檻回答「是否達到目標」；蒙地卡羅只作為後續的不確定性檢查。
  return res.fireReadyAtRet
    ? { status: "已達到試算門檻", tone: "good", success, achievementRate }
    : { status: "尚未達到試算門檻", tone: "warn", success, achievementRate };
}
