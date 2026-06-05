/* ─────────────────────────────────────────────
   time-redshift.js
   Logic for the Time-Redshift Equation page
   ───────────────────────────────────────────── */

/*
  SPD Entropic Expansion — Time-Redshift Equation:

    t₀ = (3 c z) / H₀

  where:
    t₀ = light travel time / distance (lightyears when H₀ in matching units)
    c  = speed of light
    z  = redshift (dimensionless, user input)
    H₀ = Hubble constant

  H₀ default (supernova surveys):
    74.03 ± 1.42  km/s/Mpc
    = (7.192 ± 0.142) × 10⁻¹⁰  m/s/ls   (metres per second per lightsecond)

  With default H₀, the simplified result is:
    t₀ = 39,625,004,647 lyr × z
*/

/* ── CONSTANTS ──────────────────────────────── */

// Default H₀ in SI-friendly units: m/s per lightsecond
// 1 Mpc = 3.085677581e22 m; 1 km = 1000 m; 1 ls = 299792458 m
// H₀ = 74.03 km/s/Mpc → convert to s⁻¹ → then to m/s/ls
const H0_KMS_MPC_DEFAULT = 74.03;       // km/s/Mpc  (displayed default)
const H0_ERR_KMS_MPC     = 1.42;        // ±
const MPC_IN_M           = 3.085677581e22;
const LS_IN_M            = 299792458;   // 1 lightsecond in metres = c × 1 s
const C_MS               = 299792458;   // speed of light m/s
const LYR_IN_M           = 9.4607304725808e15; // 1 lightyear in metres

// Convert km/s/Mpc → m/s/ls
function h0_kmsMpc_to_msLs(h0_kms_mpc) {
  // km/s/Mpc × (1000 m/km) / (3.085677581e22 m/Mpc) × (299792458 m/ls)
  return (h0_kms_mpc * 1000 / MPC_IN_M) * LS_IN_M;
}

// Default in m/s/ls
const H0_MS_LS_DEFAULT = h0_kmsMpc_to_msLs(H0_KMS_MPC_DEFAULT);

// Simplified constant with default H₀: t₀ = K × z  (in lightyears)
// t₀ [m] = 3 × c [m/s] × z / H₀ [s⁻¹]
// H₀ [s⁻¹] = h0_kms_mpc × 1000 / MPC_IN_M
function calcT0_metres(z, h0_kms_mpc) {
  const H0_SI = h0_kms_mpc * 1000 / MPC_IN_M;  // s⁻¹
  return (3 * C_MS * z) / H0_SI;                // metres
}

function metresTo_lyr(m) {
  return m / LYR_IN_M;
}

// Simplified coefficient K (lightyears per unit z) at default H₀
const K_DEFAULT_LYR = metresTo_lyr(calcT0_metres(1, H0_KMS_MPC_DEFAULT));

/* ── INIT ───────────────────────────────────── */

function initPage() {
  document.getElementById("const-c").value      = C_MS;
  document.getElementById("const-h0-kms").value = H0_KMS_MPC_DEFAULT;
  document.getElementById("const-h0-err").value = H0_ERR_KMS_MPC;
  document.getElementById("const-h0-msl").value = H0_MS_LS_DEFAULT.toExponential(4);
  document.getElementById("const-k").value =
    Math.round(K_DEFAULT_LYR).toLocaleString("en-US");

  // pre-fill H₀ input
  document.getElementById("input-h0").value = H0_KMS_MPC_DEFAULT;
}

/* ── CALCULATOR ─────────────────────────────── */

document.getElementById("trz-calc-btn").addEventListener("click", () => {
  const result = document.getElementById("trz-result");

  const z    = parseFloat(document.getElementById("input-z").value);
  const h0   = parseFloat(document.getElementById("input-h0").value);

  if (!Number.isFinite(z) || z < 0) {
    result.innerHTML = "Please enter a valid non-negative redshift value z.";
    return;
  }
  if (!Number.isFinite(h0) || h0 <= 0) {
    result.innerHTML = "Please enter a valid positive Hubble constant.";
    return;
  }

  const t0_m   = calcT0_metres(z, h0);
  const t0_lyr = metresTo_lyr(t0_m);
  const K      = metresTo_lyr(calcT0_metres(1, h0));

  // uncertainty propagation: σ_t / t = σ_H / H
  const h0_err = parseFloat(document.getElementById("input-h0-err").value);
  let uncertaintyHTML = "";
  if (Number.isFinite(h0_err) && h0_err > 0) {
    const sigma_lyr = t0_lyr * (h0_err / h0);
    uncertaintyHTML = `
      <div class="lookup-row">
        <span class="lookup-label">Uncertainty (from H₀ error):</span>
        <span class="lookup-value">± ${formatNumber(Math.round(sigma_lyr))} lyr</span>
      </div>`;
  }

  result.innerHTML = `
    <strong>Results</strong><br><br>

    <div class="lookup-row">
      <span class="lookup-label">Redshift z:</span>
      <span class="lookup-value">${z}</span>
    </div>
    <div class="lookup-row">
      <span class="lookup-label">H₀ used:</span>
      <span class="lookup-value">${h0} km/s/Mpc</span>
    </div>

    <div class="lookup-row" style="margin-top:12px; padding-top:12px; border-top:1px solid #dbe7f5;">
      <span class="lookup-label"><strong>Light travel distance t₀:</strong></span>
      <span class="lookup-value" style="font-weight:700; color:#1e3a5f; font-size:15px;">
        ${formatNumber(Math.round(t0_lyr))} lyr
      </span>
    </div>

    ${uncertaintyHTML}

    <div class="lookup-row" style="margin-top:10px;">
      <span class="lookup-label">Coefficient K = 3c/H₀:</span>
      <span class="lookup-value">${formatNumber(Math.round(K))} lyr per unit z</span>
    </div>
  `;
});

/* ── RESET ──────────────────────────────────── */

document.getElementById("trz-reset-btn").addEventListener("click", () => {
  document.getElementById("input-z").value    = "";
  document.getElementById("input-h0").value   = H0_KMS_MPC_DEFAULT;
  document.getElementById("input-h0-err").value = H0_ERR_KMS_MPC;
  document.getElementById("trz-result").innerHTML = "—";
});

/* ── BOOT ───────────────────────────────────── */

initPage();
