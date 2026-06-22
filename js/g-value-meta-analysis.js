/* ─────────────────────────────────────────────
   g-value-meta-analysis.js
   All logic for the G-value meta-analysis page:
   data, Kendall tau-b, live chart, filter/toggle UI
   ───────────────────────────────────────────── */

/* ══════════════════════════════════════════════
   DATA
   Each entry:
     id       – unique integer
     label    – researcher(s) + year, shown on card
     pair     – "SourceMass–TestMass" material label
     pr       – SPD-predicted G-value
     ob       – measured (observed) G-value
     sd       – standard deviation of measurement
     year     – year of publication
     type     – "cavendish" | "freefall" | "atom_interf" | "gravimeter"
     scale    – "lab" | "large"
   ══════════════════════════════════════════════ */

const META_DATA = [
  { id:  1, label: "Saulnier (1989)",                                   pair: "U–Pb",            pr: 6.6668214, ob: 6.6500,   sd: 0.0900,   year: 1989, type: "cavendish",   scale: "lab"   },
  { id:  2, label: "Pontikis (1971)",                                   pair: "Pb–Pb",           pr: 6.6678780, ob: 6.6680,   sd: 0.0030,   year: 1971, type: "cavendish",   scale: "lab"   },
  { id:  3, label: "Hubler (1995)",                                     pair: "H₂O–Steel",       pr: 6.6679615, ob: 6.6690,   sd: 0.0050,   year: 1995, type: "cavendish",   scale: "large" },
  { id:  4, label: "Pontikis (1971)",                                   pair: "Hg–Hg",           pr: 6.6680900, ob: 6.6660,   sd: 0.0100,   year: 1971, type: "cavendish",   scale: "lab"   },
  { id:  5, label: "De Boer (1987) & Lamporesi (2008)",                pair: "W–W",             pr: 6.6688150, ob: 6.6670,   sd: 0.0030,   year: 1987, type: "cavendish",   scale: "lab"   },
  { id:  6, label: "Wang (2009)",                                       pair: "Pb–SiO₂",         pr: 6.6688655, ob: 6.6665,   sd: 0.0554,   year: 2009, type: "freefall",    scale: "lab"   },
  { id:  7, label: "Luther (1975)",                                     pair: "W–Al",            pr: 6.6698455, ob: 6.6699,   sd: 0.0140,   year: 1975, type: "cavendish",   scale: "lab"   },
  { id:  8, label: "Dousse (1987)",                                     pair: "Pb–Cu",           pr: 6.6709365, ob: 6.6704,   sd: 0.0048,   year: 1987, type: "cavendish",   scale: "lab"   },
  { id:  9, label: "Renner (1973)",                                     pair: "Hg–Cu",           pr: 6.6710425, ob: 6.6700,   sd: 0.0080,   year: 1973, type: "cavendish",   scale: "lab"   },
  { id: 10, label: "Heyl (1925)",                                       pair: "Tool steel–Au",   pr: 6.6711520, ob: 6.6720,   sd: 0.0040,   year: 1925, type: "cavendish",   scale: "lab"   },
  { id: 11, label: "Heyl (1942)",                                       pair: "Tool steel–Pt",   pr: 6.6712015, ob: 6.6720,   sd: 0.0040,   year: 1942, type: "cavendish",   scale: "lab"   },
  { id: 12, label: "Prevedelli (2014)",                                 pair: "W–Rb",            pr: 6.6712585, ob: 6.6719,   sd: 0.0010,   year: 2014, type: "atom_interf", scale: "lab"   },
  { id: 13, label: "Parks (2010)",                                      pair: "W–Cu",            pr: 6.6714050, ob: 6.6723,   sd: 0.0003,   year: 2010, type: "cavendish",   scale: "lab"   },
  { id: 14, label: "Luther & Towler (1982)",                            pair: "W–Fe&Al&W",       pr: 6.6715070, ob: 6.6726,   sd: 0.0005,   year: 1982, type: "cavendish",   scale: "lab"   },
  { id: 15, label: "Schlamminger (2026)",                               pair: "Al₂O₃–Cu",        pr: 6.6718600, ob: 6.6726,   sd: 0.0004,   year: 2026, type: "cavendish",   scale: "lab"   },
  { id: 16, label: "Walesch (1995)",                                    pair: "Brass–SiO₂",      pr: 6.6719127, ob: 6.6719,   sd: 0.0008,   year: 1995, type: "cavendish",   scale: "lab"   },
  { id: 17, label: "Heyl (1928)",                                       pair: "Tool steel–SiO₂", pr: 6.6719857, ob: 6.6710,   sd: 0.0030,   year: 1928, type: "cavendish",   scale: "lab"   },
  { id: 18, label: "Goldblum (1987)",                                   pair: "Dy₆Fe₂₃–Dy₆Fe₂₃",pr: 6.6723720, ob: 6.6700,   sd: 0.0700,   year: 1987, type: "freefall",    scale: "lab"   },
  { id: 19, label: "Pontikis (1971)",                                   pair: "Ag–Ag",           pr: 6.6726150, ob: 6.6710,   sd: 0.0010,   year: 1971, type: "cavendish",   scale: "lab"   },
  { id: 20, label: "Pontikis (1971)",                                   pair: "Ag–Brass",        pr: 6.6732940, ob: 6.6710,   sd: 0.0020,   year: 1971, type: "cavendish",   scale: "lab"   },
  { id: 21, label: "HUST-09 (2010)",                                    pair: "Steel–Cu&SiO₂",   pr: 6.6734175, ob: 6.6735,   sd: 0.0002,   year: 2010, type: "cavendish",   scale: "lab"   },
  { id: 22, label: "Baldi (2005)",                                      pair: "Steel–Nb",        pr: 6.6738030, ob: 6.6750,   sd: 0.0070,   year: 2005, type: "gravimeter",  scale: "lab"   },
  { id: 23, label: "Pontikis (1971)",                                   pair: "Brass–Brass",     pr: 6.6739730, ob: 6.6740,   sd: 0.0020,   year: 1971, type: "cavendish",   scale: "lab"   },
  { id: 24, label: "Kleinevoß (2002)",                                  pair: "Brass–Cu",        pr: 6.6739840, ob: 6.6742,   sd: 0.0010,   year: 2002, type: "cavendish",   scale: "lab"   },
  { id: 25, label: "Pontikis (1971) & Armstrong (2003)",               pair: "Cu–Cu",           pr: 6.6739950, ob: 6.6740,   sd: 0.0001,   year: 2003, type: "cavendish",   scale: "lab"   },
  { id: 26, label: "Fitzgerald (1999), Armstrong (2003), Newman (2014)",pair: "Steel–Cu",        pr: 6.6740975, ob: 6.6741,   sd: 0.0001,   year: 2014, type: "cavendish",   scale: "lab"   },
  { id: 27, label: "Gundlach (2000)",                                   pair: "Steel–Steel",     pr: 6.6742000, ob: 6.6742,   sd: 0.0001,   year: 2000, type: "cavendish",   scale: "lab"   },
];

const TYPE_LABELS = {
  cavendish:   "Standard Cavendish",
  freefall:    "Freefall / interferometer",
  atom_interf: "Atom interferometry",
  gravimeter:  "Gravimeter",
};

const CATEGORIES = [
  {
    key: "precise",
    title: "Modern precision (post-1969, SD < 0.01, lab-scale)",
    color: "#1a8c5c",
    fn: m => m.year >= 1969 && m.sd < 0.01 && m.scale === "lab" && m.type === "cavendish",
  },
  {
    key: "nonstandard",
    title: "Non-standard methods (atom interferometry, freefall, gravimeter)",
    color: "#4c6f95",
    fn: m => m.type === "atom_interf" || m.type === "freefall" || m.type === "gravimeter",
  },
  {
    key: "large",
    title: "Large-scale / long-range",
    color: "#c87a40",
    fn: m => m.scale === "large",
  },
  {
    key: "bigsd",
    title: "Large standard deviation (SD ≥ 0.01, post-1969, lab-scale)",
    color: "#b84040",
    fn: m => m.sd >= 0.01 && m.year >= 1969 && m.scale !== "large" && m.type === "cavendish",
  },
  {
    key: "historic",
    title: "Historic (pre-1969)",
    color: "#8a8a8a",
    fn: m => m.year < 1969,
  },
];

const FILTERS = [
  { key: "bigsd",    label: "SD ≥ 0.01",                    fn: m => m.sd >= 0.01 },
  { key: "range",    label: "Outside 6.661 – 6.6745",       fn: m => m.ob < 6.661 || m.ob > 6.6745 },
  { key: "large",    label: "Large-scale experiments",       fn: m => m.scale === "large" },
  { key: "pre1969",  label: "Pre-1969",                      fn: m => m.year < 1969 },
  { key: "freefall", label: "Freefall / interferometer",     fn: m => m.type === "freefall" },
  { key: "gravi",    label: "Gravimeter",                    fn: m => m.type === "gravimeter" },
];

/* ══════════════════════════════════════════════
   STATE
   ══════════════════════════════════════════════ */

let activeIds    = new Set(META_DATA.map(m => m.id));
let activeFilters = new Set();
let openDetails   = new Set();

function isFilteredOut(m) {
  return [...activeFilters].some(k => FILTERS.find(f => f.key === k).fn(m));
}

function getActiveData() {
  return META_DATA.filter(m => activeIds.has(m.id) && !isFilteredOut(m));
}

/* ══════════════════════════════════════════════
   KENDALL TAU-B
   ══════════════════════════════════════════════ */

function kendallTauB(data) {
  const n = data.length;
  if (n < 2) return { tau: null, z: null, p: null, n, C: 0, D: 0, T1: 0, T2: 0 };

  let C = 0, D = 0, T1 = 0, T2 = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dP  = data[i].pr - data[j].pr;
      const dO  = data[i].ob - data[j].ob;
      const prod = dP * dO;
      if (Math.abs(prod) < 1e-15) {
        if (Math.abs(dP) < 1e-12) T1++;
        if (Math.abs(dO) < 1e-12) T2++;
      } else if (prod > 0) {
        C++;
      } else {
        D++;
      }
    }
  }

  const pairs = n * (n - 1) / 2;
  const denom = Math.sqrt((pairs - T1) * (pairs - T2));
  if (denom === 0) return { tau: 0, z: 0, p: 0.5, n, C, D, T1, T2 };

  const tau = (C - D) / denom;

  // Variance of tau-b: 2(2n+5) / 9n(n-1)
  const varTau = (2 * (2 * n + 5)) / (9 * n * (n - 1));
  const z = tau / Math.sqrt(varTau);
  const p = 1 - normalCDF(z);

  return { tau, z, p, n, C, D, T1, T2 };
}

// Abramowitz & Stegun approximation — accurate to 7.5 × 10⁻⁸
function normalCDF(z) {
  const t    = 1 / (1 + 0.2316419 * Math.abs(z));
  const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const pdf  = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  const q    = 1 - pdf * poly;
  return z >= 0 ? q : 1 - q;
}

/* ══════════════════════════════════════════════
   FORMATTING
   ══════════════════════════════════════════════ */

function toSuperscript(n) {
  const map = { "0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹","-":"⁻" };
  return String(n).split("").map(c => map[c] || c).join("");
}

function formatP(p) {
  if (p === null || isNaN(p)) return "—";
  if (p < 1e-10) return "< 10⁻¹⁰";
  if (p < 0.001) {
    const exp = Math.floor(Math.log10(p));
    const man = (p / Math.pow(10, exp)).toFixed(2);
    return `${man} × 10${toSuperscript(exp)}`;
  }
  return p.toFixed(6);
}

function formatOdds(p) {
  if (!p || p <= 0 || isNaN(p)) return "—";
  if (p >= 0.5) return "< 2 : 1";
  return "1 in " + Math.round(1 / p).toLocaleString("en-US");
}

/* ══════════════════════════════════════════════
   STATS DISPLAY
   ══════════════════════════════════════════════ */

function updateStats() {
  const data = getActiveData();
  const s    = kendallTauB(data);

  document.getElementById("s-n").textContent    = s.n;
  document.getElementById("s-tau").textContent  = s.tau  !== null ? s.tau.toFixed(5) : "—";
  document.getElementById("s-z").textContent    = s.z    !== null ? s.z.toFixed(4)   : "—";
  document.getElementById("s-p").textContent    = formatP(s.p);
  document.getElementById("s-odds").textContent = formatOdds(s.p);
  document.getElementById("s-cd").textContent   = (s.C !== undefined) ? `${s.C} – ${s.D}` : "—";

  drawChart(data);
}

/* ══════════════════════════════════════════════
   CHART
   ══════════════════════════════════════════════ */

function drawChart(data) {
  const canvas = document.getElementById("meta-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // ── Chart always renders on a fixed dark background (#1a2535)
  // so ink colors are always the light-on-dark variants.
  const C_TICK_TEXT = "#9ab8d0";
  const C_GRID      = "rgba(160,190,220,0.14)";
  const C_AXIS      = "#4a6a88";
  const C_LABEL     = "#9ab8d0";

  // ── Canvas sizing — always use actual CSS pixel size × dpr for crispness
  const dpr = Math.round(window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  const W    = Math.round(rect.width);
  const H    = Math.round(rect.height);
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  if (data.length === 0) {
    ctx.fillStyle    = C_TICK_TEXT;
    ctx.font         = "13px Arial";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("No measurements selected", W / 2, H / 2);
    return;
  }

  const sorted = [...data].sort((a, b) => a.pr - b.pr);
  const vals   = sorted.flatMap(d => [d.pr, d.ob]);
  const minV   = Math.min(...vals) - 0.0008;
  const maxV   = Math.max(...vals) + 0.0008;

  const PL = 62, PR = 16, PT = 18, PB = 62;
  const pw = W - PL - PR;
  const ph = H - PT - PB;

  const xOf = i => PL + (sorted.length < 2 ? pw / 2 : (i / (sorted.length - 1)) * pw);
  const yOf = v => PT + ph - ((v - minV) / (maxV - minV)) * ph;

  // y-axis grid lines and tick labels
  const range = maxV - minV;
  const step  = range < 0.003 ? 0.0005 : range < 0.008 ? 0.001 : 0.002;
  const first = Math.ceil(minV / step) * step;
  for (let t = first; t <= maxV + 1e-9; t += step) {
    const y = Math.round(yOf(t)) + 0.5;   // half-pixel for crisp lines
    ctx.strokeStyle = C_GRID;
    ctx.lineWidth   = 1;
    ctx.beginPath(); ctx.moveTo(PL, y); ctx.lineTo(PL + pw, y); ctx.stroke();
    ctx.fillStyle    = C_TICK_TEXT;
    ctx.font         = "9px monospace";
    ctx.textAlign    = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(t.toFixed(4), PL - 5, y);
  }

  // axes
  ctx.strokeStyle = C_AXIS;
  ctx.lineWidth   = 1.5;
  ctx.beginPath(); ctx.moveTo(PL + 0.5, PT); ctx.lineTo(PL + 0.5, PT + ph); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(PL, PT + ph + 0.5); ctx.lineTo(PL + pw, PT + ph + 0.5); ctx.stroke();

  // x-axis labels (rotated)
  ctx.fillStyle    = C_LABEL;
  ctx.font         = "8px Arial";
  ctx.textBaseline = "top";
  sorted.forEach((d, i) => {
    ctx.save();
    ctx.translate(xOf(i), PT + ph + 6);
    ctx.rotate(-Math.PI * 55 / 180);
    ctx.textAlign = "right";
    ctx.fillText(d.pair, 0, 0);
    ctx.restore();
  });

  // draw a line + dots
  function drawLine(color, key) {
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2.5;
    ctx.lineJoin    = "round";
    ctx.beginPath();
    sorted.forEach((d, i) => {
      const x = xOf(i), y = yOf(d[key]);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    sorted.forEach((d, i) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(xOf(i), yOf(d[key]), 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  drawLine("#4e8ec8", "pr");   // predicted — vivid steel blue, visible on both light & dark
  drawLine("#d4752a", "ob");   // observed  — vivid amber, visible on both light & dark
}

/* ══════════════════════════════════════════════
   FILTER BUTTONS
   ══════════════════════════════════════════════ */

function buildFilters() {
  const wrap = document.getElementById("filter-btns");
  if (!wrap) return;

  FILTERS.forEach(f => {
    const btn = document.createElement("button");
    btn.className    = "filter-btn";
    btn.textContent  = f.label;
    btn.dataset.key  = f.key;

    btn.addEventListener("click", () => {
      if (activeFilters.has(f.key)) {
        activeFilters.delete(f.key);
        btn.classList.remove("active");
      } else {
        activeFilters.add(f.key);
        btn.classList.add("active");
      }
      updateStats();
      renderCards();
    });

    wrap.appendChild(btn);
  });
}

/* ══════════════════════════════════════════════
   MEASUREMENT CARDS
   ══════════════════════════════════════════════ */

function renderCards() {
  const wrap = document.getElementById("meas-lists");
  if (!wrap) return;
  wrap.innerHTML = "";

  CATEGORIES.forEach(cat => {
    const items = META_DATA.filter(cat.fn);
    if (!items.length) return;

    const allOn = items.every(m => activeIds.has(m.id));

    // Category group wrapper with border
    const group = document.createElement("div");
    group.className = "meas-cat-group";

    const hdr = document.createElement("div");
    hdr.className = "meas-cat-hdr";
    hdr.innerHTML = `
      <div class="meas-cat-title">
        <div class="meas-cat-dot" style="background:${cat.color};"></div>
        ${cat.title}
        <span style="font-weight:400;">(${items.length})</span>
      </div>
      <button class="meas-sel-all" data-cat="${cat.key}">
        ${allOn ? "Deselect all" : "Select all"}
      </button>`;

    hdr.querySelector(".meas-sel-all").addEventListener("click", () => {
      const shouldTurnOn = !items.every(m => activeIds.has(m.id));
      items.forEach(m => shouldTurnOn ? activeIds.add(m.id) : activeIds.delete(m.id));
      updateStats();
      renderCards();
    });

    group.appendChild(hdr);

    const body = document.createElement("div");
    body.className = "meas-cat-body";
    group.appendChild(body);

    wrap.appendChild(group);

    // Cards
    items.forEach(m => {
      const active   = activeIds.has(m.id);
      const filtered = isFilteredOut(m);
      const within   = Math.abs(m.ob - m.pr) <= m.sd;
      const acc      = ((1 - Math.abs(m.ob - m.pr) / m.pr) * 100).toFixed(4);
      const detOpen  = openDetails.has(m.id);

      const card = document.createElement("div");
      card.className = `meas-card${active ? " active" : ""}${filtered ? " filtered" : ""}`;

      card.innerHTML = `
        <div class="meas-row">
          <div class="meas-chk${active ? " on" : ""}">✓</div>
          <div class="meas-info">
            <div class="meas-name">${m.label}</div>
            <div class="meas-meta">${m.pair} &middot; ${m.year} &middot; ${TYPE_LABELS[m.type]}${filtered ? " &middot; <em>filtered out</em>" : ""}</div>
          </div>
          <div class="meas-toggle">${detOpen ? "▲" : "▼"}</div>
        </div>
        <div class="meas-detail${detOpen ? " open" : ""}">
          <strong>Material pair:</strong> ${m.pair}<br>
          <strong>SPD predicted:</strong> ${m.pr.toFixed(7)}<br>
          <strong>Observed:</strong> ${m.ob.toFixed(4)} ± ${m.sd}<br>
          <strong>SPD accuracy:</strong> ${acc}%<br>
          <strong>Within SD:</strong>
            <span class="${within ? "meas-within-yes" : "meas-within-no"}">${within ? "Yes" : "No"}</span>
        </div>`;

      // Toggle active on row click
      card.querySelector(".meas-row").addEventListener("click", () => {
        activeIds.has(m.id) ? activeIds.delete(m.id) : activeIds.add(m.id);
        updateStats();
        renderCards();
      });

      // Toggle detail on arrow click
      card.querySelector(".meas-toggle").addEventListener("click", e => {
        e.stopPropagation();
        openDetails.has(m.id) ? openDetails.delete(m.id) : openDetails.add(m.id);
        renderCards();
      });

      body.appendChild(card);
    });
  });
}

/* ══════════════════════════════════════════════
   BOOT
   ══════════════════════════════════════════════ */

window.addEventListener("resize", () => drawChart(getActiveData()));

buildFilters();
renderCards();
updateStats();
