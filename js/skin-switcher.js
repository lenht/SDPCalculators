/* ─────────────────────────────────────────────
   skin-switcher.js
   Injects the swatch UI into the sidebar and
   swaps the theme stylesheet. Persists choice
   to localStorage.
   ───────────────────────────────────────────── */

(function () {

  const THEMES = [
    { id: 'default', label: 'Classic Blue',  color: '#2f5f8f',                          file: 'css/theme-default.css' },
    { id: 'dark',    label: 'Deep Space',    color: '#38bdf8',                          file: 'css/theme-dark.css'    },
    { id: 'journal', label: 'Journal',       color: '#8b1a1a',                          file: 'css/theme-journal.css' },
    { id: 'glass',   label: 'Glassmorphism', color: 'linear-gradient(135deg,#7c3aed,#38bdf8)', file: 'css/theme-glass.css'   },
  { id: 'cosmic',  label: 'Cosmic Accents',   color: 'linear-gradient(135deg,#4f46e5,#93c5fd)', file: 'css/theme-cosmic.css'  },
  { id: 'cosmic2',   label: 'Cosmic Midnight',  color: 'linear-gradient(135deg,#091812,#0d9488)', file: 'css/theme-cosmic2.css'  },
  {
    id: 'skycloud',
    label: 'Sky Cloud',
    color: 'linear-gradient(135deg,#443444,#646472,#6891B6,#B6CBDD)',
    file: 'css/theme-skycloud.css'
  },
  {
  id: 'skycloud-mauve',
  label: 'Sky Cloud Mauve',
  color: 'linear-gradient(135deg,#744C55,#8C6B76,#C5BFCC,#6891B6)',
  file: 'css/theme-sky-blue-cloud-mauve-full.css'
  },
  {
    id: 'galaxy',
    label: 'Atmosphere Galaxy',
    color: 'linear-gradient(135deg,#343C43,#405771,#C4AC97,#DCCAC4)',
    file: 'css/theme-atmosphere-galaxy.css'
  },
  {
    id: 'outerspace',
    label: 'Outer Space Atmosphere',
    color: 'linear-gradient(135deg,#3C3745,#635C5A,#A99491,#E6E4DC)',
    file: 'css/theme-outer-space-atmosphere.css'
  },
  {
    id: 'midnightgalaxy',
    label: 'Midnight Galaxy',
    color: 'linear-gradient(135deg,#051C24,#454B6E,#947C91,#86A1C6)',
    file: 'css/theme-midnight-galaxy.css'
  },
  {
    id: 'dreamscape-light',
    label: 'Dreamscape Light',
    color: 'linear-gradient(135deg,#D1C2A8,#ACADA4,#B3D0B4)',
    file: 'css/theme-dreamscape-night-light.css'
  },

  {
    id: 'dreamscape-dark',
    label: 'Dreamscape Dark',
    color: 'linear-gradient(135deg,#12131C,#98898D,#B3D0B4)',
    file: 'css/theme-dreamscape-night-dark.css'
  }   
];

  const STORAGE_KEY = 'spd-theme';

  // ── 1. Inject <link> tag if not already present ───────────────
  let link = document.getElementById('theme-stylesheet');
  if (!link) {
    link = document.createElement('link');
    link.id  = 'theme-stylesheet';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }

  // ── 2. Apply a theme ─────────────────────────────────────────
  function applyTheme(id) {
    const theme = THEMES.find(t => t.id === id) || THEMES[0];
    link.href = theme.file;
    localStorage.setItem(STORAGE_KEY, id);
    // update active swatch
    document.querySelectorAll('.skin-swatch').forEach(s => {
      s.classList.toggle('active', s.dataset.theme === id);
    });
  }

  // ── 3. Build swatch row and inject into sidebar ───────────────
  function buildSwitcher() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'skin-switcher';

    const label = document.createElement('div');
    label.className = 'skin-switcher-label';
    label.textContent = 'Theme';
    wrapper.appendChild(label);

    const swatches = document.createElement('div');
    swatches.className = 'skin-swatches';

    THEMES.forEach(theme => {
      const swatch = document.createElement('button');
      swatch.className   = 'skin-swatch';
      swatch.dataset.theme = theme.id;
      swatch.title       = theme.label;
      swatch.style.background = theme.color;
      swatch.addEventListener('click', () => applyTheme(theme.id));
      swatches.appendChild(swatch);
    });

    wrapper.appendChild(swatches);

    // Insert after the subtitle paragraph
    const subtitle = sidebar.querySelector('.subtitle');
    if (subtitle) {
      subtitle.insertAdjacentElement('afterend', wrapper);
    } else {
      sidebar.prepend(wrapper);
    }
  }

  // ── 4. Boot: wait for sidebar to be populated ─────────────────
  // sidebar.js loads sidebar.html async, so we observe the sidebar
  function boot() {
    const savedId = localStorage.getItem(STORAGE_KEY) || 'default';

    const aside = document.querySelector('.sidebar');
    if (!aside) return;

    // If sidebar already has content, build immediately
    if (aside.querySelector('.subtitle')) {
      buildSwitcher();
      applyTheme(savedId);
      return;
    }

    // Otherwise observe until sidebar.js populates it
    const observer = new MutationObserver(() => {
      if (aside.querySelector('.subtitle')) {
        observer.disconnect();
        buildSwitcher();
        applyTheme(savedId);
      }
    });
    observer.observe(aside, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();