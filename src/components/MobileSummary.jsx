import { fmt } from "../utils/formatters";

export default function MobileSummary({ inp, res, story }) {
  if (!res) {
    return (
      <section className="phase-summary-card neutral">
        <div className="phase-summary-kicker">退休試算</div>
        <h2>先填核心數字</h2>
        <p>完成年齡、資產、年支出與退休狀態後，就能看到 FIRE 達標狀態。</p>
      </section>
    );
  }

  const achievementRate = Math.max(0, Math.round((res.assessmentPortfolio / Math.max(res.fireTarget, 1)) * 100));
  const statusText = res.fireReadyAtRet ? "已接近或達到 FIRE" : "尚未達標";

  return (
    <section className={`phase-summary-card ${story?.tone || "neutral"}`}>
      <div className="phase-summary-kicker">FIRE 狀態</div>
      <h2>{story?.status || statusText}</h2>
      <p>
        {res.fireReadyAtRet
          ? "依目前設定，退休時資產可覆蓋 FIRE 目標。"
          : "目前設定下還需要調整資產、支出或退休時間。"}
      </p>

      <div className="phase-summary-rate">
        <span>{achievementRate}%</span>
        <strong>達標率</strong>
      </div>

      <div className="phase-summary-list">
        <div>
          <span>目前資產</span>
          <strong>{fmt(res.savedRaw, res.currency)}</strong>
        </div>
        <div>
          <span>FIRE 目標</span>
          <strong>{fmt(res.fireTarget, res.currency)}</strong>
        </div>
        <div>
          <span>退休狀態</span>
          <strong>{inp.retAge <= inp.age ? "已退休模式" : `${inp.retAge} 歲退休`}</strong>
        </div>
      </div>

      {res.lifeExpectancyRisk?.riskLevel === "warning" && (
        <div className="phase-summary-warning">
          長期規劃年齡風險較高，建議到進階設定確認。
        </div>
      )}
    </section>
  );
}
