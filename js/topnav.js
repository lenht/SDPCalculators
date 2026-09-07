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
})();
