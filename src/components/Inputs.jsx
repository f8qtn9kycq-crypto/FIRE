import { CURRENCIES, fmt, moneyWanToTwd } from "../utils/formatters";
import { Card, Divider, NumInput, SecLabel, Slider } from "./SummaryCards";

export default function Inputs({ inp, setInput, ready, res }) {
  const currency = res?.currency || CURRENCIES[inp.currencyCode] || CURRENCIES.TWD;
  const moneyPrefix = currency.symbol || currency.code;
  const isFutureAssessment = Boolean(res && res.yToRet > 0);
  const assessmentLabel = isFutureAssessment ? "退休時預估投資組合" : "目前投資組合";

  return (
    <div>
      {ready && res && (
        <div
          style={{
            background: res.fireReadyAtRet ? "#0D2B1E" : "#2B1A0D",
            border: `1px solid ${res.fireReadyAtRet ? "#1D5C3A" : "#5C3A1D"}`,
            borderRadius: 8,
            padding: "14px 16px",
            marginBottom: 20,
            fontSize: 13,
            color: res.fireReadyAtRet ? "#4CAF85" : "#C8953A",
            lineHeight: 1.6,
          }}
        >
          {res.fireReadyAtRet
            ? `${isFutureAssessment ? "依退休前投入與複利估算，退休時可達財務自由" : "您已達到財務自由"}！${assessmentLabel} ${fmt(res.assessmentPortfolio, currency)}，是目標 ${fmt(res.fireTarget, currency)} 的 ${(res.assessmentPortfolio / res.fireTarget).toFixed(1)} 倍。`
            : `${assessmentLabel}距離財務自由目標 ${fmt(res.fireTarget, currency)} 還差 ${fmt(Math.abs(res.assessmentGap), currency)}。`}
        </div>
      )}

      {ready && res && (
        <div className="summary-grid">
          <Card label="財務自由目標" value={fmt(res.fireTarget, currency)} sub={`${inp.swr}% 提領率`} />
          <Card
            label={res.fireReadyAtRet ? "退休時超額資產" : "退休時資金缺口"}
            value={(res.fireReadyAtRet ? "+" : "-") + fmt(Math.abs(res.assessmentGap), currency)}
            sub={isFutureAssessment ? `${inp.retAge}歲評估` : "今日評估"}
            color={res.fireReadyAtRet ? "good" : "bad"}
          />
          <Card label="總提領金額" value={fmt(res.grossW, currency) + "/年"} sub="稅前" />
          <Card label="淨提領金額" value={fmt(res.netW, currency) + "/年"} sub={`扣除 ${inp.cgTax}% 稅後`} color="warn" />
        </div>
      )}

      <Divider />
      <SecLabel>您的數字</SecLabel>
      <div className="age-grid" style={{ gap: 12 }}>
        <NumInput label="目前年齡" value={inp.age} onChange={(v) => setInput("age", v)} placeholder="例：45" />
        <NumInput label="預期壽命" value={inp.lifeExp} onChange={(v) => setInput("lifeExp", v)} placeholder="例：90" />
        <NumInput label="退休年齡" value={inp.retAge} onChange={(v) => setInput("retAge", v)} placeholder="例：55" />
      </div>
      <div className="money-grid" style={{ gap: 12 }}>
        <NumInput label="現金儲蓄" isWan prefix={moneyPrefix} value={inp.cash} onChange={(v) => setInput("cash", v)} placeholder="例：500（萬）" />
        <NumInput label="投資總額" isWan prefix={moneyPrefix} value={inp.investments} onChange={(v) => setInput("investments", v)} placeholder="例：2500（萬）" />
      </div>
      {(inp.cash > 0 || inp.investments > 0) && (
        <div style={{ fontSize: 12, color: "#5C5A55", marginBottom: 12, marginTop: -8, paddingLeft: 2 }}>
          合計：{fmt(moneyWanToTwd(inp.cash, currency) + moneyWanToTwd(inp.investments, currency), currency)}
        </div>
      )}
      <NumInput label="年支出（現值）" isWan prefix={moneyPrefix} value={inp.expenses} onChange={(v) => setInput("expenses", v)} placeholder="例：100（萬）" />
      <NumInput label="退休前每年投入金額" isWan prefix={moneyPrefix} value={inp.annualContrib} onChange={(v) => setInput("annualContrib", v)} placeholder="例：200（萬）" />
      {inp.annualContrib > 0 && inp.retAge > inp.age && (
        <div style={{ fontSize: 12, color: "#5C5A55", marginBottom: 12, marginTop: -8, paddingLeft: 2 }}>
          退休前共投入 {inp.retAge - inp.age} 年，合計 {fmt(moneyWanToTwd(inp.annualContrib, currency) * (inp.retAge - inp.age), currency)}（未含複利）
        </div>
      )}

      <Divider />
      <SecLabel>報酬率假設</SecLabel>
      <Slider label="退休前年報酬率" value={inp.retPre} min={2} max={15} step={0.5} onChange={(v) => setInput("retPre", v)} />
      <Slider label="退休後年報酬率" value={inp.retPost} min={1} max={12} step={0.5} onChange={(v) => setInput("retPost", v)} />
      <Slider label="安全提領率" value={inp.swr} min={2} max={6} step={0.25} onChange={(v) => setInput("swr", v)} />
      <Slider label="通貨膨脹率" value={inp.inf} min={0} max={8} step={0.25} onChange={(v) => setInput("inf", v)} />

      <Divider />
      <SecLabel>稅率設定</SecLabel>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: "#9B9890", marginBottom: 6 }}>輸入 / 顯示幣別</div>
        <select
          value={inp.currencyCode}
          onChange={(e) => setInput("currencyCode", e.target.value)}
          style={{ width: "100%", padding: "13px 12px", fontSize: 16, background: "#1A1916", border: "1px solid #2E2C28", borderRadius: 8, color: "#E8E4DC" }}
        >
          {Object.keys(CURRENCIES).map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </div>
      <NumInput label="資本利得稅率 %" value={inp.cgTax} onChange={(v) => setInput("cgTax", v)} placeholder="例：20" />
    </div>
  );
}
