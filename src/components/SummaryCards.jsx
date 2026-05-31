import { useEffect, useMemo, useRef, useState } from "react";
import { fmt } from "../utils/formatters";

export function MiniChart({ data, color = "#C8A96E", height = 80, startAge, currency }) {
  const ref = useRef(null);
  const [tip, setTip] = useState(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !data?.length) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const w = canvas.offsetWidth;
    const h = height;
    ctx.clearRect(0, 0, w, h);

    const max = Math.max(...data.filter((v) => v > 0), 1);
    const pts = data.map((v, i) => ({
      x: (i / Math.max(data.length - 1, 1)) * w,
      y: h - (Math.max(0, v) / max) * h * 0.85 - 4,
    }));

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + "40");
    grad.addColorStop(1, color + "00");

    const drawPath = () => {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const cx = (pts[i - 1].x + pts[i].x) / 2;
        ctx.bezierCurveTo(cx, pts[i - 1].y, cx, pts[i].y, pts[i].x, pts[i].y);
      }
    };

    drawPath();
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    drawPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }, [data, color, height]);

  const ageTicks = useMemo(() => {
    if (!startAge || !data?.length) return [];
    const endAge = startAge + data.length - 1;
    const firstTick = Math.ceil(startAge / 10) * 10;
    const ticks = [startAge];

    for (let age = firstTick; age < endAge; age += 10) {
      if (age !== startAge) ticks.push(age);
    }

    if (!ticks.includes(endAge)) ticks.push(endAge);
    return ticks.slice(0, 6);
  }, [data, startAge]);

  const updateTip = (event) => {
    if (!startAge || !data?.length) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clientX = event.touches?.[0]?.clientX ?? event.clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const index = Math.round((x / Math.max(rect.width, 1)) * (data.length - 1));
    setTip({ index, x: `${(index / Math.max(data.length - 1, 1)) * 100}%` });
  };

  return (
    <div
      className="mini-chart"
      onPointerMove={updateTip}
      onPointerDown={updateTip}
      onPointerLeave={() => setTip(null)}
      style={{ position: "relative" }}
    >
      <canvas ref={ref} style={{ width: "100%", height, display: "block", touchAction: "pan-y" }} />
      {tip && currency && (
        <div
          style={{
            position: "absolute",
            left: tip.x,
            top: 8,
            transform: "translateX(-50%)",
            background: "#0A0A08",
            border: `1px solid ${color}80`,
            borderRadius: 8,
            padding: "7px 9px",
            color: "#E8E4DC",
            fontSize: 13,
            lineHeight: 1.45,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            boxShadow: "0 8px 24px rgba(0,0,0,0.28)",
          }}
        >
          <div style={{ color, fontWeight: 700 }}>{startAge + tip.index}歲</div>
          <div>{fmt(data[tip.index], currency)}</div>
        </div>
      )}
      {ageTicks.length > 0 && (
        <div className="chart-axis">
          {ageTicks.map((age) => (
            <span key={age}>{age}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function Slider({ label, value, min, max, step, onChange, presets = [] }) {
  const current = Number(value) || 0;
  const clamp = (next) => Math.min(max, Math.max(min, Number(next.toFixed(2))));
  const changeBy = (delta) => onChange(clamp(current + delta));

  return (
    <div className="control-block">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, gap: 12, alignItems: "center" }}>
        <span style={{ fontSize: 16, color: "#C8C5BE", flex: 1, paddingRight: 8, lineHeight: 1.45 }}>{label}</span>
        <input
          type="number"
          value={current}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(clamp(parseFloat(e.target.value) || 0))}
          aria-label={`${label} 數值`}
          style={{ width: 88, minHeight: 44, padding: "8px 10px", borderRadius: 8, border: "1px solid #2E2C28", background: "#111009", color: "#E8E4DC", textAlign: "center", fontFamily: "monospace", fontSize: 17 }}
        />
      </div>
      {presets.length > 0 && (
        <div className="preset-row">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="preset-button"
              onClick={() => onChange(clamp(preset.value))}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
      <div className="stepper-row">
        <button type="button" className="stepper-button" onClick={() => changeBy(-step)} aria-label={`${label} 減少`}>
          -
        </button>
        <div className="stepper-value">{current.toFixed(step < 0.5 ? 2 : 1)}%</div>
        <button type="button" className="stepper-button" onClick={() => changeBy(step)} aria-label={`${label} 增加`}>
          +
        </button>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="range-input"
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
        <span style={{ fontSize: 13, color: "#3E3C38" }}>{min}%</span>
        <span style={{ fontSize: 13, color: "#3E3C38" }}>{max}%</span>
      </div>
    </div>
  );
}

export function NumInput({
  label,
  isWan = false,
  value,
  onChange,
  placeholder = "0",
  prefix = "NT$",
  formatValue = null,
  parseValue = null,
}) {
  const [displayValue, setDisplayValue] = useState(() => (formatValue ? formatValue(value) : value === 0 ? "" : String(value)));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isFocused) return;
    setDisplayValue(formatValue ? formatValue(value) : value === 0 ? "" : String(value));
  }, [formatValue, isFocused, value]);

  const commitValue = (rawValue) => {
    const parsed = parseValue ? parseValue(rawValue) : parseFloat(rawValue);
    onChange(Number.isFinite(parsed) ? parsed : 0);
  };

  return (
    <div className="num-input-block">
      <label className="num-input-label">{label}</label>
      <div className="num-input-wrapper">
        {isWan && (
          <span className="num-input-prefix">
            {prefix}
          </span>
        )}
        <input
          type={parseValue ? "text" : "number"}
          inputMode="decimal"
          placeholder={placeholder}
          value={displayValue}
          onChange={(e) => {
            setDisplayValue(e.target.value);
            commitValue(e.target.value);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            if (formatValue) setDisplayValue(formatValue(parseValue ? parseValue(displayValue) : value));
          }}
          className="num-input-control"
        />
        {isWan && <span className="num-input-suffix">萬</span>}
      </div>
    </div>
  );
}

export function Card({ label, value, sub, color }) {
  const c = { good: "#4CAF85", warn: "#C8953A", bad: "#C05050" }[color] || "#E8E4DC";
  return (
    <div style={{ background: "#1A1916", border: "1px solid #2E2C28", borderRadius: 8, padding: "13px 11px" }}>
      <div style={{ fontSize: 12, color: "#5C5A55", textTransform: "uppercase", marginBottom: 7, lineHeight: 1.35 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: c, fontFamily: "monospace", lineHeight: 1.15 }}>{value}</div>
      {sub && <div style={{ fontSize: 13, color: "#5C5A55", marginTop: 6, lineHeight: 1.35 }}>{sub}</div>}
    </div>
  );
}

export const Divider = () => <div style={{ height: 1, background: "#2E2C28", margin: "20px 0" }} />;

export const SecLabel = ({ children }) => (
  <div style={{ fontSize: 13, color: "#5C5A55", textTransform: "uppercase", marginBottom: 14, fontWeight: 700 }}>{children}</div>
);

export const Empty = ({ text }) => (
  <div style={{ textAlign: "center", padding: "56px 24px", color: "#5C5A55", fontSize: 16, lineHeight: 1.8 }}>
    <div style={{ fontSize: 22, fontWeight: 700, color: "#C8A96E", marginBottom: 14 }}>FIRE</div>
    {text}
  </div>
);
