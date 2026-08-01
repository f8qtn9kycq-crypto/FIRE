export default function EarliestRetirementStory({ result }) {
  if (!result) return null;

  if (result.status === "found") {
    const title =
      result.reason === "already-ready"
        ? `依目前假設，${result.age} 歲已達退休條件`
        : `依目前假設，最早約 ${result.age} 歲可退休`;

    return (
      <section className="earliest-retirement-story good" aria-live="polite">
        <span>反推退休年齡</span>
        <h3>{title}</h3>
        <p>
          以目前資產、每年投入、報酬率、通膨與支出試算，搜尋到 {result.maxRetirementAge} 歲；條件改變，結果也會改變，不代表保證。
        </p>
      </section>
    );
  }

  if (result.status === "not_found") {
    return (
      <section className="earliest-retirement-story warn" aria-live="polite">
        <span>反推退休年齡</span>
        <h3>目前範圍內尚未找到達標年齡</h3>
        <p>已試算到 {result.maxRetirementAge} 歲；可調整投入、支出或假設後再比較，不代表你無法退休。</p>
      </section>
    );
  }

  return (
    <section className="earliest-retirement-story neutral" aria-live="polite">
      <span>反推退休年齡</span>
      <h3>目前無法反推退休年齡</h3>
      <p>請確認核心數字與長期規劃年齡；這是輸入或試算狀態，不代表退休計畫失敗。</p>
    </section>
  );
}
