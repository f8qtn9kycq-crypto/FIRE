export const ASSUMPTION_GUIDANCE = {
  retPre: {
    title: "退休前年報酬率",
    impact: "影響退休前投資與每年投入的複利成長，不會套用在現金儲蓄。",
    benchmark: {
      body: "歷史尺度（僅供比較）：0050 追蹤 FTSE 臺灣50指數；−21.5%（2022）與 +49.0%（2024）是該含息指數的單一年度報酬，不是 0050 成立以來年化報酬。S&P 500 的 13.58% 是截至 2026 年 6 月底、往回 10 年的美元價格年化報酬，不是成立以來年化報酬，也不含股息。0050 實際基金報酬另受費用與追蹤差異影響；兩者的市場、幣別、期間與口徑不同，不能直接當成你的預期報酬。",
      sources: [
        { label: "元大 0050 官方資料", url: "https://www.yuantaetfs.com/product/detail/0050/Basic_information" },
        { label: "FTSE 臺灣50官方資料", url: "https://research.ftserussell.com/Analytics/FactSheets/Home/DownloadSingleIssue?isManual=False&issueName=TW50&openfile=open" },
        { label: "S&P 500 官方資料", url: "https://www.spglobal.com/spdji/en/indices/equity/sp-500/" },
      ],
    },
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
    benchmark: {
      body: "0050／FTSE 臺灣50與 S&P 500 可用來理解股票市場曾有的長期成長與大幅波動，但退休後會同時提領生活費；遇到先跌後漲時，結果可能和單看指數平均報酬差很多。因此不宜直接照搬股票指數的歷史報酬。",
      sources: [
        { label: "元大 0050 官方資料", url: "https://www.yuantaetfs.com/product/detail/0050/Basic_information" },
        { label: "FTSE 臺灣50官方資料", url: "https://research.ftserussell.com/Analytics/FactSheets/Home/DownloadSingleIssue?isManual=False&issueName=TW50&openfile=open" },
        { label: "S&P 500 官方資料", url: "https://www.spglobal.com/spdji/en/indices/equity/sp-500/" },
      ],
    },
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
    benchmark: {
      body: "行政院主計總處公布的臺灣全年 CPI 年增率：2021 年 1.96%、2022 年 2.95%、2023 年 2.50%、2024 年 2.18%、2025 年 1.66%，五年簡單平均約 2.25%。目前 2.5% 是略高於這段平均的規劃情境，不是政府預測；房租、醫療、餐飲等個人支出漲幅也可能不同。",
      sources: [
        { label: "行政院主計總處 CPI 統計表", url: "https://www.stat.gov.tw/cp.aspx?n=2665&s=2655" },
      ],
    },
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
