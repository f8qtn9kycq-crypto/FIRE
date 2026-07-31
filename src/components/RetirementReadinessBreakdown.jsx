import { buildReadinessBreakdown } from "../utils/readinessBreakdown";
import { fmt, roundMoneyForDisplay } from "../utils/formatters";
import { reconcileRetirementAssetBreakdownForDisplay } from "../utils/retirementAssetBreakdown";

function MetricCard({ label, value, tone = "neutral", sub }) {
  return (
    <div className={`readiness-metric ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {sub ? <small>{sub}</small> : null}
    </div>
  );
}

function Milestones({ breakdown, currency }) {
  return (
    <div className="readiness-section">
      <h4>資產長期軌跡</h4>
      <div className="readiness-milestones">
        {breakdown.milestones.map((milestone) => (
          <div key={milestone.label} className="readiness-milestone">
            <span>{milestone.label}</span>
            <strong className={milestone.baseline > 0 ? "good" : "bad"}>
              {milestone.baseline > 0 ? fmt(milestone.baseline, currency) : "資產耗盡"}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssetSourceBreakdown({ assetBreakdown, currency }) {
  if (!assetBreakdown) return null;

  const displayBreakdown = reconcileRetirementAssetBreakdownForDisplay(
    assetBreakdown,
    (value) => roundMoneyForDisplay(value, currency),
  );

  const sources = [
    { label: "現金", value: displayBreakdown.cashAtRetirement },
    { label: "初始投資本金", value: displayBreakdown.startingInvestmentPrincipal },
    {
      label: `退休前累積投入（${assetBreakdown.contributionPeriods} 次）`,
      value: displayBreakdown.cumulativeContributions,
    },
    {
      label: "投資成長",
      value: displayBreakdown.projectedInvestmentGrowth,
      tone: assetBreakdown.projectedInvestmentGrowth < 0 ? "bad" : "good",
    },
  ];

  return (
    <div className="readiness-section asset-source-breakdown">
      <h4>退休時資產怎麼來的？</h4>
      <p>以下是退休時的名目金額拆解，各項合計等於退休時投資組合。</p>
      <div className="asset-source-list">
        {sources.map((source) => (
          <div key={source.label} className={source.tone || ""}>
            <span>{source.label}</span>
            <strong>{fmt(source.value, currency)}</strong>
          </div>
        ))}
        <div className="asset-source-total">
          <span>退休時投資組合</span>
          <strong>{fmt(displayBreakdown.total, currency)}</strong>
        </div>
      </div>
      <small>
        投資成長依目前退休前年報酬率假設推估，可能為負值，不是保證結果。顯示金額的四捨五入差額會併入最大項目，確保合計一致。
      </small>
    </div>
  );
}

function RiskSummary({ breakdown, inp }) {
  const mcTone = breakdown.mcSuccess === null ? "neutral" : breakdown.mcSuccess >= 85 ? "good" : breakdown.mcSuccess >= 65 ? "warn" : "bad";

  return (
    <div className="readiness-section">
      <h4>風險檢查</h4>
      <div className="readiness-risk-list">
        <div className={breakdown.baselineOk ? "good" : "bad"}>
          <span>基準情境（退休後 {inp.retPost}% 報酬）</span>
          <strong>{breakdown.baselineOk ? "可支撐" : "需調整"}</strong>
        </div>
        <div className={breakdown.bearMarketOk ? "good" : "bad"}>
          <span>熊市情境（第 1 年 -30%）</span>
          <strong>{breakdown.bearMarketOk ? "可支撐" : "有壓力"}</strong>
        </div>
        <div className={mcTone}>
          <span>蒙地卡羅成功率</span>
          <strong>{breakdown.mcSuccess === null ? "尚無資料" : `${breakdown.mcSuccess}%`}</strong>
        </div>
      </div>
    </div>
  );
}

export default function RetirementReadinessBreakdown({ inp, res }) {
  const breakdown = buildReadinessBreakdown(inp, res);
  if (!breakdown) return null;

  const currency = res.currency;
  const tone = breakdown.fireReadyAtRet ? "good" : "warn";

  return (
    <section className={`readiness-card ${tone}`}>
      <div className="readiness-header">
        <span>退休準備度分析</span>
        <h3>{breakdown.fireReadyAtRet ? "依目前假設可達 FIRE" : "目前還需要調整"}</h3>
        <p>
          {breakdown.fireReadyAtRet
            ? "依目前假設，退休時投資組合可覆蓋目標；結果會隨報酬、通膨與支出變化，仍建議留意熊市壓力。"
            : "目前設定下，退休時資產尚未完全覆蓋目標；可從投入金額、退休時間或支出假設調整。"}
        </p>
      </div>

      <div className="readiness-metrics-grid">
        <MetricCard label="退休時投資組合" value={fmt(res.portAtRet, currency)} />
        <MetricCard label="FIRE 目標" value={fmt(res.fireTarget, currency)} sub={`${breakdown.achievementRate}% 達標`} />
        <MetricCard label="稅後安全提領額" value={`${fmt(breakdown.netWithdrawal, currency)}/年`} tone={breakdown.shortfall > 0 ? "bad" : "good"} />
        <MetricCard label="退休生活費" value={`${fmt(breakdown.spending, currency)}/年`} />
        {breakdown.fireReadyAtRet ? (
          <MetricCard label="年度餘裕" value={`${fmt(breakdown.surplus, currency)}/年`} tone="good" />
        ) : (
          <MetricCard label="年度缺口" value={`${fmt(breakdown.shortfall, currency)}/年`} tone="bad" />
        )}
        <MetricCard label="稅前可提領額" value={`${fmt(breakdown.grossWithdrawal, currency)}/年`} sub={`SWR ${inp.swr}%`} />
      </div>

      <AssetSourceBreakdown assetBreakdown={res.retirementAssetBreakdown} currency={currency} />
      <Milestones breakdown={breakdown} currency={currency} />
      <RiskSummary breakdown={breakdown} inp={inp} />
    </section>
  );
}
