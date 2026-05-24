import { buildReadinessBreakdown } from "../utils/readinessBreakdown";
import { fmt } from "../utils/formatters";

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
        <h3>{breakdown.fireReadyAtRet ? "你已達到 FIRE 條件" : "目前還需要調整"}</h3>
        <p>
          {breakdown.fireReadyAtRet
            ? "依照目前設定，退休時投資組合可覆蓋目標，仍建議留意熊市與通膨壓力。"
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

      <Milestones breakdown={breakdown} currency={currency} />
      <RiskSummary breakdown={breakdown} inp={inp} />
    </section>
  );
}
