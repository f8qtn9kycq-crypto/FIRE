import { fmt, moneyWanToTwd } from "../utils/formatters";
import { getRiskScores } from "../utils/fireEngine";
import { DEFAULT_MONTE_CARLO_RUNS } from "../utils/monteCarlo";
import { SIMPLE_MODEL_ID, SIMPLE_MODEL_MAX_ANNUAL_RETURN_OFFSET } from "../utils/monteCarloModel";
import { Divider, Empty, MiniChart, SecLabel } from "./SummaryCards";

function RiskBar({ label, val }) {
  const color = val < 30 ? "#4CAF85" : val < 60 ? "#C8953A" : "#C05050";
  const level = val < 30 ? "低" : val < 60 ? "中" : "高";

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
        <span style={{ fontSize: 16, color: "#9B9890" }}>{label}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color }}>{level}・{Math.round(val)}/100</span>
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
          fontSize: 16,
          color: bearOk ? "#4CAF85" : "#C8953A",
          lineHeight: 1.6,
        }}
      >
        {bearOk
          ? `即使第1年遭遇30%市場崩跌，投資組合仍可支撐至 ${inp.lifeExp} 歲。緩衝充足。`
          : `第1年30%崩跌可能導致投資組合在 ${inp.lifeExp} 歲前耗盡；可調整假設後再次比較。`}
      </div>

      <SecLabel>風險因素</SecLabel>
      <div className="risk-explanation">分數越高，代表這項風險對目前計畫的壓力越大；它不是退休成功率。</div>
      <RiskBar label="提領率風險" val={riskScores.withdrawal} />
      <RiskBar label="報酬順序風險" val={riskScores.sequence} />
      <RiskBar label="通膨侵蝕" val={riskScores.inflation} />
      <RiskBar label="長壽風險" val={riskScores.longevity} />

      <Divider />
      <SecLabel>蒙地卡羅情境檢查（{DEFAULT_MONTE_CARLO_RUNS} 次）</SecLabel>
      <div className="risk-explanation">
        FIRE 門檻先回答是否達到目標；這裡用固定種子的簡化均勻模型檢查不確定性。每年報酬以你設定的退休後報酬率為中心，在上下各 {SIMPLE_MODEL_MAX_ANNUAL_RETURN_OFFSET * 100} 個百分點內等機率抽樣。模型版本：{SIMPLE_MODEL_ID}。它不是歷史市場校準、真實成功機率或保證，也不會把最早達標年齡變成退休建議。
      </div>
      <div style={{ background: "#1A1916", border: "1px solid #2E2C28", borderRadius: 8, padding: "16px 12px", marginBottom: 12 }}>
        <MiniChart
          data={mcData}
          color={survFinal >= 90 ? "#4CAF85" : survFinal >= 70 ? "#C8953A" : "#C05050"}
          height={100}
          startAge={inp.retAge}
          ariaLabel={`${inp.retAge}歲至${inp.lifeExp}歲的蒙地卡羅存活比例趨勢`}
        />
        <div style={{ marginTop: 14, fontSize: 16, color: "#9B9890", lineHeight: 1.7 }}>
          {inp.lifeExp}歲仍有資產（{DEFAULT_MONTE_CARLO_RUNS}個簡化情境）：{" "}
          <strong style={{ color: survFinal >= 90 ? "#4CAF85" : survFinal >= 70 ? "#C8953A" : "#C05050", fontSize: 22 }}>{survFinal}%</strong>
          <br />
          {survFinal >= 90 ? "在這組假設下多數情境可支撐；不代表零風險或保證結果。" : survFinal >= 70 ? "在這組假設下仍有一定緩衝，可再測試較保守情境。" : "在這組假設下耗盡風險較高，建議調整後再比較。"}
        </div>
      </div>

      <Divider />
      <SecLabel>情境模擬</SecLabel>
      <div style={{ fontSize: 15, color: "#5C5A55", marginBottom: 12, padding: "10px 12px", background: "#1A1916", borderRadius: 8, lineHeight: 1.55 }}>
        計算起點：退休時投資組合 <strong style={{ color: "#C8A96E" }}>{fmt(portAtRet, currency)}</strong>
        {inp.retAge > inp.age ? `（現金不計投資複利；投資含退休前 ${inp.retAge - inp.age} 年複利＋每年投入 ${fmt(moneyWanToTwd(inp.annualContrib, currency), currency)}）` : ""}
      </div>
      {res.scenarioResults.map(({ lbl, end }) => (
        <div key={lbl} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #1E1C18" }}>
          <span style={{ fontSize: 15, color: "#9B9890", flex: 1, paddingRight: 12, lineHeight: 1.45 }}>{lbl}</span>
          <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace", color: end > 0 ? "#4CAF85" : "#C05050", lineHeight: 1.35 }}>
            {end > 0 ? fmt(end, currency) : "資產耗盡"}
          </span>
        </div>
      ))}
    </div>
  );
}
