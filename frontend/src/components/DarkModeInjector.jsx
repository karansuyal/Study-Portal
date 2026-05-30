import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// ── COLOUR MAPS ───────────────────────────────────────────────────
const LIGHT = {
  bg: {
    primary:   ['#ffffff', '#fff', 'white'],
    secondary: ['#f9fafb'],
    tertiary:  ['#f3f4f6'],
    page:      ['#f8fafc', '#f5f7fa', '#f5f5f8', '#e2e8f0', '#c3cfe2'],
  },
  text: {
    primary:   ['#1f2937', '#111827'],
    secondary: ['#4b5563', '#374151'],
    muted:     ['#6b7280', '#9ca3af'],
  },
  border: ['#e5e7eb', '#e2e8f0', '#d1d5db'],
};

const DARK = {
  bg: {
    primary:   '#18181f',
    secondary: '#1e1e28',
    tertiary:  '#252530',
    page:      '#0e0e14',
  },
  text: {
    primary:   '#f0f0fa',
    secondary: '#a0a0b8',
    muted:     '#6a6a88',
  },
  border: 'rgba(255,255,255,0.08)',
};

// Normalize a colour string for comparison
const norm = (v = '') => v.replace(/\s/g, '').toLowerCase();

// Check if a value matches any in a list
const matches = (val, list) => list.some(c => norm(val) === norm(c));

// ── CORE PATCHER ─────────────────────────────────────────────────
function patchElement(el, dark) {
  const s = el.style;
  if (!s) return;

  // ── background ──────────────────────────────────────────────
  const rawBg = s.background || s.backgroundColor || '';
  if (rawBg) {
    if (dark) {
      if (matches(rawBg, LIGHT.bg.primary))
        s.setProperty('background', DARK.bg.primary, 'important');
      else if (matches(rawBg, LIGHT.bg.secondary))
        s.setProperty('background', DARK.bg.secondary, 'important');
      else if (matches(rawBg, LIGHT.bg.tertiary))
        s.setProperty('background', DARK.bg.tertiary, 'important');
      else if (matches(rawBg, LIGHT.bg.page))
        s.setProperty('background', DARK.bg.page, 'important');
      // gradient light backgrounds
      else if (rawBg.includes('#f8fafc') || rawBg.includes('#f5f7fa'))
        s.setProperty('background', DARK.bg.page, 'important');
      // login page gradient
      else if (rawBg.includes('667eea') && rawBg.includes('764ba2') && !rawBg.includes('opacity'))
        s.setProperty('background', 'linear-gradient(135deg,#2d1f6e 0%,#3d1f6e 100%)', 'important');
    } else {
      // reset to nothing — CSS class or original will take over
    }
  }

  // ── color ───────────────────────────────────────────────────
  const rawColor = s.color || '';
  if (rawColor && dark) {
    if (matches(rawColor, LIGHT.text.primary))
      s.setProperty('color', DARK.text.primary, 'important');
    else if (matches(rawColor, LIGHT.text.secondary))
      s.setProperty('color', DARK.text.secondary, 'important');
    else if (matches(rawColor, LIGHT.text.muted))
      s.setProperty('color', DARK.text.muted, 'important');
  }

  // ── border ──────────────────────────────────────────────────
  if (dark) {
    ['borderColor', 'borderTopColor', 'borderBottomColor',
     'borderLeftColor', 'borderRightColor'].forEach(prop => {
      if (s[prop] && matches(s[prop], LIGHT.border))
        s.setProperty(
          prop.replace(/([A-Z])/g, '-$1').toLowerCase(),
          DARK.border, 'important'
        );
    });
    // shorthand border
    if (s.border && LIGHT.border.some(c => s.border.includes(c))) {
      const updated = LIGHT.border.reduce(
        (acc, c) => acc.replace(new RegExp(c, 'gi'), DARK.border), s.border
      );
      s.setProperty('border', updated, 'important');
    }
  }

  // ── box-shadow (keep structure, just darken colour) ─────────
  if (dark && s.boxShadow && s.boxShadow.includes('rgba(0,0,0,')) {
    s.setProperty('box-shadow',
      s.boxShadow.replace(/rgba\(0,0,0,[\d.]+\)/g, 'rgba(0,0,0,0.5)'),
      'important');
  }
}

// ── SAVE ORIGINALS ────────────────────────────────────────────────
const ORIG_KEY = '__sp_orig_style__';

function saveOriginals(el) {
  if (el[ORIG_KEY]) return;
  el[ORIG_KEY] = {
    background:      el.style.background,
    backgroundColor: el.style.backgroundColor,
    color:           el.style.color,
    border:          el.style.border,
    borderColor:     el.style.borderColor,
    boxShadow:       el.style.boxShadow,
  };
}

function restoreOriginals(el) {
  const orig = el[ORIG_KEY];
  if (!orig) return;
  Object.entries(orig).forEach(([k, v]) => {
    if (v === null || v === undefined) {
      el.style.removeProperty(k.replace(/([A-Z])/g, '-$1').toLowerCase());
    } else {
      el.style[k] = v;
    }
  });
}

// ── MAIN APPLY FUNCTION ───────────────────────────────────────────
function applyDarkMode(dark) {
  const elements = document.querySelectorAll('[style]');
  elements.forEach(el => {
    if (dark) {
      saveOriginals(el);
      patchElement(el, true);
    } else {
      restoreOriginals(el);
    }
  });
}

// ── MUTATION OBSERVER ───────────────────────────────────────────────
let observer = null;

function startObserver(dark) {
  if (observer) observer.disconnect();
  if (!dark) return;

  observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        if (node.style) { saveOriginals(node); patchElement(node, true); }
        node.querySelectorAll?.('[style]').forEach(el => {
          saveOriginals(el); patchElement(el, true);
        });
      });
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const el = mutation.target;
        if (el && document.documentElement.getAttribute('data-theme') === 'dark') {
          saveOriginals(el);
          patchElement(el, true);
        }
      }
    });
  });

  observer.observe(document.body, {
    childList:     true,
    subtree:       true,
    attributes:    true,
    attributeFilter: ['style'],
  });
}

// ── REACT COMPONENT ───────────────────────────────────────────────
const DarkModeInjector = () => {
  const { theme } = useTheme(); // Get theme from context

  useEffect(() => {
    // Apply dark mode based on current theme
    const isDark = theme === 'dark';
    applyDarkMode(isDark);
    startObserver(isDark);
  }, [theme]); // Re-run when theme changes

  return null;
};

export default DarkModeInjector;