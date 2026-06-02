const GH = 6.613511e-11;
const mp = 1.00727647;
const mn = 1.008665;

const elements = [

  { name: "Hydrogen", symbol: "H", protons: 1, neutrons: 0, inertialMass: 1.008 },
  { name: "Helium", symbol: "He", protons: 2, neutrons: 2, inertialMass: 4.0026 },
  { name: "Lithium", symbol: "Li", protons: 3, neutrons: 4, inertialMass: 6.94 },
  { name: "Beryllium", symbol: "Be", protons: 4, neutrons: 5, inertialMass: 9.0122 },
  { name: "Boron", symbol: "B", protons: 5, neutrons: 6, inertialMass: 10.81 },
  { name: "Carbon", symbol: "C", protons: 6, neutrons: 6, inertialMass: 12.011 },
  { name: "Nitrogen", symbol: "N", protons: 7, neutrons: 7, inertialMass: 14.007 },
  { name: "Oxygen", symbol: "O", protons: 8, neutrons: 8, inertialMass: 15.999 },
  { name: "Fluorine", symbol: "F", protons: 9, neutrons: 10, inertialMass: 18.998 },
  { name: "Neon", symbol: "Ne", protons: 10, neutrons: 10, inertialMass: 20.180 },

  { name: "Sodium", symbol: "Na", protons: 11, neutrons: 12, inertialMass: 22.990 },
  { name: "Magnesium", symbol: "Mg", protons: 12, neutrons: 12, inertialMass: 24.305 },
  { name: "Aluminum", symbol: "Al", protons: 13, neutrons: 14, inertialMass: 26.982 },
  { name: "Silicon", symbol: "Si", protons: 14, neutrons: 14, inertialMass: 28.085 },
  { name: "Phosphorus", symbol: "P", protons: 15, neutrons: 16, inertialMass: 30.974 },
  { name: "Sulfur", symbol: "S", protons: 16, neutrons: 16, inertialMass: 32.06 },
  { name: "Chlorine", symbol: "Cl", protons: 17, neutrons: 18, inertialMass: 35.45 },
  { name: "Argon", symbol: "Ar", protons: 18, neutrons: 22, inertialMass: 39.948 },
  { name: "Potassium", symbol: "K", protons: 19, neutrons: 20, inertialMass: 39.098 },
  { name: "Calcium", symbol: "Ca", protons: 20, neutrons: 20, inertialMass: 40.078 },

  { name: "Scandium", symbol: "Sc", protons: 21, neutrons: 24, inertialMass: 44.956 },
  { name: "Titanium", symbol: "Ti", protons: 22, neutrons: 26, inertialMass: 47.867 },
  { name: "Vanadium", symbol: "V", protons: 23, neutrons: 28, inertialMass: 50.942 },
  { name: "Chromium", symbol: "Cr", protons: 24, neutrons: 28, inertialMass: 51.996 },
  { name: "Manganese", symbol: "Mn", protons: 25, neutrons: 30, inertialMass: 54.938 },
  { name: "Iron", symbol: "Fe", protons: 26, neutrons: 30, inertialMass: 55.845 },
  { name: "Cobalt", symbol: "Co", protons: 27, neutrons: 32, inertialMass: 58.933 },
  { name: "Nickel", symbol: "Ni", protons: 28, neutrons: 31, inertialMass: 58.693 },
  { name: "Copper", symbol: "Cu", protons: 29, neutrons: 35, inertialMass: 63.546 },
  { name: "Zinc", symbol: "Zn", protons: 30, neutrons: 35, inertialMass: 65.38 },

  { name: "Gallium", symbol: "Ga", protons: 31, neutrons: 39, inertialMass: 69.723 },
  { name: "Germanium", symbol: "Ge", protons: 32, neutrons: 41, inertialMass: 72.630 },
  { name: "Arsenic", symbol: "As", protons: 33, neutrons: 42, inertialMass: 74.922 },
  { name: "Selenium", symbol: "Se", protons: 34, neutrons: 45, inertialMass: 78.971 },
  { name: "Bromine", symbol: "Br", protons: 35, neutrons: 45, inertialMass: 79.904 },
  { name: "Krypton", symbol: "Kr", protons: 36, neutrons: 48, inertialMass: 83.798 },
  { name: "Rubidium", symbol: "Rb", protons: 37, neutrons: 48, inertialMass: 85.468 },
  { name: "Strontium", symbol: "Sr", protons: 38, neutrons: 50, inertialMass: 87.62 },
  { name: "Yttrium", symbol: "Y", protons: 39, neutrons: 50, inertialMass: 88.906 },
  { name: "Zirconium", symbol: "Zr", protons: 40, neutrons: 51, inertialMass: 91.224 },

  { name: "Niobium", symbol: "Nb", protons: 41, neutrons: 52, inertialMass: 92.906 },
  { name: "Molybdenum", symbol: "Mo", protons: 42, neutrons: 54, inertialMass: 95.95 },
  { name: "Technetium", symbol: "Tc", protons: 43, neutrons: 55, inertialMass: 98 },
  { name: "Ruthenium", symbol: "Ru", protons: 44, neutrons: 57, inertialMass: 101.07 },
  { name: "Rhodium", symbol: "Rh", protons: 45, neutrons: 58, inertialMass: 102.91 },
  { name: "Palladium", symbol: "Pd", protons: 46, neutrons: 60, inertialMass: 106.42 },
  { name: "Silver", symbol: "Ag", protons: 47, neutrons: 61, inertialMass: 107.87 },
  { name: "Cadmium", symbol: "Cd", protons: 48, neutrons: 64, inertialMass: 112.41 },
  { name: "Indium", symbol: "In", protons: 49, neutrons: 66, inertialMass: 114.82 },
  { name: "Tin", symbol: "Sn", protons: 50, neutrons: 69, inertialMass: 118.71 },

  { name: "Antimony", symbol: "Sb", protons: 51, neutrons: 71, inertialMass: 121.76 },
  { name: "Tellurium", symbol: "Te", protons: 52, neutrons: 76, inertialMass: 127.60 },
  { name: "Iodine", symbol: "I", protons: 53, neutrons: 74, inertialMass: 126.90 },
  { name: "Xenon", symbol: "Xe", protons: 54, neutrons: 77, inertialMass: 131.29 },
  { name: "Cesium", symbol: "Cs", protons: 55, neutrons: 78, inertialMass: 132.91 },
  { name: "Barium", symbol: "Ba", protons: 56, neutrons: 81, inertialMass: 137.33 },
  { name: "Lanthanum", symbol: "La", protons: 57, neutrons: 82, inertialMass: 138.91 },
  { name: "Cerium", symbol: "Ce", protons: 58, neutrons: 82, inertialMass: 140.12 },
  { name: "Praseodymium", symbol: "Pr", protons: 59, neutrons: 82, inertialMass: 140.91 },
  { name: "Neodymium", symbol: "Nd", protons: 60, neutrons: 84, inertialMass: 144.24 },

  { name: "Promethium", symbol: "Pm", protons: 61, neutrons: 84, inertialMass: 145 },
  { name: "Samarium", symbol: "Sm", protons: 62, neutrons: 88, inertialMass: 150.36 },
  { name: "Europium", symbol: "Eu", protons: 63, neutrons: 89, inertialMass: 151.96 },
  { name: "Gadolinium", symbol: "Gd", protons: 64, neutrons: 93, inertialMass: 157.25 },
  { name: "Terbium", symbol: "Tb", protons: 65, neutrons: 94, inertialMass: 158.93 },
  { name: "Dysprosium", symbol: "Dy", protons: 66, neutrons: 97, inertialMass: 162.50 },
  { name: "Holmium", symbol: "Ho", protons: 67, neutrons: 98, inertialMass: 164.93 },
  { name: "Erbium", symbol: "Er", protons: 68, neutrons: 99, inertialMass: 167.26 },
  { name: "Thulium", symbol: "Tm", protons: 69, neutrons: 100, inertialMass: 168.93 },
  { name: "Ytterbium", symbol: "Yb", protons: 70, neutrons: 103, inertialMass: 173.05 },

  { name: "Lutetium", symbol: "Lu", protons: 71, neutrons: 104, inertialMass: 174.97 },
  { name: "Hafnium", symbol: "Hf", protons: 72, neutrons: 106, inertialMass: 178.49 },
  { name: "Tantalum", symbol: "Ta", protons: 73, neutrons: 108, inertialMass: 180.95 },
  { name: "Tungsten", symbol: "W", protons: 74, neutrons: 110, inertialMass: 183.84 },
  { name: "Rhenium", symbol: "Re", protons: 75, neutrons: 111, inertialMass: 186.21 },
  { name: "Osmium", symbol: "Os", protons: 76, neutrons: 114, inertialMass: 190.23 },
  { name: "Iridium", symbol: "Ir", protons: 77, neutrons: 115, inertialMass: 192.22 },
  { name: "Platinum", symbol: "Pt", protons: 78, neutrons: 117, inertialMass: 195.08 },
  { name: "Gold", symbol: "Au", protons: 79, neutrons: 118, inertialMass: 196.97 },
  { name: "Mercury", symbol: "Hg", protons: 80, neutrons: 121, inertialMass: 200.59 },

  { name: "Thallium", symbol: "Tl", protons: 81, neutrons: 123, inertialMass: 204.38 },
  { name: "Lead", symbol: "Pb", protons: 82, neutrons: 125, inertialMass: 207.2 },
  { name: "Bismuth", symbol: "Bi", protons: 83, neutrons: 126, inertialMass: 208.98 },
  { name: "Polonium", symbol: "Po", protons: 84, neutrons: 125, inertialMass: 209 },
  { name: "Astatine", symbol: "At", protons: 85, neutrons: 125, inertialMass: 210 },
  { name: "Radon", symbol: "Rn", protons: 86, neutrons: 136, inertialMass: 222 },
  { name: "Francium", symbol: "Fr", protons: 87, neutrons: 136, inertialMass: 223 },
  { name: "Radium", symbol: "Ra", protons: 88, neutrons: 138, inertialMass: 226 },
  { name: "Actinium", symbol: "Ac", protons: 89, neutrons: 138, inertialMass: 227 },
  { name: "Thorium", symbol: "Th", protons: 90, neutrons: 142, inertialMass: 232.04 },

  { name: "Protactinium", symbol: "Pa", protons: 91, neutrons: 140, inertialMass: 231.04 },
  { name: "Uranium", symbol: "U", protons: 92, neutrons: 146, inertialMass: 238.03 },
  { name: "Neptunium", symbol: "Np", protons: 93, neutrons: 144, inertialMass: 237 },
  { name: "Plutonium", symbol: "Pu", protons: 94, neutrons: 150, inertialMass: 244 },
  { name: "Americium", symbol: "Am", protons: 95, neutrons: 148, inertialMass: 243 },
  { name: "Curium", symbol: "Cm", protons: 96, neutrons: 151, inertialMass: 247 },
  { name: "Berkelium", symbol: "Bk", protons: 97, neutrons: 150, inertialMass: 247 },
  { name: "Californium", symbol: "Cf", protons: 98, neutrons: 153, inertialMass: 251 },
  { name: "Einsteinium", symbol: "Es", protons: 99, neutrons: 153, inertialMass: 252 },
  { name: "Fermium", symbol: "Fm", protons: 100, neutrons: 157, inertialMass: 257 }

];

document.querySelectorAll(".category-button").forEach(button => {
  button.addEventListener("click", () => {
    button.parentElement.classList.toggle("open");
  });
});

function gravitationalMass(element) {
  if (element.gravitationalMass) return element.gravitationalMass;
  return element.protons * mp + element.neutrons * mn;
}

function rawG(element) {
  return GH * (gravitationalMass(element) / element.inertialMass);
}

function displayG(value) {
  return (value / 1e-11).toFixed(6);
}

function populateSelect(id) {
  const select = document.getElementById(id);
  elements.forEach((element, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${element.name} (${element.symbol})`;
    select.appendChild(option);
  });
}

[
  "element-select",
  "molecule-element-1",
  "molecule-element-2",
  "mixed-element-1",
  "mixed-element-2"
].forEach(populateSelect);

document.getElementById("gh").value = displayG(GH);
document.getElementById("mp").value = mp;
document.getElementById("mn").value = mn;

document.getElementById("element-select").addEventListener("change", event => {
  const element = elements[event.target.value];
  if (!element) return;

  const g = rawG(element);

  document.getElementById("lookup-result").innerHTML = `
    <strong>${element.name} (${element.symbol})</strong><br>
    Protons: ${element.protons}<br>
    Neutrons: ${element.neutrons}<br>
    Inertial mass: ${element.inertialMass}<br>
    Gravitational mass: ${gravitationalMass(element)}<br>
    G-value: ${displayG(g)}
  `;

  document.getElementById("protons").value = element.protons;
  document.getElementById("neutrons").value = element.neutrons;
  document.getElementById("mass").value = element.inertialMass;
});

document.getElementById("calculate-btn").addEventListener("click", () => {
  const protons = parseFloat(document.getElementById("protons").value);
  const neutrons = parseFloat(document.getElementById("neutrons").value);
  const mass = parseFloat(document.getElementById("mass").value);

  const g = GH * ((protons * mp + neutrons * mn) / mass);

  document.getElementById("manual-result").innerHTML =
    `G-value: ${displayG(g)}`;
});

document.getElementById("molecule-btn").addEventListener("click", () => {
  const e1 = elements[document.getElementById("molecule-element-1").value];
  const e2 = elements[document.getElementById("molecule-element-2").value];

  const c1 = parseFloat(document.getElementById("molecule-count-1").value);
  const c2 = parseFloat(document.getElementById("molecule-count-2").value);

  const inertial =
    c1 * e1.inertialMass +
    c2 * e2.inertialMass;

  const gravitational =
    c1 * gravitationalMass(e1) +
    c2 * gravitationalMass(e2);

  const g = GH * (gravitational / inertial);

  document.getElementById("molecule-result").innerHTML = `
    Inertial mass: ${inertial}<br>
    Gravitational mass: ${gravitational}<br>
    G-value: ${displayG(g)}
  `;
});

document.getElementById("mixed-btn").addEventListener("click", () => {
  const e1 = elements[document.getElementById("mixed-element-1").value];
  const e2 = elements[document.getElementById("mixed-element-2").value];

  const p1 = parseFloat(document.getElementById("mixed-percent-1").value);
  const p2 = parseFloat(document.getElementById("mixed-percent-2").value);

  const type = document.getElementById("percentage-type").value;

  let f1;
  let f2;

  if (type === "atomic") {
    const total = p1 + p2;
    f1 = p1 / total;
    f2 = p2 / total;
  } else {
    const a1 = p1 / e1.inertialMass;
    const a2 = p2 / e2.inertialMass;
    const total = a1 + a2;
    f1 = a1 / total;
    f2 = a2 / total;
  }

  const inertial =
    f1 * e1.inertialMass +
    f2 * e2.inertialMass;

  const gravitational =
    f1 * gravitationalMass(e1) +
    f2 * gravitationalMass(e2);

  const g = GH * (gravitational / inertial);

  document.getElementById("mixed-result").innerHTML = `
    Atomic fraction of ${e1.symbol}: ${f1.toFixed(6)}<br>
    Atomic fraction of ${e2.symbol}: ${f2.toFixed(6)}<br>
    Inertial mass: ${inertial}<br>
    Gravitational mass: ${gravitational}<br>
    G-value: ${displayG(g)}
  `;
});

document.getElementById("effective-btn").addEventListener("click", () => {
  const sourceG = parseFloat(document.getElementById("source-g").value);
  const testG = parseFloat(document.getElementById("test-g").value);

  if (
    !Number.isFinite(sourceG) ||
    !Number.isFinite(testG) ||
    sourceG <= 0 ||
    testG <= 0
  ) {
    document.getElementById("effective-result").innerHTML =
      "Please enter valid positive G-values.";
    return;
  }

  const effectiveG = Math.sqrt(sourceG * testG);

  document.getElementById("effective-result").innerHTML =
    `Effective G-value: ${effectiveG.toFixed(6)}`;
});