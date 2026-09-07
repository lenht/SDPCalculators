/* ─────────────────────────────────────────────
   topnav.js
   Loads topnav.html into <header class="topnav"> and
   footer.html into <footer class="site-footer">, marks
   the active link + its category, then wires up the
   category dropdown open/close behaviour.
   ───────────────────────────────────────────── */

(async function () {
  const header = document.querySelector("header.topnav");
  const footer = document.querySelector("footer.site-footer");

  if (header) {
    try {
      const res = await fetch("topnav.html");
      header.innerHTML = await res.text();
    } catch (e) {
      console.error("Could not load topnav.html:", e);
    }
  }

  if (footer) {
    try {
      const res = await fetch("footer.html");
      footer.innerHTML = await res.text();
    } catch (e) {
      console.error("Could not load footer.html:", e);
    }
  }

  if (!header) return;

  // ── Mark active link & its category ──────────
  const current = window.location.pathname.split("/").pop() || "index.html";
  const cats = Array.from(header.querySelectorAll(".topnav-cat"));

  cats.forEach(cat => {
    cat.querySelectorAll("a.formula-link").forEach(link => {
      if (link.getAttribute("href") === current) {
        link.classList.add("active");
        cat.classList.add("has-active");
      }
    });
  });

  // ── Dropdown open/close — one at a time ──────
  function closeAll(except) {
    cats.forEach(cat => {
      if (cat !== except) cat.classList.remove("open");
    });
  }

  cats.forEach(cat => {
    const btn = cat.querySelector(".topnav-cat-btn");
    if (!btn) return;
    btn.addEventListener("click", event => {
      event.stopPropagation();
      const wasOpen = cat.classList.contains("open");
      closeAll(cat);
      cat.classList.toggle("open", !wasOpen);
    });
    // Hovering onto a different category should release any category
    // that was pinned open by a click — otherwise its .open class keeps
    // its dropdown visible underneath/alongside the one now showing via
    // :hover, since :hover and .open are independent triggers for the
    // same display: block rule.
    cat.addEventListener("mouseenter", () => closeAll(cat));
  });

  document.addEventListener("click", () => closeAll(null));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeAll(null);
  });

  // ── Mobile slide-in drawer ────────────────────
  // On narrow viewports .topnav-cats becomes an off-canvas panel
  // (see the mobile media query in theme-quietmorning.css). The
  // hamburger button toggles it; the categories inside keep working
  // exactly as before (click to expand a category's links), just
  // stacked vertically instead of shown as a hovering dropdown.
  const hamburger  = header.querySelector("#topnav-hamburger");
  const drawer     = header.querySelector("#topnav-cats");
  const overlay    = document.getElementById("topnav-overlay");

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add("open");
    if (overlay) overlay.classList.add("open");
    if (hamburger) hamburger.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-drawer-open");
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("open");
    if (overlay) overlay.classList.remove("open");
    if (hamburger) hamburger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-drawer-open");
    // Also collapse any category left expanded inside the drawer,
    // so it doesn't reopen already-expanded next time.
    closeAll(null);
  }

  if (hamburger) {
    hamburger.addEventListener("click", event => {
      event.stopPropagation();
      const isOpen = drawer && drawer.classList.contains("open");
      isOpen ? closeDrawer() : openDrawer();
    });
  }

  if (overlay) {
    overlay.addEventListener("click", closeDrawer);
  }

  // Closing on Escape is handled by the existing keydown listener
  // above for categories — extend it to also close the drawer.
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeDrawer();
  });

  // Picking a destination (or the brand link) should close the drawer
  // rather than leaving it open underneath the page that loads next.
  header.querySelectorAll("a.formula-link, .topnav-brand-link").forEach(link => {
    link.addEventListener("click", closeDrawer);
  });

  // If the viewport is widened past the mobile breakpoint while the
  // drawer is open, close it so it doesn't linger as a fixed-position
  // panel over the desktop layout.
  window.addEventListener("resize", () => {
    if (window.innerWidth > 800) closeDrawer();
  });
})();
