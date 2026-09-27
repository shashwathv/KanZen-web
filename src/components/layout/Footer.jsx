import { Link } from "react-router-dom";
import BrandMark from "./BrandMark";

const LINKS = [
  { label: "Tool", to: "/app" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "GitHub", to: "https://github.com/shashwathv/KanZen", external: true },
];

export default function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid var(--border)",
      padding: "2.5rem 2rem",
      marginTop: "4rem",
    }}>
      <div style={{
        maxWidth: 900, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "1rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
          <BrandMark size={24} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.92rem", letterSpacing: "-0.01em" }}>
            Kanzen
          </span>
          <span style={{ color: "var(--text3)", fontSize: "0.8rem" }}>
            — Free forever, open source
          </span>
        </div>

        <div style={{ display: "flex", gap: "1.5rem" }}>
          {LINKS.map(l => (
            l.external
              ? <a key={l.label} href={l.to} target="_blank" rel="noreferrer" className="link-muted" style={{ fontSize: "0.8rem" }}>{l.label}</a>
              : <Link key={l.label} to={l.to} className="link-muted" style={{ fontSize: "0.8rem" }}>{l.label}</Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
