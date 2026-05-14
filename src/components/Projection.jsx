import { fmt } from "../utils/formatters";
import { Divider, Empty, MiniChart, SecLabel } from "./SummaryCards";

export default function Projection({ inp, ready, res, emptyText }) {
  if (!ready || !res) return <Empty text={emptyText} />;

  const { baseData, bearData, spendData } = res;
  const currency = res.currency;
  const idx65 = Math.max(0, Math.min(65 - inp.retAge, baseData.length - 1));
  const idx67 = Math.max(0, Math.min(67 - inp.retAge, spendData.length - 1));

  return (
    <div>
      <SecLabel>投資組合成長預測</SecLabel>
      <div style={{ background: "#1A1916", border: "1px solid #2E2C28", borderRadius: 8, padding: "16px 12px", marginBottom: 14 }}>
        <MiniChart data={baseData} color="#C8A96E" height={120} />
        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
          {[["基準情境", "#C8A96E"], ["熊市第1年", "#C05050"]].map(([label, color]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#9B9890" }}>
              <div style={{ width: 18, height: 2, background: color, borderRadius: 1 }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#1A1916", border: "1px solid #2E2C28", borderRadius: 8, padding: "16px 12px", marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: "#9B9890", marginBottom: 10 }}>熊市情境（第1年 −30%）</div>
        <MiniChart data={bearData} color="#C05050" height={80} />
      </div>

      <Divider />
      <SecLabel>通膨調整後年支出</SecLabel>
      <div style={{ background: "#1A1916", border: "1px solid #2E2C28", borderRadius: 8, padding: "16px 12px", marginBottom: 14 }}>
        <MiniChart data={spendData} color="#5B9BD5" height={80} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: "#9B9890" }}>
          <span>今日：{fmt(res.expensesRaw, currency)}/年</span>
          <span>{inp.lifeExp}歲：{fmt(spendData[spendData.length - 1], currency)}/年</span>
        </div>
      </div>

      <Divider />
      <SecLabel>重要里程碑</SecLabel>
      {[
        ["退休時投資組合", fmt(res.portAtRet, currency), "neutral"],
        ["65歲時投資組合", fmt(baseData[idx65], currency), "neutral"],
        [`${inp.lifeExp}歲投資組合`, baseData[baseData.length - 1] > 0 ? fmt(baseData[baseData.length - 1], currency) : "資產耗盡", baseData[baseData.length - 1] > 0 ? "good" : "bad"],
        [`${inp.lifeExp}歲（熊市情境）`, bearData[bearData.length - 1] > 0 ? fmt(bearData[bearData.length - 1], currency) : "資產耗盡", bearData[bearData.length - 1] > 0 ? "good" : "bad"],
        ["67歲年支出", fmt(spendData[idx67], currency) + "/年", "warn"],
      ].map(([label, value, color]) => (
        <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #1E1C18" }}>
          <span style={{ fontSize: 13, color: "#9B9890", flex: 1, paddingRight: 10 }}>{label}</span>
          <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "monospace", color: color === "good" ? "#4CAF85" : color === "bad" ? "#C05050" : color === "warn" ? "#C8953A" : "#E8E4DC" }}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}
