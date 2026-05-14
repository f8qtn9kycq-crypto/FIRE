import { fmt } from "../utils/formatters";
import { Card, Empty } from "./SummaryCards";

export default function Tax({ inp, ready, res, emptyText }) {
  if (!ready || !res) return <Empty text={emptyText} />;

  const { grossAtRet, taxDrag, lifetimeTax } = res;
  const currency = res.currency;

  return (
    <div>
      <div className="tax-grid" style={{ gap: 8 }}>
        <Card label="資本利得稅" value={`${inp.cgTax}%`} color="warn" />
        <Card label="年稅務損耗" value={fmt(taxDrag, currency)} sub="需額外提領" />
        <Card label="終身稅務總額" value={fmt(lifetimeTax, currency)} color="bad" />
      </div>

      <div style={{ background: "#1A1916", border: "1px solid #2E2C28", borderRadius: 8, padding: "16px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "#9B9890", marginBottom: 14 }}>總提領 vs 淨提領（今日）</div>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
          {[
            ["需總提領", grossAtRet, "#5B9BD5", 1],
            ["實際支出", res.expensesRaw, "#4CAF85", res.expensesRaw / grossAtRet],
          ].map(([label, value, color, ratio]) => (
            <div key={label} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: Math.max(8, Math.round(80 * ratio)), background: color, borderRadius: "6px 6px 0 0", marginBottom: 8, opacity: 0.85 }} />
              <div style={{ fontSize: 11, color: "#9B9890", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#E8E4DC", fontFamily: "monospace" }}>{fmt(value, currency)}</div>
            </div>
          ))}
        </div>
      </div>

      {[
        ["#4CAF85", `以 ${inp.cgTax}% 資本利得稅計算，您需提領 ${fmt(grossAtRet, currency)}/年（稅前）才能獲得 ${fmt(res.expensesRaw, currency)}/年。每年稅務損耗 ${fmt(taxDrag, currency)}。`],
        [
          "#5B9BD5",
          inp.currencyCode === "TWD"
            ? "台灣上市櫃股票資本利得稅通常為0%，但股利所得仍需另外評估。此處的資本利得稅率可保留為0，或依您的境外資產情境調整。"
            : "計算假設：全額提領均課資本利得稅（保守估計）。實際上僅獲利部分課稅，實際稅負會低於此估算。",
        ],
        ["#C8A96E", `以 ${fmt(res.savedRaw, currency)} 的投資組合，稅損收割、捐贈人建議基金（DAF）或信託架構，可顯著降低估計 ${fmt(lifetimeTax, currency)} 的終身稅務負擔。`],
        ["#A67BC8", "台灣稅務提示：若您持有境外資產，請注意外匯利得課稅、境外遺產稅規定，以及台灣與相關國家的租稅協定條款。"],
      ].map(([color, text]) => (
        <div key={text.slice(0, 20)} style={{ padding: "12px 14px", borderLeft: `3px solid ${color}`, background: "#1A1916", borderRadius: "0 8px 8px 0", marginBottom: 10, fontSize: 13, color: "#B0ADA6", lineHeight: 1.7 }}>
          {text}
        </div>
      ))}
    </div>
  );
}
