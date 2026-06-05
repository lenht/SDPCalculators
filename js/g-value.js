/* ─────────────────────────────────────────────
   g-value.js
   All logic for the G-value calculator page
   ───────────────────────────────────────────── */

let elements = [];

const GH = 6.613511;
const MP = 1.00727647;
const MN = 1.008665;

/* LOAD ELEMENT DATA */

fetch("g-values-elements.json")
  .then(response => response.json())
  .then(data => {
    elements = data.elements;
    populateAllDropdowns();
    initializeConstants();
    initMoleculeRows();
  })
  .catch(error => {
    console.error("Could not load element JSON:", error);
    const lookupResult = document.getElementById("lookup-result");
    if (lookupResult) {
      lookupResult.innerHTML =
        "Could not load element data. Make sure the JSON file is in the same folder as the HTML files.";
    }
  });

/* INITIAL SETUP */

function initializeConstants() {
  const gh = document.getElementById("gh");
  const mp = document.getElementById("mp");
  const mn = document.getElementById("mn");
  if (gh) gh.value = GH;
  if (mp) mp.value = MP;
  if (mn) mn.value = MN;
}

function populateAllDropdowns() {
  [
    "element-select",
    "manual-element-select",
    "mixed-element-1",
    "mixed-element-2"
  ].forEach(populateSelect);
}

function populateSelect(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Choose an element...";
  select.appendChild(placeholder);
  elements.forEach((element, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${element.name} (${element.symbol})`;
    select.appendChild(option);
  });
}

/* FORMAT ISOTOPE LIST */

function formatIsotopes(element) {
  if (!element.isotopes || element.isotopes.length === 0) {
    return `<div>No isotope abundance data available.</div>`;
  }
  return element.isotopes
    .map(iso => `
      <div>
        <strong>${iso.massNumber}${element.symbol}:</strong>
        ${iso.abundance}
      </div>
    `)
    .join("");
}

/* ELEMENT LOOKUP */

document.getElementById("element-select").addEventListener("change", event => {
  const element = elements[event.target.value];
  const lookupResult = document.getElementById("lookup-result");

  if (!element) {
    lookupResult.innerHTML = `<div class="lookup-placeholder">Select an element</div>`;
    return;
  }

  lookupResult.innerHTML = `
    <h4>${element.name} (${element.symbol})</h4>

    <div class="lookup-row">
      <span class="lookup-label">Atomic number:</span>
      <span class="lookup-value">${element.atomicNumber ?? "—"}</span>
    </div>

    <div class="lookup-row">
      <span class="lookup-label">Inertial mass:</span>
      <span class="lookup-value">${formatNumber(element.inertialMass)}</span>
    </div>

    <div class="lookup-row">
      <span class="lookup-label">Gravitational mass:</span>
      <span class="lookup-value">${formatNumber(element.gravitationalMass)}</span>
    </div>

    <div class="lookup-row">
      <span class="lookup-label">G-value:</span>
      <span class="lookup-value">${displayG(element.gValue)}</span>
    </div>

    <div class="lookup-isotopes-title">Isotope abundance</div>

    <div class="isotope-list">
      ${formatIsotopes(element)}
    </div>
  `;
});

/* ISOTOPE / MANUAL ELEMENT CALCULATOR */

document.getElementById("manual-element-select").addEventListener("change", event => {
  const element = elements[event.target.value];
  const protons  = document.getElementById("protons");
  const neutrons = document.getElementById("neutrons");
  const mass     = document.getElementById("mass");

  if (!element) {
    if (protons) protons.value = "";
    return;
  }

  if (protons)  protons.value = element.atomicNumber ?? "";
  if (neutrons) neutrons.value = "";
  if (mass) {
    mass.value = "";
    mass.placeholder =
      element.inertialMass !== null && element.inertialMass !== undefined
        ? `Natural average: ${formatNumber(element.inertialMass)}`
        : "Enter isotope inertial mass";
  }
});

document.getElementById("calculate-btn").addEventListener("click", () => {
  const protons  = parseFloat(document.getElementById("protons").value);
  const neutrons = parseFloat(document.getElementById("neutrons").value);
  const mass     = parseFloat(document.getElementById("mass").value);

  if (!Number.isFinite(protons) || !Number.isFinite(neutrons) || !Number.isFinite(mass) || mass <= 0) {
    document.getElementById("manual-result").innerHTML = "Please enter valid values.";
    return;
  }

  const gValue = GH * ((protons * MP + neutrons * MN) / mass);
  document.getElementById("manual-result").innerHTML = `G-value: ${displayG(gValue)}`;
});

/* MOLECULE CALCULATOR */

let moleculeRowCount = 0;

function addMoleculeRow(defaultCount = 1) {
  moleculeRowCount++;
  const rowIndex = moleculeRowCount;
  const container = document.getElementById("molecule-rows");
  const row = document.createElement("div");
  row.className = "molecule-row";
  row.dataset.row = rowIndex;

  row.innerHTML = `
    <div class="molecule-row-inner">
      <div class="molecule-row-fields">
        <div>
          <label>Element ${rowIndex}</label>
          <select class="molecule-element-select">
            <option value="">Choose an element...</option>
          </select>
        </div>
        <div>
          <label>Count</label>
          <input class="molecule-count-input" type="number" min="0" step="any" value="${defaultCount}" />
        </div>
      </div>
      <button class="remove-row-btn" title="Remove row">×</button>
    </div>
  `;

  const select = row.querySelector(".molecule-element-select");
  elements.forEach((element, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${element.name} (${element.symbol})`;
    select.appendChild(option);
  });

  row.querySelector(".remove-row-btn").addEventListener("click", () => {
    row.remove();
    renumberMoleculeRows();
  });

  container.appendChild(row);
}

function renumberMoleculeRows() {
  document.querySelectorAll(".molecule-row").forEach((row, i) => {
    row.querySelector("label").textContent = `Element ${i + 1}`;
  });
}

function initMoleculeRows() {
  addMoleculeRow(2);
  addMoleculeRow(1);
}

document.getElementById("molecule-add-btn").addEventListener("click", () => {
  addMoleculeRow(1);
});

document.getElementById("molecule-btn").addEventListener("click", () => {
  const rows = document.querySelectorAll(".molecule-row");
  let inertialMass = 0;
  let gravitationalMass = 0;
  let valid = true;

  if (rows.length === 0) {
    document.getElementById("molecule-result").innerHTML = "Please add at least one element.";
    return;
  }

  for (const row of rows) {
    const elementIndex = row.querySelector(".molecule-element-select").value;
    const count = parseFloat(row.querySelector(".molecule-count-input").value);
    const element = elements[elementIndex];

    if (!element || !Number.isFinite(count) || count < 0) {
      valid = false;
      break;
    }

    inertialMass     += count * element.inertialMass;
    gravitationalMass += count * element.gravitationalMass;
  }

  if (!valid || inertialMass <= 0) {
    document.getElementById("molecule-result").innerHTML = "Please enter valid molecule values.";
    return;
  }

  const gValue = GH * (gravitationalMass / inertialMass);
  document.getElementById("molecule-result").innerHTML = `
    <strong>Results</strong><br><br>
    Inertial mass: ${formatNumber(inertialMass)}<br>
    Gravitational mass: ${formatNumber(gravitationalMass)}<br>
    G-value: ${displayG(gValue)}
  `;
});

/* MIXED MATERIALS CALCULATOR */

document.getElementById("mixed-btn").addEventListener("click", () => {
  const e1 = elements[document.getElementById("mixed-element-1").value];
  const e2 = elements[document.getElementById("mixed-element-2").value];
  const p1 = parseFloat(document.getElementById("mixed-percent-1").value);
  const p2 = parseFloat(document.getElementById("mixed-percent-2").value);
  const type = document.getElementById("percentage-type").value;

  if (!e1 || !e2 || !Number.isFinite(p1) || !Number.isFinite(p2) || p1 < 0 || p2 < 0 || p1 + p2 <= 0) {
    document.getElementById("mixed-result").innerHTML = "Please enter valid mixed material values.";
    return;
  }

  let f1, f2;

  if (type === "atomic") {
    const total = p1 + p2;
    f1 = p1 / total;
    f2 = p2 / total;
  } else {
    const atomicAmount1 = p1 / e1.inertialMass;
    const atomicAmount2 = p2 / e2.inertialMass;
    const totalAtomicAmount = atomicAmount1 + atomicAmount2;
    f1 = atomicAmount1 / totalAtomicAmount;
    f2 = atomicAmount2 / totalAtomicAmount;
  }

  const inertialMass     = f1 * e1.inertialMass + f2 * e2.inertialMass;
  const gravitationalMass = f1 * e1.gravitationalMass + f2 * e2.gravitationalMass;
  const gValue = GH * (gravitationalMass / inertialMass);

  document.getElementById("mixed-result").innerHTML = `
    <strong>Results</strong><br><br>
    Atomic fraction of ${e1.symbol}: ${f1.toFixed(6)}<br>
    Atomic fraction of ${e2.symbol}: ${f2.toFixed(6)}<br>
    Inertial mass: ${formatNumber(inertialMass)}<br>
    Gravitational mass: ${formatNumber(gravitationalMass)}<br>
    G-value: ${displayG(gValue)}
  `;
});

/* EFFECTIVE G-VALUE CALCULATOR */

document.getElementById("effective-btn").addEventListener("click", () => {
  const sourceG = parseFloat(document.getElementById("source-g").value);
  const testG   = parseFloat(document.getElementById("test-g").value);

  if (!Number.isFinite(sourceG) || !Number.isFinite(testG) || sourceG <= 0 || testG <= 0) {
    document.getElementById("effective-result").innerHTML = "Please enter valid positive G-values.";
    return;
  }

  const effectiveG = Math.sqrt(sourceG * testG);
  document.getElementById("effective-result").innerHTML = `
    <strong>Results</strong><br><br>
    Effective G-value: ${displayG(effectiveG)}
  `;
});
