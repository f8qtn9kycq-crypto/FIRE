import { useState } from "react";

const SECTIONS = [
  {
    id: "currency",
    marker: "$",
    title: "幣別與輸入金額怎麼處理？",
    color: "#5B9BD5",
    intro: "你看到的輸入幣別會跟顯示幣別連動，但計算核心一律先換算成 TWD。",
    formula: "內部 TWD 金額 = 輸入金額（萬） × 10,000 ÷ 幣別匯率",
    steps: [
      "TWD 匯率為 1，所以輸入 1000 萬 = NT$1000 萬。",
      "USD 匯率目前設為 0.031，所以輸入 US$31 萬會換算為約 NT$1000 萬。",
      "切換 TWD / USD 時，現有輸入欄位會自動換算，不只是換符號。",
    ],
    note: "這樣可以避免同一個數字在 TWD 和 USD 之間被錯誤解讀。",
  },
  {
    id: "preRetirement",
    marker: "1",
    title: "退休前資產怎麼成長？",
    color: "#4CAF85",
    intro: "現金儲蓄只是現金，不吃退休前投資報酬；投資總額與每年投入才會參與複利。",
    formula: "退休時資產 = 現金 + 投資複利後金額",
    steps: [
      "投資第 1 年底 = 投資總額 × (1 + 退休前年報酬率) + 每年投入金額。",
      "每年重複一次，直到退休年齡。",
      "最後再加回現金儲蓄，得到退休時投資組合。",
    ],
    note: "目前定義下，現金不會套用 7% 退休前報酬率，這點已和主 app 的計算一致。",
  },
  {
    id: "fire",
    marker: "2",
    title: "財務自由目標怎麼算？",
    color: "#C8A96E",
    intro: "FIRE 目標是用你的年度支出與安全提領率反推需要多少本金。",
    formula: "財務自由目標 = 年支出 ÷ 安全提領率",
    steps: [
      "如果年支出是 NT$100 萬。",
      "安全提領率設為 3.5%。",
      "目標 = 100 萬 ÷ 3.5% = 約 NT$2857 萬。",
    ],
    note: "安全提領率越低，目標資產越高；退休期越長，通常越需要保守。",
  },
  {
    id: "projection",
    marker: "3",
    title: "退休後投資組合怎麼推算？",
    color: "#C8A96E",
    intro: "退休後每一年，資產會先依退休後報酬率成長，再扣掉當年的生活支出。",
    formula: "年底資產 = 年初資產 × (1 + 退休後報酬率) − 稅前提領金額",
    steps: [
      "先用退休時投資組合作為第 0 年資產。",
      "每年支出會依通膨率上升。",
      "如果有資本利得稅，會先 gross up 成稅前提領金額。",
      "重複計算到內部預設規劃年齡。",
    ],
    note: "預測頁的基準曲線、風險頁的情境期末資產，都是從這個公式延伸出來。",
  },
  {
    id: "inflation",
    marker: "4",
    title: "通膨調整怎麼算？",
    color: "#5B9BD5",
    intro: "未來每年的生活費會因通膨增加，所以不能只用今天的年支出一路扣到底。",
    formula: "第 N 年支出 = 今日年支出 × (1 + 通膨率)^N",
    steps: [
      "今日年支出 NT$100 萬。",
      "通膨率 2.5%。",
      "第 10 年支出約為 100 萬 × 1.025^10。",
    ],
    note: "通膨越高，越後面的退休生活費越重，資產消耗速度也會加快。",
  },
  {
    id: "tax",
    marker: "5",
    title: "稅前提領怎麼算？",
    color: "#A67BC8",
    intro: "如果設定資本利得稅，app 會用保守方式估算需要提領多少稅前金額。",
    formula: "稅前提領 = 通膨後支出 ÷ (1 − 資本利得稅率)",
    steps: [
      "想實際花 NT$100 萬。",
      "若資本利得稅率為 20%。",
      "稅前提領 = 100 萬 ÷ 0.8 = NT$125 萬。",
    ],
    note: "台灣上市櫃股票資本利得稅通常為 0%，但股利所得仍需另外評估。",
  },
  {
    id: "bear",
    marker: "6",
    title: "熊市情境怎麼算？",
    color: "#C05050",
    intro: "熊市不是只打一次 -30%，目前使用前三年壓力測試，之後回到退休後報酬率。",
    formula: "第 1 年 −30%，第 2 年 −10%，第 3 年 +4%，之後使用退休後報酬率",
    steps: [
      "從退休時投資組合開始。",
      "第 1 年先遇到 -30% 報酬，再扣當年通膨後支出。",
      "第 2 年用 -10%，第 3 年用 +4%。",
      "第 4 年起回到你設定的退休後報酬率。",
    ],
    note: "這用來觀察報酬順序風險：大跌越早發生，對退休計畫越傷。",
  },
  {
    id: "monteCarlo",
    marker: "7",
    title: "蒙地卡羅模擬怎麼算？",
    color: "#C8953A",
    intro: "app 會跑 300 次退休路徑，統計有多少次資產能撐到內部預設規劃年齡。",
    formula: "每年報酬率 = 退休後報酬率 + 固定種子隨機波動（約 ±5 個百分點）",
    steps: [
      "每次模擬都從退休時投資組合開始。",
      "每一年抽一個報酬率，並扣除通膨後支出。",
      "如果中途資產歸零，該次模擬視為失敗。",
      "300 次中成功的比例，就是存活機率。",
    ],
    note: "目前使用 deterministic seed，所以同一組輸入會得到穩定結果，不會每次刷新都亂跳。",
  },
];

function Section({ section, open, onToggle }) {
  return (
    <div style={{ marginBottom: 12, background: "#1A1916", border: `1px solid ${open ? section.color + "70" : "#2E2C28"}`, borderRadius: 8, overflow: "hidden" }}>
      <button
        type="button"
        onClick={onToggle}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "15px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
      >
        <span style={{ width: 32, height: 32, borderRadius: 6, border: `1px solid ${section.color}70`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: section.color, fontSize: 15, fontWeight: 800, flexShrink: 0 }}>
          {section.marker}
        </span>
        <span style={{ fontSize: 17, fontWeight: 700, color: "#E8E4DC", flex: 1, lineHeight: 1.4 }}>{section.title}</span>
        <span style={{ color: "#6B6963", fontSize: 20 }}>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div style={{ padding: "0 14px 16px" }}>
          <p style={{ fontSize: 16, color: "#B0ADA6", lineHeight: 1.7, margin: "0 0 14px" }}>{section.intro}</p>

          <div style={{ background: "#0A0A08", border: `1px solid ${section.color}50`, borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: section.color, textTransform: "uppercase", marginBottom: 7, fontWeight: 700 }}>公式</div>
            <div style={{ fontSize: 16, color: section.color, fontWeight: 700, lineHeight: 1.6 }}>{section.formula}</div>
          </div>

          <div style={{ marginBottom: 12 }}>
            {section.steps.map((step, index) => (
              <div key={step} style={{ display: "flex", gap: 9, marginBottom: 8, alignItems: "flex-start" }}>
                <span style={{ width: 24, height: 24, borderRadius: 5, background: section.color + "20", color: section.color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>
                  {index + 1}
                </span>
                <span style={{ fontSize: 16, color: "#C8C5BE", lineHeight: 1.65 }}>{step}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: "10px 12px", borderLeft: `3px solid ${section.color}`, background: "#111009", borderRadius: "0 8px 8px 0", fontSize: 15, color: "#9B9890", lineHeight: 1.7 }}>
            {section.note}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FormulaGuide({ onBack }) {
  const [openId, setOpenId] = useState("preRetirement");

  return (
    <div className="guide-shell">
      <div className="guide-header">
        <button
          type="button"
          onClick={onBack}
          style={{ border: "1px solid #2E2C28", background: "#1A1916", color: "#C8A96E", borderRadius: 8, padding: "9px 12px", fontSize: 15, marginBottom: 14, cursor: "pointer" }}
        >
          返回計算機
        </button>
        <div style={{ fontSize: 13, color: "#C8A96E", textTransform: "uppercase", marginBottom: 3 }}>財務自由計算機</div>
        <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.15 }}>計算公式說明</div>
        <div style={{ fontSize: 15, color: "#5C5A55", marginTop: 6, lineHeight: 1.6 }}>依目前 app 實際公式整理，包含現金、幣別、稅務、熊市與蒙地卡羅。</div>
      </div>

      <div className="guide-content">
        <div className="guide-jump" style={{ background: "#1A1916", border: "1px solid #2E2C28", borderRadius: 8, padding: "14px 14px" }}>
          <div style={{ fontSize: 15, color: "#6B6963", marginBottom: 10 }}>快速跳到公式</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setOpenId(section.id)}
                style={{ padding: "8px 11px", borderRadius: 7, border: `1px solid ${openId === section.id ? section.color : "#2E2C28"}`, background: openId === section.id ? section.color + "20" : "#111009", color: openId === section.id ? section.color : "#9B9890", fontSize: 15, cursor: "pointer" }}
              >
                {section.title.replace("怎麼算？", "").replace("怎麼處理？", "")}
              </button>
            ))}
          </div>
        </div>

        <div className="guide-sections">
          {SECTIONS.map((section) => (
            <Section
              key={section.id}
              section={section}
              open={openId === section.id}
              onToggle={() => setOpenId(openId === section.id ? null : section.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
