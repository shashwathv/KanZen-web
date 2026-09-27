import KanjiBox from "../ui/KanjiBox";

// Each step is shown as a small illustration of what actually happens, rather
// than described: the photo you take, the card you check, the deck in Anki.

function PhotoArt() {
  return (
    <div className="art-photo">
      <div className="art-sheet">
        <p className="art-sheet-title" lang="ja">かん字ドリル 3</p>
        {["住", "読", "海"].map(ch => (
          <div key={ch} className="art-row">
            {/* One model character, then faint copies to trace — like a real drill sheet. */}
            <KanjiBox size={28}>{ch.repeat(4)}</KanjiBox>
            <span className="art-lines"><i /><i /></span>
          </div>
        ))}
      </div>
      <span className="viewfinder tl" /><span className="viewfinder tr" />
      <span className="viewfinder bl" /><span className="viewfinder br" />
    </div>
  );
}

function CheckArt() {
  return (
    <div className="art-card">
      <div className="art-card-head">
        <KanjiBox size={42}>住</KanjiBox>
        <p className="art-meaning">
          <s>to life</s>
          <span className="art-fix">to live</span>
        </p>
      </div>
      <dl className="readings">
        <div><dt className="on">On</dt><dd lang="ja">ジュウ</dd></div>
        <div><dt className="kun">Kun</dt><dd lang="ja">す(む)</dd></div>
      </dl>
    </div>
  );
}

// Anki's deck list, with its own colours for new (blue), learning (red) and due (green) cards.
const DECKS = [
  { name: "Chapter 3 kanji", counts: [12, 0, 0], fresh: true },
  { name: "Chapter 2 kanji", counts: [0, 4, 21] },
  { name: "Chapter 1 kanji", counts: [0, 0, 9] },
];

function AnkiArt() {
  return (
    <div className="art-anki">
      <div className="art-anki-row art-anki-head">
        <span>Deck</span><span>New</span><span>Learn</span><span>Due</span>
      </div>
      {DECKS.map(deck => (
        <div key={deck.name} className={`art-anki-row${deck.fresh ? " fresh" : ""}`}>
          <span className="art-anki-name">{deck.name}</span>
          {deck.counts.map((n, i) => (
            <span key={i} className={n === 0 ? "zero" : ["new", "learn", "due"][i]}>{n}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

const STEPS = [
  {
    art: <PhotoArt />,
    title: "Photograph the page",
    body: "Any worksheet, drill book or textbook page. Stroke-order diagrams are skipped, and up to five pages go into one deck.",
  },
  {
    art: <CheckArt />,
    title: "Check the cards",
    body: "Every kanji gets a meaning, on-yomi, kun-yomi and an example sentence. Correct anything that's off before you export.",
  },
  {
    art: <AnkiArt />,
    title: "Study in Anki",
    body: "Download one .apkg file and open it in Anki or AnkiDroid. The cards arrive as their own deck, ready to review.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="page section">
      <h2 className="display section-title">How it works</h2>
      <p className="section-lede">From a page in your textbook to cards in Anki.</p>
      <ol className="how">
        {STEPS.map((step, i) => (
          <li key={step.title} className="how-step">
            <div className="how-art" aria-hidden="true">{step.art}</div>
            <h3>
              <span className="step-dot" aria-hidden="true">{i + 1}</span>
              {step.title}
            </h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
