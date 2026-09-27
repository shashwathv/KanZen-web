import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="page-main" style={{
      maxWidth: 480, paddingTop: "6rem", paddingBottom: "6rem", textAlign: "center",
      animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
    }}>
      <p className="eyebrow" style={{ marginBottom: "0.75rem" }}>404</p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 600, letterSpacing: "-0.01em", marginBottom: "0.6rem" }}>
        Page not found
      </h1>
      <p style={{ color: "var(--text2)", fontSize: "0.9rem", marginBottom: "2rem" }}>
        That page doesn't exist — it may have moved, or the link is mistyped.
      </p>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
        <Link to="/app" className="btn-primary" style={{ padding: "0.7rem 1.5rem", fontSize: "0.9rem" }}>
          Open the tool
        </Link>
        <Link to="/" className="btn-secondary" style={{ padding: "0.7rem 1.5rem", borderRadius: 8, fontSize: "0.9rem", color: "var(--text1)" }}>
          Home
        </Link>
      </div>
    </main>
  );
}
