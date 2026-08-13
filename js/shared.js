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

/* ══════════════════════════════════════════════
   FORMULA DISPLAY — fit-to-width, with a clearly
   signposted horizontal-scroll fallback
   ══════════════════════════════════════════════

   Previously, any formula wider than its box just became
   horizontally scrollable (overflow-x: auto on the MathJax
   mjx-container) with nothing telling the reader that was
   an option — easy to miss, especially on mobile.

   fitFormulas() replaces "just let it scroll" with two
   steps, tried in order for every .formula-box on the page:

     1. Shrink the formula's own font-size until it fits the
        box width, down to a floor of FORMULA_MIN_SCALE. Most
        long formulas end up fitting outright with no
        scrolling needed at all.

     2. If a formula is still too wide even at that minimum
        readable size, fall back to horizontal scrolling —
        but mark the box with .is-scrollable, which (see
        theme-quietmorning.css) adds a soft edge fade and an
        explicit "Scroll to see the full formula" caption, so
        the scrollability itself is never a silent surprise.

   This runs:
     • once MathJax finishes typesetting on page load
       (chained after MathJax.typesetPromise() in each page),
     • whenever a <details> accordion is opened, since a
       formula inside a still-closed accordion has no layout
       box yet and can't be measured until it's visible,
     • and on window resize (debounced), so formulas can both
       shrink further and grow back toward full size as the
       viewport changes.
   ══════════════════════════════════════════════ */

const FORMULA_MIN_SCALE = 0.66; // don't shrink past ~two-thirds size — smaller reads poorly

function fitFormulas() {
  document.querySelectorAll(".formula-box").forEach(box => {
    const mjx = box.querySelector("mjx-container");
    if (!mjx) return;

    // Reset any earlier pass before re-measuring — formulas need to be
    // able to grow back to full size after a resize to a wider viewport,
    // not just shrink monotonically.
    mjx.style.fontSize = "";
    box.classList.remove("is-scrollable");

    // A formula inside a still-closed <details> has no layout box yet
    // (display: none up the tree) — nothing to measure or fit until the
    // accordion is actually opened; the toggle listener below handles that.
    if (box.offsetParent === null) return;

    const styles    = getComputedStyle(box);
    const available = box.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
    const natural   = mjx.scrollWidth;

    if (available <= 0 || natural <= available) return; // already fits, nothing to do

    const scale = (available / natural) * 0.97; // small safety margin so it isn't a pixel-perfect squeeze

    if (scale >= FORMULA_MIN_SCALE) {
      const baseSize = parseFloat(getComputedStyle(mjx).fontSize);
      mjx.style.fontSize = (baseSize * scale) + "px";
    }

    // Still too wide even at the minimum readable scale (or shrinking
    // wasn't attempted because it would have gone past that floor) —
    // fall back to the clearly-labelled horizontal-scroll mode.
    if (mjx.scrollWidth > available + 1) {
      box.classList.add("is-scrollable");
    }
  });
}

let _formulaResizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(_formulaResizeTimer);
  _formulaResizeTimer = setTimeout(fitFormulas, 150);
});

// The native <details> "toggle" event does not bubble, but it does still
// reach a capturing-phase listener on an ancestor — so one listener here
// catches every accordion on the page (including nested mini-accordions)
// without needing a handler wired to each one individually.
document.addEventListener("toggle", event => {
  if (event.target && event.target.tagName === "DETAILS") {
    // Wait a frame so the browser has actually laid out the now-visible
    // content before we try to measure it.
    requestAnimationFrame(fitFormulas);
  }
}, true);
