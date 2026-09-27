import { useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";

function CardField({ label, value, onChange, mono, area }) {
  const Tag = area ? "textarea" : "input";
  return (
    <label style={{ display: "block", marginBottom: "0.6rem" }}>
      <span className="field-label">{label}</span>
      <Tag
        className="input"
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={area ? 2 : undefined}
        style={{
          padding: "0.5rem 0.65rem", fontSize: "0.85rem",
          fontFamily: mono ? "var(--font-mono)" : undefined,
          resize: area ? "vertical" : "none",
        }}
      />
    </label>
  );
}

// Boxes are sized for a single character. `card.kanji` is often a full
// jukugo compound (2-4 characters) though, so scale the font down — and let
// the box grow to fit — instead of letting long words wrap into a stack.
const KANJI_FONT_SIZES = ["2.4rem", "2.4rem", "1.85rem", "1.4rem", "1.15rem"];
function kanjiFontSize(text) {
  const len = [...(text || "")].length;
  return KANJI_FONT_SIZES[Math.min(len, KANJI_FONT_SIZES.length - 1)];
}

function CardEditor({ card, onChange, onRemove }) {
  const set = (field) => (value) => onChange({ ...card, [field]: value });

  return (
    <div className="card card-editor-row">
      <div className="card-editor-kanji" style={{ "--kanji-font-size": kanjiFontSize(card.kanji) }}>
        {card.kanji}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <CardField label="Meaning" value={card.meaning} onChange={set("meaning")} />
        <div className="review-fields">
          <CardField label="On-yomi" value={card.on_yomi} onChange={set("on_yomi")} mono />
          <CardField label="Kun-yomi" value={card.kun_yomi} onChange={set("kun_yomi")} mono />
        </div>
        <CardField label="Example" value={card.example} onChange={set("example")} area />
      </div>

      <button
        className="btn-secondary btn-danger card-editor-remove"
        onClick={onRemove}
        title="Remove this card"
        aria-label={`Remove card ${card.kanji}`}
      >
        ✕
      </button>
    </div>
  );
}

export default function ReviewView({ cards, onBuild, onReset, isBuilding, buildError }) {
  const [items, setItems] = useState(() => cards.map((c, i) => ({ ...c, _key: i })));
  const [deckName, setDeckName] = useState("");
  const { user } = useAuth();

  const updateCard = useCallback((key, next) => {
    setItems(prev => prev.map(c => (c._key === key ? { ...next, _key: key } : c)));
  }, []);

  const removeCard = useCallback((key) => {
    setItems(prev => prev.filter(c => c._key !== key));
  }, []);

  const handleSubmit = () => {
    const payload = items.map(({ _key, ...card }) => card);
    onBuild(payload, deckName.trim() || undefined);
  };

  const empty = items.length === 0;

  return (
    <div style={{ animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards" }}>
      <div style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.55rem", fontWeight: 600, letterSpacing: "-0.01em", marginBottom: "0.35rem" }}>
          Review your cards
        </h2>
        <p style={{ color: "var(--text2)", fontSize: "0.85rem" }}>
          {items.length} kanji found. Fix anything that looks off, remove what you don't need, then generate the deck.
        </p>
      </div>

      {user && (
        <label style={{ display: "block", marginBottom: "1.1rem" }}>
          <span className="field-label">Deck name (saved to your dashboard)</span>
          <input
            className="input"
            value={deckName}
            onChange={e => setDeckName(e.target.value)}
            placeholder={`Deck — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
            style={{ padding: "0.6rem 0.75rem", fontSize: "0.9rem", background: "var(--surface)" }}
          />
        </label>
      )}

      {empty ? (
        <div style={{
          textAlign: "center", padding: "2rem",
          border: "1px dashed var(--border-hover)", borderRadius: 10,
          color: "var(--text3)", fontSize: "0.85rem", marginBottom: "1rem",
        }}>
          No cards left. Go back and try another image.
        </div>
      ) : (
        items.map(card => (
          <CardEditor
            key={card._key}
            card={card}
            onChange={(next) => updateCard(card._key, next)}
            onRemove={() => removeCard(card._key)}
          />
        ))
      )}

      {buildError && (
        <p role="alert" style={{
          color: "var(--flame)", fontSize: "0.82rem",
          marginBottom: "0.75rem", textAlign: "center",
        }}>
          {buildError}
        </p>
      )}

      <button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={empty || isBuilding}
        style={{
          display: "block", width: "100%",
          padding: "0.9rem 1.5rem", marginBottom: "0.6rem",
          fontWeight: 800, fontSize: "0.95rem", letterSpacing: "-0.02em",
          ...(empty && { background: "var(--surface3)", color: "var(--text3)", boxShadow: "none" }),
        }}
      >
        {isBuilding ? "Generating deck…" : `Generate deck (${items.length} card${items.length === 1 ? "" : "s"})`}
      </button>

      <button
        className="btn-ghost"
        onClick={onReset}
        disabled={isBuilding}
        style={{ display: "block", width: "100%", padding: "0.75rem", fontSize: "0.85rem" }}
      >
        Start over
      </button>
    </div>
  );
}
