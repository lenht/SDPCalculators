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

/* ══════════════════════════════════════════════
   BAO SIZE & FULL AGE CALCULATORS
   ══════════════════════════════════════════════

  BAO size formula (Sky Darmos; 2019 & 2025):

    d_BAO = ( √(5/3 · (1/m_p) · k_B · T_i) / c )
            × [ (T_i/T₀ − 1) · Δx_z − t_d ]

  where:
    T_i  = initial (decoupling) temperature of the CMB photon gas (K)
           True value: 4,021 K  (user-adjustable)
    T₀   = current CMB temperature = 2.725 K
    Δx_z = 3c/H₀  (the coefficient K from the time-redshift equation, in ly)
    t_d  = duration of the decoupling epoch ≈ 4.2 × 10¹³ yr
           (expressed in years for subtraction before converting)
    m_p  = proton mass (kg)
    k_B  = Boltzmann constant (J/K)
    c    = speed of light (m/s)

  Full age of universe:

    t_universe = (T_i/T₀ − 1) · Δx_z

  The BAO size and full age share the same bracket factor:
    bracket = (T_i/T₀ − 1) · Δx_z  −  t_d

  Note on units:
    The sound-speed prefactor  √(5/3 · k_B · T_i / m_p) / c  is dimensionless.
    Δx_z is in lightyears; t_d must be subtracted in lightyears (1 yr ≈ 1 lyr
    for travel distance), giving d_BAO in lightyears.
*/

/* ── BAO / FULL AGE CONSTANTS ───────────────── */

const K_B       = 1.380649e-23;       // J/K  (Boltzmann constant)
const M_PROTON  = 1.67262192369e-27;  // kg
const T0_CMB    = 2.725;              // K  (current CMB temperature)
const T_I_TRUE  = 4021;              // K  (true initial temperature)
const T_D_YR    = 4.2e13;            // yr (duration of decoupling epoch)

// Sound speed prefactor: v_s / c = √(5/3 · k_B · T_i / m_p) / c
function soundSpeedFraction(T_i) {
  return Math.sqrt((5 / 3) * (K_B * T_i / M_PROTON)) / C_MS;
}

// Full age of universe in lightyears
// t_universe = (T_i / T₀ − 1) × Δx_z
function calcFullAge_lyr(T_i, h0_kms_mpc) {
  const delta_xz = metresTo_lyr(calcT0_metres(1, h0_kms_mpc)); // lyr per unit z
  return (T_i / T0_CMB - 1) * delta_xz;
}

// BAO size in lightyears
// d_BAO = (v_s/c) × [ (T_i/T₀ − 1) × Δx_z − t_d ]
// t_d in lyr ≈ t_d in yr  (light travel: 1 yr ≈ 1 ly)
function calcBAO_lyr(T_i, h0_kms_mpc) {
  const vs_frac  = soundSpeedFraction(T_i);
  const fullAge  = calcFullAge_lyr(T_i, h0_kms_mpc);  // lyr
  const bracket  = fullAge - T_D_YR;                   // lyr (t_d yr ≈ t_d lyr)
  return vs_frac * bracket;
}

/* ── BAO INIT ───────────────────────────────── */

function initBAOPage() {
  // Pre-fill reference constants
  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  setVal("bao-const-kb",   K_B.toExponential(6));
  setVal("bao-const-mp",   M_PROTON.toExponential(9));
  setVal("bao-const-T0",   T0_CMB);
  setVal("bao-const-td",   (4.2e13).toExponential(1));

  // Pre-fill calculator inputs
  const tiInput = document.getElementById("bao-input-Ti");
  const h0Input = document.getElementById("bao-input-h0");
  if (tiInput) tiInput.value = T_I_TRUE;
  if (h0Input) h0Input.value = H0_KMS_MPC_DEFAULT;
}

/* ── BAO CALCULATOR ─────────────────────────── */

document.getElementById("bao-calc-btn").addEventListener("click", () => {
  const result = document.getElementById("bao-result");

  const T_i = parseFloat(document.getElementById("bao-input-Ti").value);
  const h0  = parseFloat(document.getElementById("bao-input-h0").value);

  if (!Number.isFinite(T_i) || T_i <= T0_CMB) {
    result.innerHTML = `Please enter a valid T<sub>i</sub> greater than T₀ = ${T0_CMB} K.`;
    return;
  }
  if (!Number.isFinite(h0) || h0 <= 0) {
    result.innerHTML = "Please enter a valid positive H₀.";
    return;
  }

  const delta_xz   = metresTo_lyr(calcT0_metres(1, h0));   // lyr per unit z
  const fullAge    = calcFullAge_lyr(T_i, h0);              // lyr
  const vs_frac    = soundSpeedFraction(T_i);
  const bracket    = fullAge - T_D_YR;                      // lyr
  const bao_lyr    = vs_frac * bracket;

  // Full age in years (≈ lyr for this context)
  const fullAge_yr = fullAge;   // lyr ≈ yr for this purpose

  // Format large numbers in scientific notation neatly
  const fmtYr = n => {
    const exp = Math.floor(Math.log10(Math.abs(n)));
    const man = n / Math.pow(10, exp);
    return `${man.toFixed(3)} × 10<sup>${exp}</sup>`;
  };

  result.innerHTML = `
    <strong>Results</strong><br><br>

    <div class="lookup-row">
      <span class="lookup-label">T<sub>i</sub> used:</span>
      <span class="lookup-value">${T_i.toLocaleString("en-US")} K</span>
    </div>
    <div class="lookup-row">
      <span class="lookup-label">T₀ (CMB today):</span>
      <span class="lookup-value">${T0_CMB} K</span>
    </div>
    <div class="lookup-row">
      <span class="lookup-label">H₀ used:</span>
      <span class="lookup-value">${h0} km/s/Mpc</span>
    </div>
    <div class="lookup-row">
      <span class="lookup-label">Δx<sub>z</sub> = 3c/H₀:</span>
      <span class="lookup-value">${formatNumber(Math.round(delta_xz))} lyr per unit z</span>
    </div>
    <div class="lookup-row">
      <span class="lookup-label">Sound speed fraction v<sub>s</sub>/c:</span>
      <span class="lookup-value">${vs_frac.toFixed(8)}</span>
    </div>

    <div class="lookup-row" style="margin-top:12px; padding-top:12px; border-top:1px solid #dbe7f5;">
      <span class="lookup-label"><strong>Full age of universe:</strong></span>
      <span class="lookup-value" style="font-weight:700; color:#1e3a5f; font-size:15px;">
        ${fmtYr(fullAge_yr)} yr
      </span>
    </div>

    <div class="lookup-row" style="margin-top:8px;">
      <span class="lookup-label">Bracket [(T<sub>i</sub>/T₀ − 1)·Δx<sub>z</sub> − t<sub>d</sub>]:</span>
      <span class="lookup-value">${fmtYr(bracket)} lyr</span>
    </div>

    <div class="lookup-row" style="margin-top:8px;">
      <span class="lookup-label"><strong>BAO size d<sub>BAO</sub>:</strong></span>
      <span class="lookup-value" style="font-weight:700; color:#1e3a5f; font-size:15px;">
        ${formatNumber(Math.round(bao_lyr))} lyr
      </span>
    </div>
  `;
});

/* ── BAO RESET ──────────────────────────────── */

document.getElementById("bao-reset-btn").addEventListener("click", () => {
  document.getElementById("bao-input-Ti").value = T_I_TRUE;
  document.getElementById("bao-input-h0").value = H0_KMS_MPC_DEFAULT;
  document.getElementById("bao-result").innerHTML = "—";
});

/* ── BOOT ───────────────────────────────────── */

initPage();
initBAOPage();
