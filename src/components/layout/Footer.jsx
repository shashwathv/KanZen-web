import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="page site-footer-inner">
        <p>Kanzen is free and open source.</p>
        <nav aria-label="Footer">
          <Link to="/app">Make a deck</Link>
          <Link to="/dashboard">My decks</Link>
          <a href="https://github.com/shashwathv/KanZen" target="_blank" rel="noreferrer">Source on GitHub</a>
        </nav>
      </div>
    </footer>
  );
}
