"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "st-shop-theme";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY);
    const preferredTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    const nextTheme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : preferredTheme;

    setTheme(nextTheme);
    applyTheme(nextTheme);
    setMounted(true);
  }, []);

  function handleToggle() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  }

  return (
    <button
      type="button"
      className={`theme-toggle${mounted ? " is-mounted" : ""}`}
      onClick={handleToggle}
      aria-label={theme === "dark" ? "Chuyển sang light mode" : "Chuyển sang dark mode"}
      aria-pressed={theme === "light"}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb" />
      </span>
      <span className="theme-toggle-label">{theme === "dark" ? "Dark mode" : "Light mode"}</span>
    </button>
  );
}
