/* ─────────────────────────────────────────────
   elementary-space-radius.js
   Logic for the Elementary Space Radius page
   ───────────────────────────────────────────── */

/*
  The main formula (SPD):

    R_E = (2 G_E E) / c^4

  where:
    G_E = k_e e² / m_p²  =  8.246441821 × 10²⁵ m³ s⁻² kg⁻¹
    E   = energy of the particle (J)
    c   = speed of light

  For a particle with rest mass m:
    E = m c²  (rest energy, used as default)

  The de Broglie / Compton wavelength shown alongside:

    Massless:   λ = h c / E
    Massive:    λ = h c / √(E² − m²c⁴)

  The critical point is where R_E = λ.
*/

/* ── PHYSICAL CONSTANTS ─────────────────────── */

const H_PLANCK = 6.62607015e-34;     // J·s  (Planck constant h)
const C        = 299792458;           // m/s
const C2       = C * C;
const C4       = C2 * C2;
const K_E      = 8.9875517923e9;      // N·m²/C²  (Coulomb constant)
const E_CHARGE = 1.602176634e-19;     // C
const M_PROTON = 1.67262192369e-27;   // kg

/* ── DERIVED ELEMENTARY SPACE CONSTANT ─────── */

const G_E = (K_E * E_CHARGE * E_CHARGE) / (M_PROTON * M_PROTON);
// = 8.246441821 × 10²⁵  m³ s⁻² kg⁻¹

/* ── PARTICLE TABLE ─────────────────────────── */

const PARTICLES = [
  { name: "Electron",        symbol: "e⁻",  mass: 9.1093837139e-31  },
  { name: "Muon",            symbol: "μ⁻",  mass: 1.883531627e-28   },
  { name: "Tau",             symbol: "τ⁻",  mass: 3.1675e-27        },
  { name: "Electron neutrino", symbol: "νₑ", mass: 6.3e-37          },
  { name: "Muon neutrino",   symbol: "ν_μ", mass: 9.0785e-37        },
  { name: "Tau neutrino",    symbol: "ν_τ", mass: 3.41e-36          },
  { name: "Up quark",        symbol: "u",   mass: 3.9218564e-30     },
  { name: "Down quark",      symbol: "d",   mass: 8.3785114e-30     },
  { name: "Strange quark",   symbol: "s",   mass: 1.6935289e-28     },
  { name: "Charm quark",     symbol: "c",   mass: 2.26398074e-27    },
  { name: "Bottom quark",    symbol: "b",   mass: 7.45152716e-27    },
  { name: "Top quark",       symbol: "t",   mass: 3.0797268712e-25  },
  { name: "W boson",         symbol: "W±",  mass: 1.432711188104e-25 },
  { name: "Z boson",         symbol: "Z⁰",  mass: 1.62557382456e-25  },
  { name: "Higgs boson",     symbol: "H⁰",  mass: 2.2302884282e-25  },
  { name: "Gluon",           symbol: "g",   mass: null              },
  { name: "Photon",          symbol: "γ",   mass: null              },
];

/* ── HELPERS ────────────────────────────────── */

function setValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function calcRE(energy_J) {
  return (2 * G_E * energy_J) / C4;
}

function calcLambdaMassless(energy_J) {
  return (H_PLANCK * C) / energy_J;
}

function calcLambdaMassive(energy_J, mass_kg) {
  // λ = hc / √(E² − m²c⁴)
  const mc2 = mass_kg * C2;
  const discriminant = energy_J * energy_J - mc2 * mc2;
  if (discriminant <= 0) return null; // below rest energy
  return (H_PLANCK * C) / Math.sqrt(discriminant);
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

/* ── PARTICLE PRESET HANDLER ────────────────── */

document.getElementById("particle-select").addEventListener("change", event => {
  const p = PARTICLES[event.target.value];
  if (!p) return;

  const massField  = document.getElementById("input-mass");
  const massNote   = document.getElementById("mass-note");
  const energyField = document.getElementById("input-energy");

  if (p.mass !== null) {
    massField.value = p.mass;
    massField.disabled = false;
    massNote.textContent = "";
    // default energy = rest energy
    const restEnergy = p.mass * C2;
    energyField.value = restEnergy.toExponential(6);
    energyField.placeholder = `Rest energy: ${restEnergy.toExponential(4)} J`;
  } else {
    massField.value = "";
    massField.disabled = true;
    massNote.textContent = `${p.name} is massless — enter energy directly.`;
    energyField.value = "";
    energyField.placeholder = "Enter energy in joules";
  }

  document.getElementById("esr-result").innerHTML = "—";
});

/* ── CALCULATE BUTTON ───────────────────────── */

document.getElementById("esr-calc-btn").addEventListener("click", () => {
  const result = document.getElementById("esr-result");

  const energyRaw = document.getElementById("input-energy").value.trim();
  const massRaw   = document.getElementById("input-mass").value.trim();

  const energy_J = parseFloat(energyRaw);
  const mass_kg  = parseFloat(massRaw);

  if (!Number.isFinite(energy_J) || energy_J <= 0) {
    result.innerHTML = "Please enter a valid positive energy value (in joules).";
    return;
  }

  // Elementary space radius
  const RE = calcRE(energy_J);

  // Wavelength
  let lambda = null;
  let lambdaLabel = "";

  const hasMass = Number.isFinite(mass_kg) && mass_kg > 0;

  if (hasMass) {
    const mc2 = mass_kg * C2;
    if (energy_J <= mc2) {
      result.innerHTML = `
        <strong>Note:</strong> The entered energy (${formatSci(energy_J)} J) is less than or equal
        to the rest energy m·c² = ${formatSci(mc2)} J.<br><br>
        The de Broglie wavelength formula requires E &gt; mc². 
        Try increasing the energy above the rest energy.
      `;
      return;
    }
    lambda = calcLambdaMassive(energy_J, mass_kg);
    lambdaLabel = "de Broglie wavelength λ = hc / √(E² − m²c⁴)";
  } else {
    lambda = calcLambdaMassless(energy_J);
    lambdaLabel = "Wavelength λ = hc / E  (massless)";
  }

  // Comparison
  let comparisonHTML = "";
  if (lambda !== null) {
    if (RE < lambda) {
      comparisonHTML = `
        <div class="comparison-flag flag-below">
          R<sub>E</sub> &lt; λ — the elementary space radius is
          <strong>smaller</strong> than the wavelength.
          The particle wavelength exceeds the granular scale of space.
        </div>
      `;
    } else if (RE > lambda) {
      comparisonHTML = `
        <div class="comparison-flag flag-above">
          R<sub>E</sub> &gt; λ — the elementary space radius is
          <strong>larger</strong> than the wavelength.
          This is the regime where SPD predicts significant
          space-curvature effects at the particle scale.
        </div>
      `;
    } else {
      comparisonHTML = `
        <div class="comparison-flag flag-equal">
          R<sub>E</sub> = λ — critical point.
        </div>
      `;
    }
  }

  result.innerHTML = `
    <strong>Results</strong><br><br>

    <div class="lookup-row">
      <span class="lookup-label">Energy E:</span>
      <span class="lookup-value">${formatSci(energy_J)} J</span>
    </div>

    ${hasMass ? `
    <div class="lookup-row">
      <span class="lookup-label">Rest energy mc²:</span>
      <span class="lookup-value">${formatSci(mass_kg * C2)} J</span>
    </div>` : ""}

    <div class="lookup-row" style="margin-top:10px; padding-top:10px; border-top:1px solid #dbe7f5;">
      <span class="lookup-label"><strong>Elementary space radius R<sub>E</sub>:</strong></span>
      <span class="lookup-value" style="font-weight:700; color:#1e3a5f; font-size:15px;">${formatSci(RE)} m</span>
    </div>

    ${lambda !== null ? `
    <div class="lookup-row">
      <span class="lookup-label">${lambdaLabel}:</span>
      <span class="lookup-value" style="font-weight:700; color:#1e3a5f; font-size:15px;">${formatSci(lambda)} m</span>
    </div>
    ` : ""}

    ${comparisonHTML}
  `;
});

/* ── RESET BUTTON ───────────────────────────── */

document.getElementById("esr-reset-btn").addEventListener("click", () => {
  document.getElementById("particle-select").value = "";
  document.getElementById("input-mass").value = "";
  document.getElementById("input-mass").disabled = false;
  document.getElementById("input-energy").value = "";
  document.getElementById("input-energy").placeholder = "Enter energy in joules";
  document.getElementById("mass-note").textContent = "";
  document.getElementById("esr-result").innerHTML = "—";
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

/* ── BOOT ──────────────────────────────────── */

populateParticleSelect();
showConstants();
