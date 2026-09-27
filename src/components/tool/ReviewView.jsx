import { useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import KanjiBox from "../ui/KanjiBox";
import { CloseIcon } from "../ui/icons";

// Squares shrink as words get longer, so a four-character compound still fits.
function boxSize(text) {
  const len = [...(text || "")].length;
  return len <= 2 ? 64 : len === 3 ? 52 : 44;
}

function CardField({ id, label, labelClass = "", value, onChange, area, lang }) {
  const Tag = area ? "textarea" : "input";
  return (
    <div className="field">
      <label htmlFor={id} className={`field-label ${labelClass}`.trim()}>{label}</label>
      <Tag id={id} className="input" value={value ?? ""} onChange={e => onChange(e.target.value)} rows={area ? 2 : undefined} lang={lang} />
    </div>
  );
}

function CardEditor({ card, onChange, onRemove }) {
  const set = (field) => (value) => onChange({ ...card, [field]: value });
  const id = (field) => `card-${card._key}-${field}`;

  return (
    <li className="card-editor sheet">
      <KanjiBox size={boxSize(card.kanji)} lang="ja">{card.kanji}</KanjiBox>
      <div className="card-fields">
        <CardField id={id("meaning")} label="Meaning" value={card.meaning} onChange={set("meaning")} />
        <div className="reading-fields">
          <CardField id={id("on")} label="On-yomi" labelClass="on" value={card.on_yomi} onChange={set("on_yomi")} lang="ja" />
          <CardField id={id("kun")} label="Kun-yomi" labelClass="kun" value={card.kun_yomi} onChange={set("kun_yomi")} lang="ja" />
        </div>
        <CardField id={id("example")} label="Example sentence" value={card.example} onChange={set("example")} area lang="ja" />
      </div>
      <button className="icon-btn danger" onClick={onRemove} aria-label={`Remove the card for ${card.kanji}`} title="Remove card">
        <CloseIcon />
      </button>
    </li>
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

  const count = items.length;
  const defaultName = `Deck from ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <div>
      <div className="review-head">
        <h2 className="display">Check your cards</h2>
        <p>
          {cards.length} kanji found. Fix anything that looks wrong and remove the cards you don't want,
          then make the deck.
        </p>
      </div>

      {user && (
        <div className="field deck-name">
          <label htmlFor="deck-name" className="field-label">Deck name</label>
          <input id="deck-name" className="input" value={deckName} onChange={e => setDeckName(e.target.value)} placeholder={defaultName} />
        </div>
      )}

      {count === 0 ? (
        <div className="card-empty">
          <p>You've removed every card. Start over to try different pages.</p>
        </div>
      ) : (
        <ol className="card-list" aria-label="Cards">
          {items.map(card => (
            <CardEditor
              key={card._key}
              card={card}
              onChange={(next) => updateCard(card._key, next)}
              onRemove={() => removeCard(card._key)}
            />
          ))}
        </ol>
      )}

      {buildError && <p className="notice error review-error" role="alert">{buildError}</p>}

      <div className="review-bar">
        <button className="btn btn-plain" onClick={onReset} disabled={isBuilding}>Start over</button>
        <button className="btn btn-ink" onClick={handleSubmit} disabled={count === 0 || isBuilding}>
          {isBuilding ? "Making your deck…" : `Make deck with ${count} card${count === 1 ? "" : "s"}`}
        </button>
      </div>
    </div>
  );
}
