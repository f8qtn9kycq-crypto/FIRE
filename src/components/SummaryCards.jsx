import { useEffect, useRef } from "react";

export function MiniChart({ data, color = "#C8A96E", height = 80 }) {
  const ref = useRef(null);

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

  return <canvas ref={ref} style={{ width: "100%", height, display: "block" }} />;
}

export function Slider({ label, value, min, max, step, onChange }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: "#9B9890", flex: 1, paddingRight: 8 }}>{label}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#E8E4DC", minWidth: 52, textAlign: "right" }}>
          {parseFloat(value).toFixed(1)}%
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", height: 36, accentColor: "#C8A96E", cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
        <span style={{ fontSize: 11, color: "#3E3C38" }}>{min}%</span>
        <span style={{ fontSize: 11, color: "#3E3C38" }}>{max}%</span>
      </div>
    </div>
  );
}

export function NumInput({ label, isWan = false, value, onChange, placeholder = "0", prefix = "NT$" }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, color: "#9B9890", marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", background: "#1A1916", border: "1px solid #2E2C28", borderRadius: 10, overflow: "hidden" }}>
        {isWan && (
          <span style={{ padding: "0 10px", fontSize: 13, color: "#C8A96E", fontWeight: 700, borderRight: "1px solid #2E2C28", minWidth: 48, textAlign: "center" }}>
            {prefix}
          </span>
        )}
        <input
          type="number"
          placeholder={placeholder}
          value={value === 0 ? "" : value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          style={{ flex: 1, padding: "13px 12px", fontSize: 16, background: "transparent", border: "none", outline: "none", color: "#E8E4DC", fontFamily: "monospace", minWidth: 0 }}
        />
        {isWan && <span style={{ padding: "0 12px", fontSize: 13, color: "#5C5A55", fontWeight: 600 }}>萬</span>}
      </div>
    </div>
  );
}

export function Card({ label, value, sub, color }) {
  const c = { good: "#4CAF85", warn: "#C8953A", bad: "#C05050" }[color] || "#E8E4DC";
  return (
    <div style={{ background: "#1A1916", border: "1px solid #2E2C28", borderRadius: 8, padding: "13px 11px" }}>
      <div style={{ fontSize: 10, color: "#5C5A55", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: c, fontFamily: "monospace", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#5C5A55", marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

export const Divider = () => <div style={{ height: 1, background: "#2E2C28", margin: "20px 0" }} />;

export const SecLabel = ({ children }) => (
  <div style={{ fontSize: 10, color: "#5C5A55", textTransform: "uppercase", marginBottom: 14 }}>{children}</div>
);

export const Empty = ({ text }) => (
  <div style={{ textAlign: "center", padding: "56px 24px", color: "#5C5A55", fontSize: 14, lineHeight: 1.8 }}>
    <div style={{ fontSize: 18, fontWeight: 700, color: "#C8A96E", marginBottom: 14 }}>FIRE</div>
    {text}
  </div>
);
