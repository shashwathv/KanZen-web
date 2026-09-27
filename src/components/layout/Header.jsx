import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import BrandMark from "./BrandMark";
import { CloseIcon, MenuIcon, MoonIcon, SunIcon } from "../ui/icons";

const NAV_LINKS = [
  { label: "Make a deck", to: "/app" },
  { label: "My decks", to: "/dashboard" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
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
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header${scrolled || menuOpen ? " scrolled" : ""}`}>
      <div className="page site-header-inner">
        <Link to="/" className="brand">
          <BrandMark size={30} />
          Kanzen
        </Link>

        <nav className="site-nav" aria-label="Main">
          {NAV_LINKS.map(link => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          {user ? (
            <div className="header-signin">
              <span className="user-email" title={user.email}>{user.email}</span>
              <button className="btn btn-plain btn-sm" onClick={handleSignOut}>Sign out</button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-outline btn-sm header-signin">Sign in</Link>
          )}

          <button
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>

          <button
            className="icon-btn menu-btn"
            onClick={() => setMenuOpenOn(menuOpen ? null : pathname)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" className="mobile-menu" aria-label="Main">
          {NAV_LINKS.map(link => (
            <NavLink key={link.to} to={link.to}>{link.label}</NavLink>
          ))}
          {user ? (
            <>
              <span className="mobile-email">{user.email}</span>
              <button onClick={handleSignOut}>Sign out</button>
            </>
          ) : (
            <Link to="/login">Sign in</Link>
          )}
        </nav>
      )}
    </header>
  );
}
