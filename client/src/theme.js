export const THEME_STORAGE_KEY = "civicvoice-theme";

function hasTheme(value) {
  return value === "light" || value === "dark";
}

export function resolveTheme(savedTheme, prefersDark) {
  if (hasTheme(savedTheme)) return savedTheme;
  return prefersDark ? "dark" : "light";
}

export function getInitialTheme() {
  let savedTheme;
  try {
    savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in private browsing contexts.
  }

  return resolveTheme(savedTheme, window.matchMedia?.("(prefers-color-scheme: dark)").matches);
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

export function saveTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The selected theme still applies for this visit when storage is unavailable.
  }
}
