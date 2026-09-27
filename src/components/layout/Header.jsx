import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_URL } from "../../constants";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import BrandMark from "./BrandMark";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Tool", to: "/app" },
  { label: "Dashboard", to: "/dashboard" },
];

const STATUS = {
  online:   { color: "#00C896", label: "online" },
  offline:  { color: "#FF4D00", label: "offline" },
  degraded: { color: "#FFB800", label: "degraded" },
  checking: { color: "#A1A1AA", label: "..." },
};

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [apiStatus, setApiStatus] = useState("checking");
  const { pathname } = useLocation();
  // The menu remembers which page it was opened on, so navigating anywhere
  // closes it without needing an effect to reset it.
  const [menuOpenOn, setMenuOpenOn] = useState(null);
  const menuOpen = menuOpenOn === pathname;
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API_URL}/health`, {
          signal: AbortSignal.timeout(4000),
        });
        setApiStatus(res.ok ? "online" : "degraded");
      } catch {
        setApiStatus("offline");
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const s = STATUS[apiStatus];

  return (
    <header className={`header-bar${scrolled ? " scrolled" : ""}`}>
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.65rem", textDecoration: "none", color: "inherit" }}>
          <BrandMark size={30} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.12rem", letterSpacing: "-0.01em", color: "var(--text1)" }}>
            Kanzen
          </span>
          <span style={{
            fontSize: "0.6rem", padding: "0.12rem 0.45rem",
            background: "var(--jade-dim)", border: "1px solid var(--jade-border)",
            borderRadius: 99, color: "var(--jade)", fontWeight: 600, letterSpacing: "0.06em",
            fontFamily: "var(--font-mono)",
          }}>
            BETA
          </span>
        </Link>

        <nav className="header-nav">
          {NAV_LINKS.map(link => (
            <Link key={link.to} to={link.to} className={`nav-link${pathname === link.to ? " active" : ""}`}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div className="header-status" title={`API ${s.label}`}>
          <span style={{
            display: "inline-block", width: 6, height: 6, borderRadius: "50%",
            background: s.color,
            animation: apiStatus === "online" ? "pulse 2s ease-in-out infinite" : "none",
            transition: "background 0.3s",
          }} />
          <span style={{ fontSize: "0.7rem", color: "var(--text2)", fontFamily: "var(--font-mono)" }}>
            {s.label}
          </span>
        </div>

        {user ? (
          <div className="header-signin">
            <span
              title={user.email}
              style={{
                fontSize: "0.78rem", color: "var(--text2)", fontFamily: "var(--font-mono)",
                maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >
              {user.email}
            </span>
            <button className="btn-secondary btn-danger" onClick={handleSignOut} style={{ fontSize: "0.82rem", padding: "0.35rem 0.85rem" }}>
              Sign out
            </button>
          </div>
        ) : (
          <Link className="header-signin btn-secondary" to="/login" style={{ fontSize: "0.82rem", padding: "0.35rem 0.85rem" }}>
            Sign in
          </Link>
        )}

        <button
          className="btn-secondary"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          style={{
            width: 34, height: 34, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, transition: "all 0.2s",
          }}
        >
          {theme === "dark" ? "☀" : "◑"}
        </button>

        <button
          className="btn-secondary header-menu-btn"
          onClick={() => setMenuOpenOn(menuOpen ? null : pathname)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          style={{
            width: 34, height: 34, borderRadius: 8,
            background: menuOpen ? "var(--surface3)" : undefined,
            alignItems: "center", justifyContent: "center",
            fontSize: 15, color: "var(--text1)",
          }}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="header-mobile-menu">
          {NAV_LINKS.map(link => (
            <Link key={link.to} to={link.to} className={`mobile-nav-link${pathname === link.to ? " active" : ""}`}>
              {link.label}
            </Link>
          ))}
          <div style={{ height: 1, background: "var(--border)", margin: "0.4rem 0" }} />
          {user ? (
            <>
              <span style={{ padding: "0.4rem 0.5rem", fontSize: "0.78rem", color: "var(--text3)", fontFamily: "var(--font-mono)" }}>
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                style={{
                  textAlign: "left", padding: "0.7rem 0.5rem",
                  fontSize: "0.95rem", color: "var(--flame)", borderRadius: 8,
                  background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)",
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="mobile-nav-link" style={{ color: "var(--text2)" }}>
              Sign in
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
