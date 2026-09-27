export default function ErrorView({ message, onReset }) {
  return (
    <div role="alert" style={{
      animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
      background: "var(--flame-dim)",
      border: "1px solid var(--flame-border)",
      borderRadius: 12, padding: "2rem", textAlign: "center",
    }}>
      <div aria-hidden="true" style={{
        width: 48, height: 48, borderRadius: 10,
        background: "var(--flame-dim)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, margin: "0 auto 1rem",
        border: "1px solid var(--flame-border)",
      }}>
        ✕
      </div>
      <h3 style={{
        fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.2rem",
        marginBottom: "0.4rem", letterSpacing: "-0.01em",
      }}>
        Processing failed
      </h3>
      <p style={{
        color: "var(--text2)", fontSize: "0.83rem",
        maxWidth: 320, margin: "0 auto 1.5rem",
      }}>
        {message || "Something went wrong. Please try again with a clearer image."}
      </p>
      <button
        className="btn-primary"
        onClick={onReset}
        style={{
          background: "var(--flame)", color: "#fff", boxShadow: "none",
          padding: "0.7rem 1.75rem", borderRadius: 7, fontSize: "0.88rem",
        }}
      >
        Try again
      </button>
    </div>
  );
}
