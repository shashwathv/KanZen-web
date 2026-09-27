import { Link } from "react-router-dom";
import FlashcardDemo from "../components/landing/FlashcardDemo";
import HowItWorks from "../components/landing/HowItWorks";

const FACTS = [
  {
    term: "Stroke-order diagrams stay out of your deck",
    detail: "Stroke-order guides and practice grids are recognised and skipped, so only the kanji you're studying become cards.",
  },
  {
    term: "Readings are checked, not guessed",
    detail: "On-yomi and kun-yomi are cross-checked against KANJIDIC2, the standard open kanji dictionary.",
  },
  {
    term: "Several pages, one deck",
    detail: "Photograph a whole chapter's worth of pages and they're combined into a single deck.",
  },
  {
    term: "Free, with no account needed",
    detail: "Sign in only if you want Kanzen to keep a list of the decks you've made so you can download them again later.",
  },
];

export default function Landing() {
  return (
    <>
      <section className="page hero">
        <div>
          <h1 className="display">Turn kanji worksheets into Anki cards.</h1>
          <p className="lede">
            Take a photo of a textbook page or drill sheet. Kanzen finds every kanji on it,
            writes the readings and an example sentence, and gives you a deck ready to import.
          </p>
          <div className="hero-actions">
            <Link to="/app" className="btn btn-ink">Make a deck</Link>
            <a href="#how-it-works" className="btn btn-plain">How it works</a>
          </div>
          <p className="hero-note">Free, and no account needed.</p>
        </div>
        <FlashcardDemo />
      </section>

      <HowItWorks />

      <section className="page section facts">
        <h2 className="display section-title">Good to know</h2>
        <dl>
          {FACTS.map(fact => (
            <div key={fact.term}>
              <dt>{fact.term}</dt>
              <dd>{fact.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="page">
        <div className="closing sheet">
          <div>
            <h2 className="display">Got a worksheet nearby?</h2>
            <p>A page of kanji becomes a deck in about a minute.</p>
          </div>
          <Link to="/app" className="btn btn-ink">Make a deck</Link>
        </div>
      </section>
    </>
  );
}
