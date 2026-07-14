import { useState } from "react";

function getShareUrl(kind) {
  if (typeof window === "undefined") return "";
  if (kind === "blank") {
    return `${window.location.origin}${window.location.pathname}?blank=1`;
  }
  return window.location.href;
}

export default function PlanActions({ onReset }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState("");

  const copyShareUrl = async (kind) => {
    const url = getShareUrl(kind);
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setShareStatus(kind === "blank" ? "空白試算連結已複製" : "目前輸入連結已複製");
    } catch {
      window.prompt("請複製這個試算連結", url);
      setShareStatus("連結已準備好");
    }
  };

  return (
    <div className="plan-actions">
      <button
        type="button"
        className="header-action-button"
        aria-label="分享"
        title="分享"
        aria-expanded={shareOpen}
        aria-controls="share-panel"
        onClick={() => {
          setShareOpen((open) => !open);
          setShareStatus("");
        }}
      >
        <span className="header-action-icon" aria-hidden="true">↗</span>
        <span className="header-action-label">分享</span>
      </button>
      <button type="button" className="header-action-button" aria-label="重設" title="重設" onClick={onReset}>
        <span className="header-action-icon" aria-hidden="true">↺</span>
        <span className="header-action-label">重設</span>
      </button>
      {shareOpen && (
        <div className="share-panel" id="share-panel" role="dialog" aria-modal="true" aria-label="分享試算">
          <div className="share-panel-header">
            <strong>選擇要分享的內容</strong>
            <button type="button" className="share-close-button" onClick={() => setShareOpen(false)}>
              關閉
            </button>
          </div>
          <p className="share-privacy-note">
            分享目前輸入會把試算數字放在網址中，請只分享給信任的人。分享空白試算不會帶入目前數字。
          </p>
          <button type="button" className="share-option" onClick={() => copyShareUrl("current")}>
            分享目前輸入
            <span>保留目前的試算數字</span>
          </button>
          <button type="button" className="share-option" onClick={() => copyShareUrl("blank")}>
            分享空白試算
            <span>讓對方從零開始填寫</span>
          </button>
          {shareStatus && <div className="share-status" role="status">{shareStatus}</div>}
        </div>
      )}
    </div>
  );
}
