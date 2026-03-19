"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type ThemeContextType = {
  theme: string;
  setTheme: (theme: string) => void;
  accent: string;
  setAccent: (color: string) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
  accent: "#4a90e2",
  setAccent: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState("dark");
  const [accent, setAccent] = useState("#4a90e2");

  useEffect(() => {
    // Load from localStorage if available
    const savedTheme = localStorage.getItem("appion_theme");
    const savedAccent = localStorage.getItem("appion_accent");
    if (savedTheme) setTheme(savedTheme);
    if (savedAccent) setAccent(savedAccent);
  }, []);

  useEffect(() => {
    // Apply theme
    if (theme === "light") {
      document.documentElement.style.setProperty("--bg-color", "#f0f2f5");
      document.documentElement.style.setProperty("--bg-gradient", "#f0f2f5");
      document.documentElement.style.setProperty("--text-primary", "#111827");
      document.documentElement.style.setProperty("--text-secondary", "#4b5563");
      document.documentElement.style.setProperty("--glass-bg", "rgba(255, 255, 255, 0.55)");
      document.documentElement.style.setProperty("--glass-border", "rgba(0, 0, 0, 0.07)");
      document.documentElement.style.setProperty("--nav-bg", "rgba(255, 255, 255, 0.65)");
    } else {
      document.documentElement.style.setProperty("--bg-color", "#000000");
      document.documentElement.style.setProperty("--bg-gradient", "#000000");
      document.documentElement.style.setProperty("--text-primary", "#ffffff");
      document.documentElement.style.setProperty("--text-secondary", "#a0aab8");
      document.documentElement.style.setProperty("--glass-bg", "rgba(255, 255, 255, 0.04)");
      document.documentElement.style.setProperty("--glass-border", "rgba(255, 255, 255, 0.08)");
      document.documentElement.style.setProperty("--nav-bg", "rgba(0, 0, 0, 0.55)");
    }

    // Apply accent — update ALL accent variables
    document.documentElement.style.setProperty("--accent-blue", accent);
    document.documentElement.style.setProperty("--accent-purple", accent);
    document.documentElement.style.setProperty("--accent-gradient", `linear-gradient(135deg, ${accent} 0%, ${accent}bb 50%, ${accent}88 100%)`);
    document.documentElement.style.setProperty("--card-active-bg", `${accent}22`);
    document.documentElement.style.setProperty("--card-active-border", `${accent}55`);

    // Save
    localStorage.setItem("appion_theme", theme);
    localStorage.setItem("appion_accent", accent);
  }, [theme, accent]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
