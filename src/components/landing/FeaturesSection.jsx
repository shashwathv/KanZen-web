const FEATURES = [
  {
    icon: "👁️",
    title: "Reads the page directly",
    desc: "A multimodal vision model looks at your photo and understands it — no brittle character-by-character OCR that breaks on real textbook layouts.",
    tag: "Core tech",
    tagColor: "var(--jade)",
    tagBg: "var(--jade-dim)",
    tagBorder: "var(--jade-border)",
  },
  {
    icon: "✏️",
    title: "Ignores stroke diagrams",
    desc: "Stroke-order guides and practice grids that confuse traditional OCR are understood as diagrams and skipped — only real vocabulary becomes cards.",
    tag: "Smart parsing",
    tagColor: "var(--jade)",
    tagBg: "var(--jade-dim)",
    tagBorder: "var(--jade-border)",
  },
  {
    icon: "⚡",
    title: "One call per page",
    desc: "Every kanji on your image is extracted in a single request — fast, and comfortably within free-tier limits regardless of how many kanji are on the page.",
    tag: "Efficient",
    tagColor: "var(--seal)",
    tagBg: "var(--seal-dim)",
    tagBorder: "var(--seal-border)",
  },
  {
    icon: "🔄",
    title: "Fails safely, always",
    desc: "A blurry photo or a card that can't be parsed won't crash the run — the rest still process, and you see exactly what came through.",
    tag: "Resilient",
    tagColor: "var(--gold)",
    tagBg: "var(--gold-dim)",
    tagBorder: "var(--gold-border)",
  },
  {
    icon: "📱",
    title: "Anki + AnkiDroid native",
    desc: "Exports standard .apkg files. Open it on your phone and AnkiDroid imports automatically — no extra steps.",
    tag: "Compatible",
    tagColor: "var(--seal)",
    tagBg: "var(--seal-dim)",
    tagBorder: "var(--seal-border)",
  },
  {
    icon: "🆓",
    title: "Completely free",
    desc: "Open source. No account required. No usage limits on the tool. Built by a student, for students.",
    tag: "Free forever",
    tagColor: "var(--jade)",
    tagBg: "var(--jade-dim)",
    tagBorder: "var(--jade-border)",
  },
];

export default function FeaturesSection() {
  return (
    <div style={{
      marginTop: "5rem",
      animation: "fadeUp 0.7s 0.2s cubic-bezier(0.16,1,0.3,1) both",
    }}>
      <p className="eyebrow" style={{ marginBottom: "0.6rem" }}>
        Why Kanzen
      </p>
      <h2 style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(1.7rem, 3vw, 2.15rem)", fontWeight: 600,
        letterSpacing: "-0.01em", marginBottom: "2.5rem",
        maxWidth: 500, lineHeight: 1.15,
      }}>
        Built to be reliable,<br />not just impressive
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "1rem",
      }}>
        {FEATURES.map(f => (
          <div key={f.title} className="card raised card-hover" style={{ borderRadius: 10, padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.85rem" }}>
              <span aria-hidden="true" style={{ fontSize: 22 }}>{f.icon}</span>
              <span style={{
                fontSize: "0.65rem", padding: "0.15rem 0.55rem",
                background: f.tagBg, border: `1px solid ${f.tagBorder}`,
                borderRadius: 99, color: f.tagColor, fontWeight: 600,
                letterSpacing: "0.03em",
              }}>
                {f.tag}
              </span>
            </div>
            <p style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.4rem", letterSpacing: "-0.01em" }}>
              {f.title}
            </p>
            <p style={{ fontSize: "0.8rem", color: "var(--text3)", lineHeight: 1.65 }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}