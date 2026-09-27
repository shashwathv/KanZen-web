export default function SuccessView({ stats, downloadUrl, savedToDashboard, onReset }) {
  return (
    <div style={{ animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards" }}>
      <div style={{
        background: "var(--jade-dim)",
        border: "1px solid var(--jade-border)",
        borderRadius: 12, padding: "2rem",
        marginBottom: "1rem",
        display: "flex", alignItems: "center", gap: "1rem",
      }}>
        <div aria-hidden="true" style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "var(--jade)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, fontWeight: 900, color: "#0B0A08", flexShrink: 0,
        }}>
          ✓
        </div>
        <div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.15rem", marginBottom: "0.15rem", letterSpacing: "-0.01em" }}>
            Deck generated
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--text2)" }}>
            Your Anki flashcard deck is ready to import
          </p>
        </div>
      </div>

      {savedToDashboard && (
        <p style={{
          fontSize: "0.78rem", color: "var(--jade)", textAlign: "center",
          marginBottom: "1rem", fontFamily: "var(--font-mono)",
        }}>
          ✓ Saved to your dashboard
        </p>
      )}

      <div className="success-stats">
        {[
          { label: "Created", value: stats?.created ?? "—", color: "var(--jade)" },
          { label: "Skipped", value: stats?.skipped ?? "—", color: "var(--text3)" },
          { label: "Processed", value: stats?.total_processed ?? "—", color: "var(--gold)" },
        ].map(s => (
          <div key={s.label} style={{
            background: "var(--surface2)", borderRadius: 8,
            padding: "1rem 0.85rem", border: "1px solid var(--border)",
            textAlign: "center",
          }}>
            <div style={{
              fontSize: "1.9rem", fontWeight: 700, color: s.color,
              lineHeight: 1, marginBottom: "0.3rem", letterSpacing: "-0.02em",
              fontFamily: "var(--font-mono)",
            }}>
              {s.value}
            </div>
            <div style={{
              fontSize: "0.68rem", color: "var(--text3)",
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <a
        href={downloadUrl}
        target="_blank"
        rel="noreferrer"
        className="btn-primary"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
          padding: "0.9rem 1.5rem", marginBottom: "0.6rem",
          fontWeight: 800, fontSize: "0.95rem", letterSpacing: "-0.02em",
        }}
      >
        <span aria-hidden="true">↓</span> Download .apkg deck
      </a>

      <button
        className="btn-ghost"
        onClick={onReset}
        style={{ display: "block", width: "100%", padding: "0.75rem", fontSize: "0.85rem" }}
      >
        Process another image
      </button>

      <p style={{
        marginTop: "0.85rem", textAlign: "center",
        fontSize: "0.72rem", color: "var(--text3)",
        fontFamily: "var(--font-mono)",
      }}>
        Open .apkg in Anki Desktop or AnkiDroid to import
      </p>
    </div>
  );
}
