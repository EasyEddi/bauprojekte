"use client";

import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "bauprojekte-theme";

export function ThemeToggle() {
  function toggleTheme() {
    const root = document.documentElement;
    const nextTheme = root.dataset.theme === "light" ? "dark" : "light";

    root.dataset.theme = nextTheme;

    try {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // The selected theme still applies for the current page if storage is unavailable.
    }
  }

  return (
    <button
      aria-label="Zwischen hellem und dunklem Design wechseln"
      className="theme-toggle"
      onClick={toggleTheme}
      title="Hell/Dunkel wechseln"
      type="button"
    >
      <Sun aria-hidden="true" className="theme-sun" size={18} />
      <Moon aria-hidden="true" className="theme-moon" size={18} />
    </button>
  );
}
