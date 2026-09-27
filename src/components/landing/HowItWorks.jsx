const STEPS = [
  { num: "01", icon: "📷", title: "Snap", desc: "Photograph any kanji study sheet, textbook page, or handout." },
  { num: "02", icon: "👁️", title: "Read", desc: "A vision model reads the whole page at once, ignoring stroke-order diagrams and practice grids." },
  { num: "03", icon: "🎴", title: "Extract", desc: "Every study kanji becomes a card with meaning, readings, and an example sentence." },
  { num: "04", icon: "✏️", title: "Review", desc: "Check the generated cards and fix anything before exporting — you stay in control." },
  { num: "05", icon: "📦", title: "Export", desc: "Download a .apkg file ready to import in Anki or AnkiDroid." },
];

export default function HowItWorks() {
  return (
    <div style={{
      marginTop: "4rem", paddingTop: "3rem",
      borderTop: "1px solid var(--border)",
      animation: "fadeUp 0.7s 0.3s cubic-bezier(0.16,1,0.3,1) both",
    }}>
      <p className="eyebrow" style={{ marginBottom: "2rem" }}>
        How it works
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {STEPS.map((step, i) => (
          <div key={step.num} style={{
            display: "flex", gap: "1rem",
            paddingBottom: i < STEPS.length - 1 ? "1.5rem" : 0,
          }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{
                position: "relative", width: 36, height: 36, borderRadius: 8,
                background: "var(--surface2)", border: "1px solid var(--border-hover)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, flexShrink: 0,
              }}>
                {step.icon}
                <span style={{
                  position: "absolute", top: -6, right: -8,
                  fontSize: "0.58rem", color: "var(--text3)", fontFamily: "var(--font-mono)",
                  background: "var(--bg)", padding: "0 2px",
                }}>
                  {step.num}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: 1, flex: 1, background: "var(--border)", marginTop: 4, minHeight: 20 }} />
              )}
            </div>
            <div style={{ paddingTop: "0.4rem", paddingBottom: i < STEPS.length - 1 ? "0.25rem" : 0 }}>
              <p style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: "0.2rem", letterSpacing: "-0.01em" }}>
                {step.title}
              </p>
              <p style={{ fontSize: "0.8rem", color: "var(--text3)", lineHeight: 1.6 }}>
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
