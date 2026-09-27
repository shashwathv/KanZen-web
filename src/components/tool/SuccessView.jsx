import { Link } from "react-router-dom";
import Hanamaru from "../ui/Hanamaru";
import { DownloadIcon } from "../ui/icons";

function summary(stats) {
  const created = stats?.created;
  if (created == null) return "Your cards are ready to download.";
  const made = `Made ${created} card${created === 1 ? "" : "s"}.`;
  const skipped = stats?.skipped ?? 0;
  return skipped > 0 ? `${made} ${skipped} kanji couldn't be turned into cards and were left out.` : made;
}

export default function SuccessView({ stats, downloadUrl, savedToDashboard, onReset }) {
  return (
    <section className="sheet result">
      <Hanamaru draw label="Well done" />
      <h2 className="display">Your deck is ready</h2>
      <p>{summary(stats)}</p>
      {savedToDashboard && (
        <p>It's also saved in <Link to="/dashboard">My decks</Link>, so you can download it again later.</p>
      )}

      <div className="result-actions">
        <a href={downloadUrl} className="btn btn-ink" target="_blank" rel="noreferrer">
          <DownloadIcon /> Download deck
        </a>
        <button className="btn btn-outline" onClick={onReset}>Make another deck</button>
      </div>

      <p className="result-hint">Open the .apkg file with Anki on your computer, or AnkiDroid on your phone.</p>
    </section>
  );
}
