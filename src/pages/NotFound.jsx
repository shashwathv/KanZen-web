import { Link } from "react-router-dom";
import KanjiBox from "../components/ui/KanjiBox";

export default function NotFound() {
  return (
    <div className="page not-found">
      {/* 迷子 (maigo): a lost child. */}
      <KanjiBox size={84} lang="ja" aria-hidden="true">迷子</KanjiBox>
      <h1 className="display">This page doesn't exist</h1>
      <p>The link may be mistyped, or the page may have moved.</p>
      <div className="result-actions">
        <Link to="/app" className="btn btn-ink">Make a deck</Link>
        <Link to="/" className="btn btn-outline">Go to the home page</Link>
      </div>
    </div>
  );
}
