import { useEffect, useRef, useState } from "react";
import KanjiBox from "../ui/KanjiBox";
import Hanamaru from "../ui/Hanamaru";

// Sample cards in the same shape Kanzen produces, so the hero shows the
// actual output rather than describing it.
const DEMO_CARDS = [
  { kanji: "住", meaning: "to live, to reside", on: "ジュウ", kun: "す(む)", example: "東京に住んでいます。", translation: "I live in Tokyo." },
  { kanji: "読", meaning: "to read", on: "ドク、トク", kun: "よ(む)", example: "毎晩、本を読みます。", translation: "I read a book every night." },
  { kanji: "海", meaning: "sea, ocean", on: "カイ", kun: "うみ", example: "夏は海で泳ぎたい。", translation: "I want to swim in the sea this summer." },
  { kanji: "雨", meaning: "rain", on: "ウ", kun: "あめ、あま", example: "朝から雨が降っている。", translation: "It has been raining since morning." },
];

export default function FlashcardDemo() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [praised, setPraised] = useState(false);
  const advanceTimer = useRef(null);
  const card = DEMO_CARDS[index];

  useEffect(() => () => clearTimeout(advanceTimer.current), []);

  const nextCard = () => {
    setIndex(i => (i + 1) % DEMO_CARDS.length);
    setFlipped(false);
    setPraised(false);
  };

  const grade = (good) => {
    if (praised) return;
    if (!good) return nextCard();
    // Let the hanamaru finish drawing before dealing the next card.
    setPraised(true);
    advanceTimer.current = setTimeout(nextCard, 1150);
  };

  return (
    <figure className="demo">
      <div className="demo-desk">
        {/* Keyed by card so each new card is dealt in fresh, face up. */}
        <div key={index} className={`flashcard${flipped ? " flipped" : ""}`}>
          <div className="flashcard-inner">
            <div className="face front" aria-hidden={flipped}>
              <KanjiBox size={136}>{card.kanji}</KanjiBox>
              <span className="visually-hidden">Front of card: {card.kanji}</span>
            </div>
            <div className="face back" aria-hidden={!flipped}>
              <div className="back-head">
                <KanjiBox size={52}>{card.kanji}</KanjiBox>
                <p className="back-meaning">{card.meaning}</p>
              </div>
              <dl className="readings">
                <div><dt className="on">On</dt><dd lang="ja">{card.on}</dd></div>
                <div><dt className="kun">Kun</dt><dd lang="ja">{card.kun}</dd></div>
              </dl>
              <p className="back-example" lang="ja">{card.example}</p>
              <p className="back-translation">{card.translation}</p>
            </div>
          </div>
          {praised && <Hanamaru draw className="flashcard-hanamaru" />}
        </div>
      </div>

      <div className="demo-controls">
        {flipped ? (
          <>
            <button className="btn btn-outline" onClick={() => grade(false)} disabled={praised}>Again</button>
            <button className="btn btn-ink" onClick={() => grade(true)} disabled={praised}>Good</button>
          </>
        ) : (
          <button className="btn btn-ink" onClick={() => setFlipped(true)}>Show answer</button>
        )}
      </div>
      <figcaption className="demo-caption">A card from a Kanzen deck, as it looks in Anki. Give it a try.</figcaption>
    </figure>
  );
}
