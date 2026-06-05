/* ─────────────────────────────────────────────
   shared.js
   Sidebar toggle, common utilities, formatting
   ───────────────────────────────────────────── */

/* FORMAT HELPERS */

function displayG(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  return Number(value).toFixed(6);
}

function formatNumber(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  return Number(value).toLocaleString("en-US", {
    maximumSignificantDigits: 18
  });
}

function formatSci(value, digits = 4) {
  if (value === null || value === undefined || value === "" || !Number.isFinite(value)) {
    return "—";
  }
  return Number(value).toExponential(digits);
}
