const KANJI_CARDS = [
  { char: "住", on: "ジュウ", kun: "す(む)", meaning: "to live" },
  { char: "正", on: "セイ", kun: "ただ(しい)", meaning: "correct" },
  { char: "年", on: "ネン", kun: "とし", meaning: "year" },
  { char: "道", on: "ドウ", kun: "みち", meaning: "road" },
];

function FloatingCard({ card, style }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border-hover)",
      borderRadius: 6,
      padding: "0.85rem 1rem",
      display: "flex", flexDirection: "column", gap: 3,
      boxShadow: "var(--shadow-card)",
      animation: "float 4.5s ease-in-out infinite",
      ...style,
    }}>
      <span style={{ fontSize: "1.9rem", lineHeight: 1, color: "var(--text1)" }}>
        {card.char}
      </span>
      <span style={{ fontSize: "0.66rem", color: "var(--jade)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
        {card.on} · {card.kun}
      </span>
      <span style={{ fontSize: "0.72rem", color: "var(--text2)" }}>
        {card.meaning}
      </span>
    </div>
  );
}

export default function HeroSection() {
  return (
    <div className="hero-grid">
      <div style={{ animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards" }}>
        <div className="hero-eyebrow">
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--jade)", display: "inline-block" }} />
          <span>KANJI → ANKI IN SECONDS</span>
        </div>

        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2.6rem, 5.2vw, 3.8rem)", fontWeight: 600,
          lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: "1.25rem",
        }}>
          Scan your sheet.<br />
          <span style={{ color: "var(--jade)", fontStyle: "italic" }}>
            Get flashcards.
          </span>
        </h1>

        <p style={{ color: "var(--text2)", fontSize: "1rem", lineHeight: 1.75, maxWidth: 420 }}>
          Drop a photo of any kanji worksheet or textbook page.
          Kanzen reads it with a vision model, builds your cards,
          and exports a ready-to-import Anki deck.
        </p>
      </div>

      <div className="hero-cards" aria-hidden="true">
        {KANJI_CARDS.map((card, i) => (
          <FloatingCard
            key={card.char}
            card={card}
            style={{
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${3.8 + i * 0.4}s`,
              marginTop: i % 2 === 1 ? "1.5rem" : 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
