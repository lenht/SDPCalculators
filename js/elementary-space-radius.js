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
      <span class="lookup-label">Wavelength λ:</span>
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
      <span class="lookup-label">Wavelength λ (for comparison):</span>
      <span class="lookup-value" style="font-weight:700; color:#1e3a5f; font-size:15px;">${formatSci(wl_m)} m</span>
    </div>

    ${compHTML}
  `;
});

/* ── COMPARISON FLAG ────────────────────────── */

function comparisonFlag(RE, lambda) {
  if (lambda === null || !Number.isFinite(lambda)) return "";
  if (RE < lambda) {
    return `
      <div class="comparison-flag flag-below">
        R<sub>E</sub> &lt; λ — the elementary space radius is
        <strong>smaller</strong> than the wavelength.
        The particle wavelength exceeds the granular scale of space.
      </div>`;
  } else if (RE > lambda) {
    return `
      <div class="comparison-flag flag-above">
        R<sub>E</sub> &gt; λ — the elementary space radius is
        <strong>larger</strong> than the wavelength.
        This is the regime where SPD predicts significant
        space-curvature effects at the particle scale.
      </div>`;
  } else {
    return `
      <div class="comparison-flag flag-equal">
        R<sub>E</sub> = λ — critical point.
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
