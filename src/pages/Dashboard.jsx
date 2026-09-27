import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase, getAccessToken } from "../lib/supabase";
import { readJson, apiErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../constants";
import KanjiBox from "../components/ui/KanjiBox";
import { CloseIcon, DownloadIcon } from "../components/ui/icons";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function DeckCard({ deck, onRemove, onDownload, isBusy }) {
  // Deleting is permanent, so the ✕ only arms it; a second, explicit click confirms.
  const [confirming, setConfirming] = useState(false);

  return (
    <li className="deck">
      <p className="deck-name-text">{deck.name}</p>
      <p className="deck-meta">
        {deck.card_count} card{deck.card_count === 1 ? "" : "s"}, made {formatDate(deck.created_at)}
      </p>

      {confirming ? (
        <div className="deck-confirm">
          <p>Delete this deck? This can't be undone.</p>
          <div>
            <button className="btn btn-red btn-sm" onClick={onRemove} disabled={isBusy}>
              {isBusy ? "Deleting…" : "Delete deck"}
            </button>
            <button className="btn btn-plain btn-sm" onClick={() => setConfirming(false)} disabled={isBusy}>Keep it</button>
          </div>
        </div>
      ) : (
        <div className="deck-actions">
          <button className="btn btn-outline btn-sm" onClick={onDownload} disabled={isBusy}>
            <DownloadIcon /> {isBusy ? "Getting link…" : "Download"}
          </button>
          <button
            className="icon-btn danger"
            onClick={() => setConfirming(true)}
            disabled={isBusy}
            title="Delete deck"
            aria-label={`Delete deck ${deck.name}`}
            style={{ marginLeft: "auto" }}
          >
            <CloseIcon />
          </button>
        </div>
      )}
    </li>
  );
}

export default function Dashboard() {
  // Decks are tagged with the user they were fetched for, so signing out or
  // switching accounts shows the right state immediately — no reset effect.
  const [loaded, setLoaded] = useState({ userId: null, decks: [] });
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const decksLoading = userId !== null && loaded.userId !== userId;
  const decks = userId !== null && loaded.userId === userId ? loaded.decks : [];

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    supabase
      .from("decks")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) setError(fetchError.message);
        setLoaded({ userId, decks: fetchError ? [] : data || [] });
      });
    return () => { cancelled = true; };
  }, [userId]);

  const authedFetch = useCallback(async (path, options = {}) => {
    const token = await getAccessToken();
    if (!token) throw new Error("Your session has expired. Sign in again to manage your decks.");
    return fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });
  }, []);

  const handleRemove = useCallback(async (id) => {
    setBusyId(id);
    setError(null);
    try {
      const res = await authedFetch(`/decks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(apiErrorMessage(await readJson(res), "That deck couldn't be deleted. Try again in a moment."));
      setLoaded(prev => ({ ...prev, decks: prev.decks.filter(d => d.id !== id) }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }, [authedFetch]);

  const handleDownload = useCallback(async (id) => {
    // Open the tab now, while the click still counts as a user gesture —
    // Safari blocks window.open() once it happens after an await.
    const win = window.open("", "_blank");
    if (win) win.opener = null;
    setBusyId(id);
    setError(null);
    try {
      const res = await authedFetch(`/decks/${id}/download`);
      const data = await readJson(res);
      if (!res.ok || !data.download_url) {
        throw new Error(apiErrorMessage(data, "The download link couldn't be created. Try again in a moment."));
      }
      if (win) win.location.href = data.download_url;
      else window.location.href = data.download_url;
    } catch (err) {
      win?.close();
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }, [authedFetch]);

  const totalCards = decks.reduce((sum, d) => sum + d.card_count, 0);
  const loading = authLoading || decksLoading;

  let summary = " "; // hold the line's height while loading
  if (!loading && !user) summary = "Sign in to keep every deck you make in one place.";
  else if (!loading && decks.length > 0) summary = `${decks.length} deck${decks.length === 1 ? "" : "s"}, ${totalCards} cards in total.`;
  else if (!loading) summary = "Decks you make while signed in will show up here.";

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="display">My decks</h1>
          <p>{summary}</p>
        </div>
        <Link to="/app" className="btn btn-ink">Make a deck</Link>
      </div>

      {error && <p className="notice error" role="alert" style={{ marginBottom: "1.5rem" }}>{error}</p>}

      {loading ? (
        <p className="muted">Loading your decks…</p>
      ) : !user ? (
        <section className="sheet empty-sheet">
          <KanjiBox size={56} aria-hidden="true">箱</KanjiBox>
          <h2 className="display" style={{ marginTop: "1rem" }}>Keep your decks</h2>
          <p>
            You can make decks without an account. Sign in and Kanzen will keep a list of
            everything you've made, so you can download any deck again later.
          </p>
          <Link to="/login" className="btn btn-ink">Sign in</Link>
        </section>
      ) : decks.length === 0 ? (
        <section className="sheet empty-sheet">
          <KanjiBox size={56} aria-hidden="true">空</KanjiBox>
          <h2 className="display" style={{ marginTop: "1rem" }}>No decks yet</h2>
          <p>Photograph a worksheet and your first deck will be saved here.</p>
          <Link to="/app" className="btn btn-ink">Make your first deck</Link>
        </section>
      ) : (
        <ul className="decks" aria-label="Your decks">
          {decks.map(deck => (
            <DeckCard
              key={deck.id}
              deck={deck}
              isBusy={busyId === deck.id}
              onRemove={() => handleRemove(deck.id)}
              onDownload={() => handleDownload(deck.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
