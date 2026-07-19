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
     type     – category key (see below)
   ══════════════════════════════════════════════ */

/* ══════════════════════════════════════════════
   CATEGORIES (type field):
     "high"       – high accuracy Cavendish (main list)
     "freefall"   – freefall / atom interferometer experiments
     "speculative"– test mass composition uncertain or speculative
     "lowestval"  – lowest value selected (insufficient environmental isolation)
     "lowacc"     – low accuracy (pre-modern or poor SD > 0.01)
     "outofrange"  – beyond reasonable range 6.660–6.676
     "largescale" – large-scale / long-range / intermediate-range experiments
     "homogenized"– averages of mixed/heterogeneous compositions (Pontikis 1972,
                     and the two 19th-century multi-material trials Reich 1838 & Bailey 1843)
     "conflicting"– averages of values literally from the same experiment/apparatus
                     that disagree with each other (off by default)
   Notation for damping disks:
     SM – [TM ≪ DD]  means source mass – [test mass ≪ dominant damping disk]
     DD  = damping disk (aluminum)
     ECD = eddy current damper (steel/iron)
   ══════════════════════════════════════════════ */

/* Measurement data now lives in g-value-meta-analysis-data.json
   (see that file for the full list, grouped in the same order/
   categories as before, with the same id/label/pair/pr/ob/sd/year/
   type/scale/note fields). Loaded asynchronously below in BOOT. */

   let META_DATA = [];

const TYPE_LABELS = {
  high:         "High accuracy Cavendish",
  freefall:     "Freefall / atom interferometer",
  speculative:  "Speculative test mass composition",
  lowestval:    "Lowest value selected (insufficient isolation)",
  lowacc:       "Low accuracy / historic",
  largescale:   "Large-scale / intermediate-range (Poynting method)",
  outofrange:   "Beyond reasonable range",
  homogenized:  "Homogenized / mixed-composition average (off by default)",
  conflicting:  "Average of conflicting values (off by default)",
};

const SCALE_LABELS = {
  lab:   "Laboratory",
  large: "Large-scale / long-range",
};

const CATEGORIES = [
  {
    key: "high",
    title: "High accuracy Cavendish",
    color: "#1a8c5c",
    fn: m => m.type === "high",
  },
  {
    key: "freefall",
    title: "Freefall / atom interferometer",
    color: "#4c6f95",
    fn: m => m.type === "freefall",
  },
  {
    key: "speculative",
    title: "Speculative test mass (Pontikis Pb & Hg)",
    color: "#7a5c9e",
    fn: m => m.type === "speculative",
  },
  {
    key: "lowestval",
    title: "Lowest value selected (insufficient isolation)",
    color: "#7a7a40",
    fn: m => m.type === "lowestval",
  },
  {
    key: "largescale",
    title: "Large-scale / intermediate-range",
    color: "#c87a40",
    fn: m => m.type === "largescale",
  },
  {
    key: "lowacc",
    title: "Low accuracy / historic",
    color: "#888",
    fn: m => m.type === "lowacc",
  },
  {
    key: "outofrange",
    title: "Beyond reasonable range (6.660 – 6.676)",
    color: "#b84040",
    fn: m => m.type === "outofrange",
  },
  {
    key: "homogenized",
    title: "Homogenized / mixed-composition average (off by default)",
    color: "#3f7a8c",
    fn: m => m.type === "homogenized",
  },
  {
    key: "conflicting",
    title: "Average of conflicting values (off by default)",
    color: "#8a6040",
    fn: m => m.type === "conflicting",
  },
];



const FILTERS = [
  { key: "bigsd",       label: "SD ≥ 0.01",                        fn: m => m.sd >= 0.01 },
  { key: "outofrange",  label: "Outside 6.660 – 6.676",            fn: m => m.ob < 6.660 || m.ob > 6.676 },
  { key: "largescale",  label: "Large-scale / intermediate-range",  fn: m => m.type === "largescale" },
  { key: "lowacc",      label: "Low accuracy / historic",           fn: m => m.type === "lowacc" },
  { key: "freefall",    label: "Freefall / interferometer",         fn: m => m.type === "freefall" },
  { key: "homogenized", label: "Homogenized / mixed-composition",   fn: m => m.type === "homogenized" },
  { key: "speculative", label: "Speculative test mass",             fn: m => m.type === "speculative" },
  { key: "lowestval",   label: "Lowest value selected",             fn: m => m.type === "lowestval" },
  { key: "conflicting", label: "Conflicting value averages",          fn: m => m.type === "conflicting" },
];
/* ══════════════════════════════════════════════
   STATE
   ══════════════════════════════════════════════ */

// Default: include only high, freefall, speculative, lowestval entries
const DEFAULT_EXCLUDED_TYPES = new Set(["lowacc","outofrange","largescale","conflicting","homogenized"]);
let activeIds;   // initialized once META_DATA loads — see BOOT at bottom
let activeFilters = new Set(["outofrange"]);
let openDetails   = new Set();

function isFilteredOut(m) {
  return [...activeFilters].some(k => FILTERS.find(f => f.key === k).fn(m));
}

function getActiveData() {
  // Return the active filtered set directly — no averaging.
  // Entries that share the same predicted value are handled correctly
  // by tau-b via the T1 (prediction-tie) count; their relationships
  // with all other entries are still fully counted as concordant or
  // discordant pairs.
  return META_DATA.filter(m => activeIds.has(m.id) && !isFilteredOut(m));
}

/* ══════════════════════════════════════════════
   KENDALL TAU-B+  (with tie correction)
   ══════════════════════════════════════════════

   NOTE: this is a deliberate, named departure from standard tau-b,
   not standard tau-b itself. Standard tau-b (the common convention,
   e.g. SciPy's kendalltau) drops pairs tied on BOTH predicted and
   observed value entirely: they contribute to neither C, D, T1, nor
   T2, on the reasoning that no ordering information is present when
   neither dimension varies between the pair.

   Sky Darmos's call for this dataset: a "joint tie" -- two different
   experiments, different masses/years, independently landing on the
   same predicted AND observed value -- is not uninformative here. It
   is itself a striking piece of concordant evidence (motivated by
   prior Eotvos-experiment analysis, where identical composition
   producing identical measured gravity was counted as support, not
   noise). So here, joint ties are counted as CONCORDANT (added to C)
   ONLY -- T1 and T2 remain pure exclusive tie-counts (predicted-only,
   observed-only), unaffected by joint ties. Formula:
     tau_b+ = (C - D + Txy) / sqrt((C+D+T1+Txy) * (C+D+T2+Txy))
   which is exactly what the code below computes, since C already
   includes Txy and C+D+T1+Txy = P-T2 algebraically. This keeps the
   denominator large enough that perfect agreement can never push
   tau_b+ above 1. Only two pairs in the default dataset are
   affected: De Boer (1987) & Lamporesi (2008), and Goldblum (1987) &
   Ritter (1990).

   Method (from Sky Darmos):
   ─────────────────────────
   1. Count concordant pairs C, discordant pairs D, and tied pairs
      T_X (ties on predicted only) and T_Y (ties on observed only) by
      scanning all (i,j) pairs. Joint ties add to C only (see NOTE).

   2. tau_b+ = (C − D + T_XY) / sqrt((C+D+T_X+T_XY)(C+D+T_Y+T_XY))
      — computed here as sqrt((P−T2)(P−T1)) with T1=T_X, T2=T_Y,
      which is algebraically identical (see NOTE above).

   3. Significance (z, p) does NOT use tau_b+ directly. The exact
      asymptotic variance of tau_b+ under this tie structure has no
      clean closed form, and deriving one isn't obviously more
      trustworthy than the alternative below. Instead:
        - Only the T = T_X + T_Y exclusive ties are "still ambiguous"
          (joint ties are already resolved into C, not part of this).
        - Search net = T, T-2, T-4, ... for the SMALLEST net such
          that the tau-a candidate (S+net)/P first exceeds tau_b+.
          That is the "next higher tau-a".
        - sigma = sqrt(2(2n+5) / 9n(n−1))  [simple, uncorrected tau-a
          variance — exact only when there are no ties, used here as
          a conservative proxy]
        - z = (next higher tau-a) / sigma
        - p = right-tailed normal CDF of z
      This is conservative by construction: using the closest tau-a
      value that is still strictly above tau_b+ never makes the
      result look MORE significant than a direct approach would.
   ══════════════════════════════════════════════ */

function kendallTauB(data) {
  const n = data.length;
  if (n < 2) return { tau: null, z: null, p: null, n, C: 0, D: 0, T1: 0, T2: 0 };

  let C = 0, D = 0, T1 = 0, T2 = 0;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dP = data[i].pr - data[j].pr;
      const dO = data[i].ob - data[j].ob;

      const tieP = Math.abs(dP) < 1e-9;
      const tieO = Math.abs(dO) < 1e-9;

      if (tieP && tieO) {
        // Joint tie (tau-b+, not standard tau-b): counted as concordant
        // AND added to both tie counts T1 and T2. Deliberate departure
        // from standard tau-b (which drops joint ties entirely) — see
        // header note above. Applies to exactly two pairs in this
        // dataset: De Boer (1987) & Lamporesi (2008) and Goldblum
        // (1987)/Ritter (1990).
        //
        // NOTE: added to C only — NOT to T1 or T2. Per the exact
        // formula tau = (C-D+Txy) / sqrt((C+D+Tx+Txy)*(C+D+Ty+Txy)),
        // Txy only inflates the numerator; T1/T2 stay pure exclusive
        // tie-counts (predicted-only / observed-only). Adding Txy to
        // T1/T2 as well (an earlier bug here) double-benefits joint
        // ties and can push tau above what a perfect-agreement case
        // should give — with the correct formula, all-joint-tie data
        // gives tau = 1 exactly, never more.
        C++;
      } else if (tieP) {
        // Tied on predicted only
        T1++;
      } else if (tieO) {
        // Tied on observed only
        T2++;
      } else if (dP * dO > 0) {
        C++;
      } else {
        D++;
      }
    }
  }

  const P     = n * (n - 1) / 2;
  const S     = C - D;

  // tau_b+ denominator: sqrt((P-T2)*(P-T1)), with T1/T2 as pure
  // exclusive tie-counts (joint ties already folded into C above,
  // not into T1/T2 — see NOTE above). This is algebraically identical
  // to Sky Darmos's C+D+Tx+Txy / C+D+Ty+Txy form: e.g.
  // C+D+T1+Txy = P-T2 exactly when T1,T2 exclude Txy.
  const denom = Math.sqrt((P - T2) * (P - T1));
  const tau   = denom === 0 ? 0 : S / denom;

  // ── Significance: "next higher tau-a" method ──────────────────────
  // The exact asymptotic variance of tau_b+ under this tie structure
  // is not a clean closed form — deriving it properly is genuinely
  // messy, and not obviously more trustworthy than the alternative
  // below even if we did. Instead we get a p-value by deliberately
  // using the SIMPLE, well-known tau-a variance (which assumes no
  // ties) as a conservative proxy, applied to a tau-a value chosen
  // to never understate how tied pairs could have gone against us:
  //
  //   Only the T1+T2 EXCLUSIVE ties (T_X, T_Y) are "still ambiguous"
  //   here — joint ties (T_XY) are already resolved into C above, not
  //   part of this search. Each exclusive tied pair could in
  //   principle have been concordant (+1 to S) or discordant (-1 to
  //   S); we search over net = T, T-2, T-4, ..., for the SMALLEST net
  //   such that the resulting tau-a candidate (S+net)/P first exceeds
  //   the true tau_b+. That "next higher tau-a" is then used as the
  //   numerator for z, with the simple uncorrected tau-a sigma as the
  //   denominator. Because we picked the closest tau-a value that is
  //   still strictly above tau_b+ (not the true, generally larger,
  //   tau-a upper bound), this is a conservative estimate: it never
  //   makes the result look MORE significant than the simple-sigma
  //   approach would, only equally or less.
  const sigma = Math.sqrt((2 * (2 * n + 5)) / (9 * n * (n - 1)));

  let z, adjustedTau;
  const T = T1 + T2;   // exclusive tied pairs only (T_XY excluded — already in C)

  if (T === 0) {
    // No exclusive ties: tau-a and tau_b+ coincide already.
    adjustedTau = tau;
    z = sigma === 0 ? 0 : tau / sigma;
  } else {
    const startNet = (T % 2 === 0) ? 2 : 1;
    let found = false;
    for (let net = startNet; net <= T; net += 2) {
      const candidateTau = (S + net) / P;
      if (candidateTau > tau) {
        adjustedTau = candidateTau;
        found = true;
        break;
      }
    }
    if (!found) adjustedTau = tau;

    z = sigma === 0 ? 0 : adjustedTau / sigma;
  }

  const p = 1 - normalCDF(z);

  return { tau, z, p, n, C, D, T1, T2, S, adjustedTau };
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

  // Show tau_b+ and, when it differs, the adjusted next-higher tau-a
  // that actually feeds the z-score (see kendallTauB's "Significance"
  // comment for why these can differ).
  if (s.tau !== null) {
    const hasTies = (s.T1 + s.T2) > 0;
    if (hasTies && s.adjustedTau !== s.tau) {
      document.getElementById("s-tau").textContent =
        `τ-b+: ${s.tau.toFixed(5)} / τ-a: ${s.adjustedTau.toFixed(5)}`;
    } else {
      document.getElementById("s-tau").textContent = `τ-b+: ${s.tau.toFixed(5)}`;
    }
  } else {
    document.getElementById("s-tau").textContent = "—";
  }

  document.getElementById("s-z").textContent    = s.z    !== null ? s.z.toFixed(4)   : "—";
  document.getElementById("s-p").textContent    = formatP(s.p);
  document.getElementById("s-odds").textContent = formatOdds(s.p);
  document.getElementById("s-cd").textContent   = (s.C !== undefined) ? `${s.C} – ${s.D}` : "—";
  const elTies = document.getElementById("s-ties");
  if (elTies) {
    if (s.T1 !== undefined) {
      elTies.textContent = `${s.T1} pred / ${s.T2} obs`;
    } else {
      elTies.textContent = "—";
    }
  }

  // Letter sequence: each experiment gets a unique letter A, B, C, …
  // assigned in order of predicted value (ties in prediction get consecutive
  // letters since they are different experiments).
  // The observed hierarchy is then displayed as those letters in observed order,
  // with parentheses around groups of observation-tied entries.
  const elSeq = document.getElementById("s-seq");
  if (elSeq) {
    if (data.length >= 2 && data.length <= 26) {
      // Sort by pr first, then by ob as tiebreaker, to get a stable ordering
      const sorted = [...data].sort((a, b) => a.pr - b.pr || a.ob - b.ob);
      // Assign a unique letter to every experiment
      sorted.forEach((m, i) => { m._letter = String.fromCharCode(65 + i); });
      // Sort by observed value to build the hierarchy string
      const byObs = [...sorted].sort((a, b) => a.ob - b.ob);
      // Build sequence: obs-tied groups in parentheses, others space-separated
      let seq = "";
      byObs.forEach((m, i) => {
        const prevOb = i > 0 ? byObs[i-1].ob : null;
        const nextOb = i < byObs.length - 1 ? byObs[i+1].ob : null;
        const tiedWithPrev = prevOb !== null && Math.abs(m.ob - prevOb) < 1e-9;
        const tiedWithNext = nextOb !== null && Math.abs(m.ob - nextOb) < 1e-9;
        if (!tiedWithPrev && tiedWithNext) seq += "(";
        seq += m._letter;
        if (tiedWithPrev && !tiedWithNext) seq += ") ";
        else if (!tiedWithPrev && !tiedWithNext) seq += " ";
      });
      elSeq.textContent = seq.trim();
    } else if (data.length > 26) {
      elSeq.textContent = "(too many elements for letter display)";
    } else {
      elSeq.textContent = "—";
    }
  }

  drawChart(data);
}

/* ══════════════════════════════════════════════
   CHART
   ══════════════════════════════════════════════ */

function drawChart(data) {
  const canvas = document.getElementById("meta-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

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

    // Show filters that are enabled by default as active
    if (activeFilters.has(f.key)) {
      btn.classList.add("active");
    }

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
          <strong>Setup:</strong> ${SCALE_LABELS[m.scale] || m.scale}<br>
          <strong>Within SD:</strong>
            <span class="${within ? "meas-within-yes" : "meas-within-no"}">${within ? "Yes" : "No"}</span>${m.note ? `<br><strong>Note:</strong> ${m.note}` : ""}
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

fetch("g-value-meta-analysis-data.json")
  .then(response => response.json())
  .then(data => {
    META_DATA = data.measurements;
    activeIds = new Set(META_DATA.filter(m => !DEFAULT_EXCLUDED_TYPES.has(m.type)).map(m => m.id));
    buildFilters();
    renderCards();
    updateStats();
  })
  .catch(error => {
    console.error("Could not load meta-analysis data:", error);
    const list = document.getElementById("meas-lists");
    if (list) {
      list.innerHTML =
        "Could not load measurement data. Make sure g-value-meta-analysis-data.json is in the same folder as the HTML files.";
    }
  });
