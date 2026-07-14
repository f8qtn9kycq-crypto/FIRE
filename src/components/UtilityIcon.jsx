const ICON_PATHS = {
  share: (
    <path d="M21 3 10.5 13.5M21 3l-6.7 18-3.8-7.5L3 9.7 21 3Z" />
  ),
  reset: (
    <>
      <path d="M20 11a8 8 0 1 0 1.1 4.8" />
      <path d="M20 5v6h-6" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.7 9.5a2.4 2.4 0 1 1 4.5 1.2c-.3.8-.8 1.2-1.5 1.7-.6.4-.9.8-.9 1.6" />
      <path d="M12 17h.01" />
    </>
  ),
  formula: <text className="utility-icon-text" x="12" y="15.5" textAnchor="middle">ƒx</text>,
  close: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m9 9 6 6m0-6-6 6" />
    </>
  ),
  calculatorBack: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15.5 12h-7m0 0 3-3m-3 3 3 3" />
    </>
  ),
};

export default function UtilityIcon({ name }) {
  return (
    <svg
      className="utility-icon-svg"
      viewBox="0 0 24 24"
      focusable="false"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}
