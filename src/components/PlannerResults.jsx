import MobileSummary from "./MobileSummary";

export default function PlannerResults({
  inp,
  res,
  story,
  tabs,
  activeTab,
  onTabChange,
  panels,
  onAdjustPlan,
  headingRef,
}) {
  return (
    <section className="planner-results" aria-labelledby="planner-results-title">
      <header className="planner-results-header">
        <div>
          <div className="planner-results-kicker">退休試算結果</div>
          <h1 id="planner-results-title" ref={headingRef} tabIndex="-1">你的退休規劃重點</h1>
          <p>先看目前狀態與最早退休年齡，再往下查看預測、風險與稅務細節。</p>
        </div>
        <button type="button" className="secondary-cta" onClick={onAdjustPlan}>調整規劃</button>
      </header>

      <MobileSummary inp={inp} res={res} story={story} />

      <div className="tab-bar result-tab-bar" aria-label="退休試算詳細結果">
        {tabs.map(({ label, index }) => (
          <button
            key={label}
            type="button"
            className={`tab-button ${activeTab === index ? "is-active" : ""}`}
            aria-pressed={activeTab === index}
            onClick={() => onTabChange(index)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="result-detail-panel">{panels[activeTab]}</div>
      <button type="button" className="secondary-cta result-adjust-cta" onClick={onAdjustPlan}>調整規劃</button>
    </section>
  );
}
