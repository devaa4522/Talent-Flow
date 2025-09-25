import React from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = React.useState(() =>
    document.documentElement.classList.contains("dark")
  );

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    try { localStorage.setItem("tf_theme", isDark ? "dark" : "light"); } catch {}
  }, [isDark]);

  React.useEffect(() => {
    const saved = localStorage.getItem("tf_theme");
    if (saved) setIsDark(saved === "dark");
  }, []);

  return (
    <button
      className="btn ghost"
      title="Toggle theme"
      onClick={() => setIsDark((v) => !v)}
      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
    >
      {isDark ? (
        /* Sun icon (inline SVG, no lucide-react needed) */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 18a6 6 0 100-12 6 6 0 000 12z" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      ) : (
        /* Moon icon */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )}
      <span style={{ fontSize: 13 }}>{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
