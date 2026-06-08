/* ─────────────────────────────────────────────
   elementary-space-radius.js
   Logic for the Elementary Space Radius page
   ───────────────────────────────────────────── */

/*
  Main formula (SPD):
    R_E = (2 G_E E) / c^4

  Massive particles — relativistic energy:
    E = m0 c² / √(1 − v²/c²)
    → R_E = (2 G_E m0 c²) / (c^4 √(1 − v²/c²))
           = (2 G_E m0) / (c² √(1 − v²/c²))

  Massless particles — energy from frequency or wavelength:
    E = h f  =  h c / λ
    → R_E = (2 G_E h f) / c^4  =  (2 G_E h) / (c³ λ)

  de Broglie wavelength for comparison:
    Massless:  λ itself (given or derived from f)
    Massive:   λ_dB = h c / √(E² − m0²c⁴)
                    = h / (m0 v / √(1 − v²/c²))   [equivalent form]
*/

/* ── PHYSICAL CONSTANTS ─────────────────────── */

const H_PLANCK = 6.62607015e-34;      // J·s
const C        = 299792458;            // m/s
const C2       = C * C;
const C4       = C2 * C2;
const C3       = C2 * C;
const K_E      = 8.9875517923e9;       // N·m²/C²
const E_CHARGE = 1.602176634e-19;      // C
const M_PROTON = 1.67262192369e-27;    // kg

/* ── ELEMENTARY SPACE CONSTANT ──────────────── */

const G_E = (K_E * E_CHARGE * E_CHARGE) / (M_PROTON * M_PROTON);
// = 8.246441821 × 10²⁵  m³ s⁻² kg⁻¹

/* ── PARTICLE TABLE ─────────────────────────── */

const PARTICLES = [
  { name: "Electron",          symbol: "e⁻",  mass: 9.1093837139e-31   },
  { name: "Muon",              symbol: "μ⁻",  mass: 1.883531627e-28    },
  { name: "Tau",               symbol: "τ⁻",  mass: 3.1675e-27         },
  { name: "Electron neutrino", symbol: "νₑ",  mass: 6.3e-37            },
  { name: "Muon neutrino",     symbol: "ν_μ", mass: 9.0785e-37         },
  { name: "Tau neutrino",      symbol: "ν_τ", mass: 3.41e-36           },
  { name: "Up quark",          symbol: "u",   mass: 3.9218564e-30      },
  { name: "Down quark",        symbol: "d",   mass: 8.3785114e-30      },
  { name: "Strange quark",     symbol: "s",   mass: 1.6935289e-28      },
  { name: "Charm quark",       symbol: "c",   mass: 2.26398074e-27     },
  { name: "Bottom quark",      symbol: "b",   mass: 7.45152716e-27     },
  { name: "Top quark",         symbol: "t",   mass: 3.0797268712e-25   },
  { name: "W boson",           symbol: "W±",  mass: 1.432711188104e-25 },
  { name: "Z boson",           symbol: "Z⁰",  mass: 1.62557382456e-25  },
  { name: "Higgs boson",       symbol: "H⁰",  mass: 2.2302884282e-25   },
  { name: "Gluon",             symbol: "g",   mass: null               },
  { name: "Photon",            symbol: "γ",   mass: null               },
];

/* ── HELPERS ────────────────────────────────── */

function setValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function show(id)  { const el = document.getElementById(id); if (el) el.style.display = "";     }
function hide(id)  { const el = document.getElementById(id); if (el) el.style.display = "none"; }

// Lorentz factor γ = 1 / √(1 − β²),  β = v/c  (0 ≤ β < 1)
function lorentzGamma(beta) {
  return 1 / Math.sqrt(1 - beta * beta);
}

// R_E from energy in joules
function calcRE(energy_J) {
  return (2 * G_E * energy_J) / C4;
}

// de Broglie wavelength for massive particle
// λ = hc / √(E² − m0²c⁴)
function calcLambdaMassive(energy_J, mass_kg) {
  const mc2 = mass_kg * C2;
  const disc = energy_J * energy_J - mc2 * mc2;
  if (disc <= 0) return null;
  return (H_PLANCK * C) / Math.sqrt(disc);
}

/* ── POPULATE PARTICLE DROPDOWN ─────────────── */

function populateParticleSelect() {
  const sel = document.getElementById("particle-select");
  if (!sel) return;
  PARTICLES.forEach((p, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${p.name} (${p.symbol})`;
    sel.appendChild(opt);
  });
}

/* ── PARTICLE SELECTION HANDLER ─────────────── */

document.getElementById("particle-select").addEventListener("change", event => {
  const p = PARTICLES[event.target.value];

  hide("inputs-massive");
  hide("inputs-massless");
  hide("inputs-placeholder");
  document.getElementById("esr-result").innerHTML = "—";

  if (!p) {
    show("inputs-placeholder");
    return;
  }

  if (p.mass !== null) {
    // Massive particle
    show("inputs-massive");
    const massField = document.getElementById("input-mass");
    massField.value = p.mass;
    massField.disabled = false;
    document.getElementById("mass-note").textContent =
      `Rest energy m₀c² = ${formatSci(p.mass * C2)} J`;
    // Clear velocity
    document.getElementById("input-velocity-pct").value = "";
  } else {
    // Massless particle
    show("inputs-massless");
    document.getElementById("input-freq").value = "";
    document.getElementById("input-wavelength").value = "";
  }
});

/* ── CALCULATE BUTTON ───────────────────────── */

document.getElementById("esr-calc-btn").addEventListener("click", () => {
  const result = document.getElementById("esr-result");

  const particleIdx = document.getElementById("particle-select").value;
  if (particleIdx === "") {
    result.innerHTML = "Please select a particle first.";
    return;
  }

  const p = PARTICLES[particleIdx];

  /* ── MASSIVE ── */
  if (p.mass !== null) {
    const mass_kg  = parseFloat(document.getElementById("input-mass").value);
    const velPct   = parseFloat(document.getElementById("input-velocity-pct").value);

    if (!Number.isFinite(mass_kg) || mass_kg <= 0) {
      result.innerHTML = "Please enter a valid rest mass.";
      return;
    }
    if (!Number.isFinite(velPct) || velPct < 0 || velPct >= 100) {
      result.innerHTML = "Please enter a velocity between 0% and 100% of c (exclusive of 100%).";
      return;
    }

    const beta    = velPct / 100;                          // fraction of c
    const gamma   = lorentzGamma(beta);                    // Lorentz factor
    const v_ms    = beta * C;                              // m/s
    const energy_J = mass_kg * C2 * gamma;                // relativistic energy E = γm₀c²
    const RE       = calcRE(energy_J);
    const lambda   = calcLambdaMassive(energy_J, mass_kg); // de Broglie wavelength

    const compHTML = comparisonFlag(RE, lambda);

    result.innerHTML = `
      <strong>Results</strong><br><br>

      <div class="lookup-row">
        <span class="lookup-label">Particle:</span>
        <span class="lookup-value">${p.name} (${p.symbol})</span>
      </div>
      <div class="lookup-row">
        <span class="lookup-label">Rest mass m₀:</span>
        <span class="lookup-value">${formatSci(mass_kg)} kg</span>
      </div>
      <div class="lookup-row">
        <span class="lookup-label">Rest energy m₀c²:</span>
        <span class="lookup-value">${formatSci(mass_kg * C2)} J</span>
      </div>
      <div class="lookup-row">
        <span class="lookup-label">Velocity v:</span>
        <span class="lookup-value">${velPct}% of c &nbsp;=&nbsp; ${formatSci(v_ms)} m/s</span>
      </div>
      <div class="lookup-row">
        <span class="lookup-label">Lorentz factor γ = 1/√(1−v²/c²):</span>
        <span class="lookup-value">${gamma.toExponential(6)}</span>
      </div>
      <div class="lookup-row">
        <span class="lookup-label">Relativistic energy E = γm₀c²:</span>
        <span class="lookup-value">${formatSci(energy_J)} J</span>
      </div>

      <div class="lookup-row" style="margin-top:12px; padding-top:12px; border-top:1px solid #dbe7f5;">
        <span class="lookup-label"><strong>Elementary space radius R<sub>E</sub>:</strong></span>
        <span class="lookup-value" style="font-weight:700; color:#1e3a5f; font-size:15px;">${formatSci(RE)} m</span>
      </div>
      <div class="lookup-row">
        <span class="lookup-label"><strong>Elementary space diameter 2R<sub>E</sub>:</strong></span>
        <span class="lookup-value" style="font-weight:700; color:#1e3a5f; font-size:15px;">${formatSci(2 * RE)} m</span>
      </div>

      ${lambda !== null ? `
      <div class="lookup-row">
        <span class="lookup-label">de Broglie wavelength λ = hc / √(E²−m₀²c⁴):</span>
        <span class="lookup-value" style="font-weight:700; color:#1e3a5f; font-size:15px;">${formatSci(lambda)} m</span>
      </div>` : ""}

      ${compHTML}
    `;
    return;
  }

  /* ── MASSLESS ── */
  const freqRaw  = document.getElementById("input-freq").value.trim();
  const lambdaRaw = document.getElementById("input-wavelength").value.trim();

  let energy_J = NaN;
  let freq_Hz  = NaN;
  let wl_m     = NaN;
  let inputDesc = "";

  if (freqRaw !== "") {
    freq_Hz  = parseFloat(freqRaw);
    if (!Number.isFinite(freq_Hz) || freq_Hz <= 0) {
      result.innerHTML = "Please enter a valid positive frequency (Hz).";
      return;
    }
    wl_m      = C / freq_Hz;
    energy_J  = H_PLANCK * freq_Hz;
    inputDesc = `frequency f = ${formatSci(freq_Hz)} Hz`;
  } else if (lambdaRaw !== "") {
    wl_m     = parseFloat(lambdaRaw);
    if (!Number.isFinite(wl_m) || wl_m <= 0) {
      result.innerHTML = "Please enter a valid positive wavelength (m).";
      return;
    }
    freq_Hz  = C / wl_m;
    energy_J = H_PLANCK * C / wl_m;
    inputDesc = `wavelength λ = ${formatSci(wl_m)} m`;
  } else {
    result.innerHTML = "Please enter a frequency (Hz) or wavelength (m).";
    return;
  }

  const RE = calcRE(energy_J);
  const compHTML = comparisonFlag(RE, wl_m);

  result.innerHTML = `
    <strong>Results</strong><br><br>

    <div class="lookup-row">
      <span class="lookup-label">Particle:</span>
      <span class="lookup-value">${p.name} (${p.symbol})</span>
    </div>
    <div class="lookup-row">
      <span class="lookup-label">Input:</span>
      <span class="lookup-value">${inputDesc}</span>
    </div>
    <div class="lookup-row">
      <span class="lookup-label">Frequency f:</span>
      <span class="lookup-value">${formatSci(freq_Hz)} Hz</span>
    </div>
    <div class="lookup-row">
      <span class="lookup-label">Wavelength λ = hc / E:</span>
      <span class="lookup-value">${formatSci(wl_m)} m</span>
    </div>
    <div class="lookup-row">
      <span class="lookup-label">Energy E = hf:</span>
      <span class="lookup-value">${formatSci(energy_J)} J</span>
    </div>

    <div class="lookup-row" style="margin-top:12px; padding-top:12px; border-top:1px solid #dbe7f5;">
      <span class="lookup-label"><strong>Elementary space radius R<sub>E</sub>:</strong></span>
      <span class="lookup-value" style="font-weight:700; color:#1e3a5f; font-size:15px;">${formatSci(RE)} m</span>
    </div>
    <div class="lookup-row">
      <span class="lookup-label"><strong>Elementary space diameter 2R<sub>E</sub>:</strong></span>
      <span class="lookup-value" style="font-weight:700; color:#1e3a5f; font-size:15px;">${formatSci(2 * RE)} m</span>
    </div>
    <div class="lookup-row">
      <span class="lookup-label">Wavelength λ (for comparison):</span>
      <span class="lookup-value" style="font-weight:700; color:#1e3a5f; font-size:15px;">${formatSci(wl_m)} m</span>
    </div>

    ${compHTML}
  `;
});

/* ── COMPARISON FLAG ────────────────────────── */

function comparisonFlag(RE, lambda) {
  if (lambda === null || !Number.isFinite(lambda)) return "";
  const diameter = 2 * RE;
  if (diameter < lambda) {
    return `
      <div class="comparison-flag flag-below">
        2R<sub>E</sub> &lt; λ — the elementary space diameter is
        <strong>smaller</strong> than the wavelength.
        The particle wavelength exceeds the size of the elementary space.
        Regular quantum mechanics is sufficient in this regime.
      </div>`;
  } else if (diameter > lambda) {
    return `
      <div class="comparison-flag flag-above">
        2R<sub>E</sub> &gt; λ — the elementary space diameter is
        <strong>larger</strong> than the wavelength.
        According to SPD, smaller wavelengths no longer probe smaller
        distances. This explains the particle desert observed at the LHC.
      </div>`;
  } else {
    return `
      <div class="comparison-flag flag-equal">
        2R<sub>E</sub> = λ — critical point: the elementary space diameter
        equals the wavelength.
      </div>`;
  }
}

/* ── RESET BUTTON ───────────────────────────── */

document.getElementById("esr-reset-btn").addEventListener("click", () => {
  document.getElementById("particle-select").value = "";
  document.getElementById("input-mass").value = "";
  document.getElementById("input-mass").disabled = false;
  document.getElementById("input-velocity-pct").value = "";
  document.getElementById("mass-note").textContent = "";
  document.getElementById("input-freq").value = "";
  document.getElementById("input-wavelength").value = "";
  document.getElementById("esr-result").innerHTML = "—";
  hide("inputs-massive");
  hide("inputs-massless");
  show("inputs-placeholder");
});

/* ── REFERENCE CONSTANTS DISPLAY ───────────── */

function showConstants() {
  setValue("const-ge",  G_E.toExponential(9));
  setValue("const-c",   C);
  setValue("const-h",   H_PLANCK);
  setValue("const-ke",  K_E);
  setValue("const-e",   E_CHARGE);
  setValue("const-mp",  M_PROTON);
}

/* ── BOOT ───────────────────────────────────── */

populateParticleSelect();
showConstants();

/* ══════════════════════════════════════════════
   RELATIVISTIC GROWTH VISUALISER
   ══════════════════════════════════════════════ */

(function () {

  /* ── state ── */
  let visMass = null;      // kg
  let visName = "";
  let animFrame = null;

  /* ── DOM refs ── */
  const visSel         = document.getElementById("vis-particle-select");
  const visControls    = document.getElementById("vis-controls");
  const visPlaceholder = document.getElementById("vis-placeholder");
  const visSlider      = document.getElementById("vis-slider");
  const visVelLabel    = document.getElementById("vis-vel-label");
  const visGammaLabel  = document.getElementById("vis-gamma-label");
  const visReadout     = document.getElementById("vis-readout");
  const canvas         = document.getElementById("vis-canvas");
  const ctx            = canvas.getContext("2d");

  /* ── populate dropdown (massive only) ── */
  PARTICLES.forEach((p, i) => {
    if (p.mass === null) return;
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${p.name} (${p.symbol})`;
    visSel.appendChild(opt);
  });

  /* ── particle selection ── */
  visSel.addEventListener("change", e => {
    const p = PARTICLES[e.target.value];
    if (!p || p.mass === null) {
      visControls.style.display = "none";
      visPlaceholder.style.display = "";
      visMass = null;
      return;
    }
    visMass = p.mass;
    visName = `${p.name} (${p.symbol})`;
    visPlaceholder.style.display = "none";
    visControls.style.display = "";
    visSlider.value = "0";
    renderFrame(0);
  });

  /* ── slider input ── */
  visSlider.addEventListener("input", () => {
    renderFrame(parseFloat(visSlider.value));
  });

  /* ── main render ── */
  function renderFrame(velPct) {
    if (visMass === null) return;

    const beta   = Math.min(velPct / 100, 0.9999999);
    const gamma  = 1 / Math.sqrt(1 - beta * beta);
    const energy = visMass * C2 * gamma;
    const RE     = (2 * G_E * energy) / C4;

    // de Broglie wavelength
    const mc2   = visMass * C2;
    const disc  = energy * energy - mc2 * mc2;
    const lamDB = disc > 0 ? (H_PLANCK * C) / Math.sqrt(disc) : null;

    // rest values for normalisation
    const E0    = visMass * C2;
    const RE0   = (2 * G_E * E0) / C4;

    // labels
    visVelLabel.textContent  = velPct < 0.001 ? "0" : velPct.toPrecision(7).replace(/\.?0+$/, "");
    visGammaLabel.textContent = `γ = ${gamma < 1e6 ? gamma.toFixed(6) : gamma.toExponential(4)}`;

    drawCanvas(beta, gamma, RE, RE0, lamDB, velPct);
    updateReadout(velPct, beta, gamma, energy, RE, lamDB);
  }

  /* ── canvas drawing ── */
  function drawCanvas(beta, gamma, RE, RE0, lamDB, velPct) {
    // Resize canvas to its CSS pixel width
    canvas.width  = canvas.offsetWidth * window.devicePixelRatio || canvas.offsetWidth;
    canvas.height = 220 * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    const W = canvas.offsetWidth;
    const H = 220;
    ctx.clearRect(0, 0, W, H);

    const PAD_L = 64, PAD_R = 24, PAD_T = 28, PAD_B = 40;
    const plotW = W - PAD_L - PAD_R;
    const plotH = H - PAD_T - PAD_B;

    /* ── axis ── */
    ctx.strokeStyle = "#cddff5";
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(PAD_L, PAD_T);
    ctx.lineTo(PAD_L, PAD_T + plotH);
    ctx.lineTo(PAD_L + plotW, PAD_T + plotH);
    ctx.stroke();

    // x-axis ticks
    ctx.fillStyle   = "#64748b";
    ctx.font        = "11px Arial";
    ctx.textAlign   = "center";
    [0, 25, 50, 75, 90, 99].forEach(pct => {
      const x = PAD_L + (pct / 99.99999) * plotW;
      ctx.beginPath();
      ctx.moveTo(x, PAD_T + plotH);
      ctx.lineTo(x, PAD_T + plotH + 4);
      ctx.strokeStyle = "#cddff5";
      ctx.stroke();
      ctx.fillText(pct + "%", x, PAD_T + plotH + 16);
    });

    // y-axis label
    ctx.save();
    ctx.translate(13, PAD_T + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillStyle = "#64748b";
    ctx.font = "11px Arial";
    ctx.fillText("log₁₀ scale (normalised)", 0, 0);
    ctx.restore();

    /* ── plot curves ── */
    // We plot log10(value / RE0) over velPct 0 → 99.99999
    // Both R_E and λ_dB, normalised to RE0 so at rest R_E/RE0 = 1

    const STEPS = 300;

    function xOfPct(p)   { return PAD_L + (p / 99.99999) * plotW; }
    function yOfLog(logV) {
      // map log range [-20, +20] to plot height
      const LOG_MIN = -18, LOG_MAX = 22;
      const norm = (logV - LOG_MIN) / (LOG_MAX - LOG_MIN);
      return PAD_T + plotH - norm * plotH;
    }

    // Draw reference line at log10(2) = where 2RE starts at rest
    const LOG2 = Math.log10(2);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(PAD_L,            yOfLog(LOG2));
    ctx.lineTo(PAD_L + plotW,    yOfLog(LOG2));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#94a3b8";
    ctx.font      = "10px Arial";
    ctx.textAlign = "right";
    ctx.fillText("2R_E₀", PAD_L - 4, yOfLog(LOG2) + 4);

    // R_E curve  (blue)
    ctx.beginPath();
    ctx.strokeStyle = "#2f5f8f";
    ctx.lineWidth   = 2.5;
    for (let s = 0; s <= STEPS; s++) {
      const p  = (s / STEPS) * 99.99999;
      const b  = p / 100;
      const g  = 1 / Math.sqrt(1 - b * b);
      const re = (2 * G_E * visMass * C2 * g) / C4;
      const lv = Math.log10(2 * re / RE0);
      const x  = xOfPct(p);
      const y  = yOfLog(lv);
      s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // λ_dB curve  (orange)
    ctx.beginPath();
    ctx.strokeStyle = "#f97316";
    ctx.lineWidth   = 2.5;
    let started = false;
    for (let s = 1; s <= STEPS; s++) {   // skip s=0 (v=0 → λ = ∞)
      const p    = (s / STEPS) * 99.99999;
      const b    = p / 100;
      const g    = 1 / Math.sqrt(1 - b * b);
      const E_s  = visMass * C2 * g;
      const mc2s = visMass * C2;
      const disc = E_s * E_s - mc2s * mc2s;
      if (disc <= 0) continue;
      const lam  = (H_PLANCK * C) / Math.sqrt(disc);
      const lv   = Math.log10(lam / RE0);
      const x    = xOfPct(p);
      const y    = yOfLog(lv);
      if (!started) { ctx.moveTo(x, y); started = true; }
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    /* ── current velocity marker ── */
    const xNow = xOfPct(velPct);
    ctx.strokeStyle = "#1e3a5f";
    ctx.lineWidth   = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(xNow, PAD_T);
    ctx.lineTo(xNow, PAD_T + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Dot on R_E curve at current v
    const logRE_now = Math.log10(2 * RE / RE0);
    ctx.fillStyle = "#2f5f8f";
    ctx.beginPath();
    ctx.arc(xNow, yOfLog(logRE_now), 5, 0, Math.PI * 2);
    ctx.fill();

    // Dot on λ_dB curve
    if (lamDB !== null && beta > 0) {
      const logLam = Math.log10(lamDB / RE0);
      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.arc(xNow, yOfLog(logLam), 5, 0, Math.PI * 2);
      ctx.fill();
    }

    /* ── legend ── */
    const LEG_X = PAD_L + 14, LEG_Y = PAD_T + 14;
    ctx.font = "12px Arial";
    ctx.textAlign = "left";

    ctx.fillStyle = "#2f5f8f";
    ctx.fillRect(LEG_X, LEG_Y, 18, 3);
    ctx.fillText("2R_E  (elementary space diameter)", LEG_X + 24, LEG_Y + 4);

    ctx.fillStyle = "#f97316";
    ctx.fillRect(LEG_X, LEG_Y + 18, 18, 3);
    ctx.fillText("λ_dB  (de Broglie wavelength)", LEG_X + 24, LEG_Y + 22);

    /* ── crossover annotation ── */
    // Find crossover velocity numerically
    let crossPct = null;
    for (let s = 1; s < STEPS; s++) {
      const p1   = (s / STEPS) * 99.99999;
      const p2   = ((s + 1) / STEPS) * 99.99999;
      const re1  = reAtPct(p1), re2  = reAtPct(p2);
      const la1  = lamAtPct(p1), la2 = lamAtPct(p2);
      if (la1 && la2 && 2*re1 < la1 && 2*re2 >= la2) { crossPct = (p1 + p2) / 2; break; }
    }
    if (crossPct !== null) {
      const xC = xOfPct(crossPct);
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth   = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(xC, PAD_T);
      ctx.lineTo(xC, PAD_T + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle   = "#166534";
      ctx.font        = "11px Arial";
      ctx.textAlign   = xC > W / 2 ? "right" : "left";
      const offset    = xC > W / 2 ? -6 : 6;
      ctx.fillText(`2R_E = λ  at  ~${crossPct.toPrecision(4)}% c`, xC + offset, PAD_T + plotH - 8);
    }
  }

  function reAtPct(p) {
    const b = p / 100, g = 1 / Math.sqrt(1 - b * b);
    return (2 * G_E * visMass * C2 * g) / C4;
  }
  function lamAtPct(p) {
    const b = p / 100, g = 1 / Math.sqrt(1 - b * b);
    const E = visMass * C2 * g, mc2 = visMass * C2;
    const d = E * E - mc2 * mc2;
    return d > 0 ? (H_PLANCK * C) / Math.sqrt(d) : null;
  }

  /* ── live readout grid ── */
  function readoutRow(label, value) {
    return `
      <div>
        <div style="font-size:12px; font-weight:700; color:#1e3a5f;">${label}</div>
        <div style="font-family:monospace; font-size:13px; color:#334155;">${value}</div>
      </div>`;
  }

  function updateReadout(velPct, beta, gamma, energy, RE, lamDB) {
    const regimeHTML = 2 * RE > (lamDB ?? Infinity)
      ? `<span style="color:#9a3412; font-weight:700;">2R<sub>E</sub> &gt; λ — SPD regime (particle desert)</span>`
      : `<span style="color:#166534; font-weight:700;">2R<sub>E</sub> &lt; λ — quantum regime (regular QM sufficient)</span>`;

    visReadout.innerHTML =
      readoutRow("Particle", visName) +
      readoutRow("Velocity", `${velPct < 0.001 ? "0" : velPct.toPrecision(6).replace(/\.?0+$/, "")}% of c`) +
      readoutRow("Lorentz factor γ", gamma < 1e6 ? gamma.toFixed(6) : gamma.toExponential(4)) +
      readoutRow("Relativistic energy E", formatSci(energy) + " J") +
      readoutRow("R<sub>E</sub>", formatSci(RE) + " m") +
      readoutRow("2R<sub>E</sub> (diameter)", formatSci(2 * RE) + " m") +
      (lamDB ? readoutRow("λ<sub>dB</sub>", formatSci(lamDB) + " m") : "") +
      `<div style="grid-column:1/-1; margin-top:4px;">${regimeHTML}</div>`;
  }

  /* ── redraw on resize ── */
  window.addEventListener("resize", () => {
    if (visMass !== null) renderFrame(parseFloat(visSlider.value));
  });

})();
