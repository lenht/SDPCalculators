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

  // ── Viewport check ────────────────────────────
  // Mirrors the 800px breakpoint in theme-quietmorning.css. Desktop
  // keeps the original one-dropdown-at-a-time accordion behaviour
  // (hover-driven menus benefit from only ever showing one at once).
  // The mobile drawer is a deliberately different interaction — a
  // vertical list the person taps through — where multiple categories
  // staying open at the same time is the better, less fiddly behaviour,
  // so every "close the others" call below is gated behind this check.
  function isMobileNav() {
    return window.matchMedia("(max-width: 800px)").matches;
  }

  // ── Dropdown open/close ───────────────────────
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
      // Desktop: collapse any other open category first, so only one
      // dropdown is ever showing at a time (unchanged behaviour).
      // Mobile: skip this — each category toggles independently, so
      // several can stay expanded in the drawer at once.
      if (!isMobileNav()) closeAll(cat);
      cat.classList.toggle("open", !wasOpen);
    });
    // Hovering onto a different category should release any category
    // that was pinned open by a click — otherwise its .open class keeps
    // its dropdown visible underneath/alongside the one now showing via
    // :hover, since :hover and .open are independent triggers for the
    // same display: block rule. This is a desktop-only interaction
    // (mobile has no hover state to speak of), so it's gated the same way.
    cat.addEventListener("mouseenter", () => {
      if (!isMobileNav()) closeAll(cat);
    });
  });

  document.addEventListener("click", () => {
    // Desktop: a stray click anywhere else collapses any open dropdown.
    // Mobile: leave open categories as they are — tapping outside a
    // category inside the drawer shouldn't collapse it; only the
    // drawer's own close button, the backdrop, or Escape should close
    // things on mobile (handled below via closeDrawer()).
    if (!isMobileNav()) closeAll(null);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeAll(null);
  });

  // ── Mobile slide-in drawer ────────────────────
  // On narrow viewports .topnav-cats becomes an off-canvas panel
  // (see the mobile media query in theme-quietmorning.css), with its
  // own header (brand + close button) above a scrollable list of
  // categories. The hamburger button and the drawer's own close
  // button both toggle it; the categories inside keep working
  // exactly as before (click to expand a category's links), just
  // stacked vertically instead of shown as a hovering dropdown.
  const hamburger   = header.querySelector("#topnav-hamburger");
  const drawer      = header.querySelector("#topnav-cats");
  const drawerClose = header.querySelector("#topnav-drawer-close");
  const overlay     = document.getElementById("topnav-overlay");

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
    // so it doesn't reopen already-expanded next time. This applies
    // regardless of the mobile-multi-open behaviour above — closing
    // the whole drawer is still a full reset.
    closeAll(null);
  }

  if (hamburger) {
    hamburger.addEventListener("click", event => {
      event.stopPropagation();
      const isOpen = drawer && drawer.classList.contains("open");
      isOpen ? closeDrawer() : openDrawer();
    });
  }

  if (drawerClose) {
    drawerClose.addEventListener("click", event => {
      event.stopPropagation();
      closeDrawer();
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
