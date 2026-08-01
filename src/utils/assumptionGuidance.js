export const ASSUMPTION_GUIDANCE = {
  retPre: {
    title: "退休前年報酬率",
    impact: "影響退休前投資與每年投入的複利成長，不會套用在現金儲蓄。",
    thresholds: [5.5, 8.5],
    scenarios: [
      { id: "conservative", label: "保守", value: 4, description: "用較低成長估算，較能承受實際報酬不如預期的落差。" },
      { id: "neutral", label: "中性", value: 7, description: "用中間情境觀察長期複利；期間仍可能有明顯漲跌。" },
      { id: "aggressive", label: "積極", value: 10, description: "假設較高長期成長，結果更敏感，也更可能高估退休時資產。" },
    ],
  },
  retPost: {
    title: "退休後年報酬率",
    impact: "影響退休後資產在每年提領前的成長；退休初期下跌會放大提領壓力。",
    thresholds: [4, 6],
    scenarios: [
      { id: "conservative", label: "保守", value: 3, description: "用較低成長估算，為退休期間的市場落差保留較多空間。" },
      { id: "neutral", label: "中性", value: 5, description: "用中間情境試算，但平均值不代表每年都能得到相同報酬。" },
      { id: "aggressive", label: "積極", value: 7, description: "較依賴退休後持續成長；若前期下跌，資產可能更早承壓。" },
    ],
  },
  inf: {
    title: "通貨膨脹率",
    impact: "影響未來生活費的購買力；通膨越高，同樣生活方式需要的金額越多。",
    thresholds: [2, 3.25],
    reverse: true,
    scenarios: [
      { id: "conservative", label: "保守", value: 4, description: "用較高物價成長做壓力測試，退休支出會增加得更快。" },
      { id: "neutral", label: "中性", value: 2.5, description: "用中間情境觀察購買力變化，實際生活成本仍會因人而異。" },
      { id: "aggressive", label: "積極", value: 1.5, description: "假設物價成長較慢，可能低估醫療、居住或服務費用的壓力。" },
    ],
  },
};

export const ASSUMPTION_DISCLAIMER =
  "情境名稱只用來比較假設，不是投資建議或預測。報酬與試算結果不保證發生，請用不同數值交叉檢視。";

export function getAssumptionGuidance(key) {
  return ASSUMPTION_GUIDANCE[key] || null;
}

export function getAssumptionPresets(key) {
  const guidance = getAssumptionGuidance(key);
  if (!guidance) return [];

  return guidance.scenarios
    .map(({ label, value }) => ({ label, value }))
    .sort((left, right) => left.value - right.value);
}

export function getAssumptionScenarioId(key, value) {
  const guidance = getAssumptionGuidance(key);
  const numericValue = Number(value);
  if (!guidance || !Number.isFinite(numericValue)) return null;

  const [lower, upper] = guidance.thresholds;
  const position = numericValue < lower ? 0 : numericValue > upper ? 2 : 1;
  const orderedIds = guidance.reverse
    ? ["aggressive", "neutral", "conservative"]
    : ["conservative", "neutral", "aggressive"];

  return orderedIds[position];
}
