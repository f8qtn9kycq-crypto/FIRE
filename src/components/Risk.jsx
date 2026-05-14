import { fmt, moneyWanToTwd } from "../utils/formatters";
import { getRiskScores } from "../utils/fireEngine";
import { Divider, Empty, MiniChart, SecLabel } from "./SummaryCards";

function RiskBar({ label, val }) {
  const color = val < 30 ? "#4CAF85" : val < 60 ? "#C8953A" : "#C05050";
  const level = val < 30 ? "低" : val < 60 ? "中" : "高";

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
        <span style={{ fontSize: 13, color: "#9B9890" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{level}</span>
      </div>
      <div style={{ height: 7, background: "#2E2C28", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${val}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

export default function Risk({ inp, ready, res, emptyText }) {
  if (!ready || !res) return <Empty text={emptyText} />;

  const { bearData, mcData, portAtRet } = res;
  const currency = res.currency;
  const riskScores = getRiskScores({ inp, res });
  const survFinal = mcData[mcData.length - 1] ?? 0;
  const bearOk = bearData[bearData.length - 1] > 0;

  return (
    <div>
      <div
        style={{
          background: bearOk ? "#0D2B1E" : "#2B1A0D",
          border: `1px solid ${bearOk ? "#1D5C3A" : "#5C3A1D"}`,
          borderRadius: 8,
          padding: "14px 16px",
          marginBottom: 20,
          fontSize: 13,
          color: bearOk ? "#4CAF85" : "#C8953A",
          lineHeight: 1.6,
        }}
      >
        {bearOk
          ? `即使第1年遭遇30%市場崩跌，投資組合仍可支撐至 ${inp.lifeExp} 歲。緩衝充足。`
          : `第1年30%崩跌可能導致投資組合在 ${inp.lifeExp} 歲前耗盡，建議保留2-3年現金緩衝。`}
      </div>

      <SecLabel>風險因素</SecLabel>
      <RiskBar label="提領率風險" val={riskScores.withdrawal} />
      <RiskBar label="報酬順序風險" val={riskScores.sequence} />
      <RiskBar label="通膨侵蝕" val={riskScores.inflation} />
      <RiskBar label="長壽風險" val={riskScores.longevity} />

      <Divider />
      <SecLabel>蒙地卡羅模擬（300次）</SecLabel>
      <div style={{ background: "#1A1916", border: "1px solid #2E2C28", borderRadius: 8, padding: "16px 12px", marginBottom: 12 }}>
        <MiniChart data={mcData} color={survFinal >= 90 ? "#4CAF85" : survFinal >= 70 ? "#C8953A" : "#C05050"} height={100} />
        <div style={{ marginTop: 14, fontSize: 13, color: "#9B9890", lineHeight: 1.7 }}>
          {inp.lifeExp}歲存活機率：{" "}
          <strong style={{ color: survFinal >= 90 ? "#4CAF85" : survFinal >= 70 ? "#C8953A" : "#C05050", fontSize: 22 }}>{survFinal}%</strong>
          <br />
          {survFinal >= 90 ? "在各種市場情境下均高度穩健。" : survFinal >= 70 ? "中等風險，建議將提領率降至3%。" : "高度耗盡風險，請立即降低提領率。"}
        </div>
      </div>

      <Divider />
      <SecLabel>情境模擬</SecLabel>
      <div style={{ fontSize: 12, color: "#5C5A55", marginBottom: 12, padding: "8px 12px", background: "#1A1916", borderRadius: 8 }}>
        計算起點：退休時投資組合 <strong style={{ color: "#C8A96E" }}>{fmt(portAtRet, currency)}</strong>
        {inp.retAge > inp.age ? `（現金不計投資複利；投資含退休前 ${inp.retAge - inp.age} 年複利＋每年投入 ${fmt(moneyWanToTwd(inp.annualContrib, currency), currency)}）` : ""}
      </div>
      {res.scenarioResults.map(({ lbl, end }) => (
        <div key={lbl} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #1E1C18" }}>
          <span style={{ fontSize: 12, color: "#9B9890", flex: 1, paddingRight: 12 }}>{lbl}</span>
          <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace", color: end > 0 ? "#4CAF85" : "#C05050" }}>
            {end > 0 ? fmt(end, currency) : "資產耗盡"}
          </span>
        </div>
      ))}
    </div>
  );
}
