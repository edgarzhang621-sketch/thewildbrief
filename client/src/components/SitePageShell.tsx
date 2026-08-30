import type { ReactNode } from "react";
import { Link } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";

interface SitePageShellProps {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}

export default function SitePageShell({ eyebrow, title, intro, children }: SitePageShellProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="canopy-page">
      <div className="canopy-shell">
        <header className="site-header">
          <Link href="/" className="brand-link" aria-label="The Wild Brief home">
            <img className="brand-logo" src="/manus-storage/the-wild-brief-logo_f905fbfb.png" alt="The Wild Brief Environmental Intelligence" />
          </Link>
          <div className="header-actions">
            <nav className="page-nav" aria-label="Main navigation">
              <Link href="/">Home</Link>
              <Link href="/about">About</Link>
            </nav>
            <span className="issue-chip">A weekly briefing</span>
            <button className="theme-button" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
              <span className="theme-icon" aria-hidden="true">{theme === "dark" ? "☀" : "◐"}</span>
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </header>

        <main className="inner-page">
          <div className="inner-page-heading">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="inner-page-title">{title}</h1>
            <p className="inner-page-intro">{intro}</p>
          </div>
          {children}
        </main>

        <footer className="site-footer">
          <Link href="/" className="footer-home">← Back to The Wild Brief</Link>
          <a className="footer-contact" href="mailto:thewildbriefweekly@gmail.com">Contact: thewildbriefweekly@gmail.com</a>
          <span>© 2026 The Wild Brief</span>
        </footer>
      </div>
    </div>
  );
}
