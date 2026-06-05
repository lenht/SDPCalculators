/* ─────────────────────────────────────────────
   sidebar.js
   Loads sidebar.html into <aside class="sidebar">,
   marks the active link, opens the right category,
   then wires up the toggle buttons.
   ───────────────────────────────────────────── */

(async function () {
  const aside = document.querySelector(".sidebar");
  if (!aside) return;

  // ── 1. Fetch and inject ──────────────────────
  try {
    const res  = await fetch("sidebar.html");
    const html = await res.text();
    aside.innerHTML = html;
  } catch (e) {
    console.error("Could not load sidebar.html:", e);
    return;
  }

  // ── 2. Mark active link & open its category ──
  const current = window.location.pathname.split("/").pop() || "index.html";

  aside.querySelectorAll("a.formula-link").forEach(link => {
    const href = link.getAttribute("href");
    if (href === current) {
      link.classList.add("active");
      // open the parent category
      const category = link.closest(".category");
      if (category) category.classList.add("open");
    }
  });

  // ── 3. Wire up category toggle buttons ───────
  aside.querySelectorAll(".category-button").forEach(button => {
    button.addEventListener("click", () => {
      button.parentElement.classList.toggle("open");
    });
  });
})();
