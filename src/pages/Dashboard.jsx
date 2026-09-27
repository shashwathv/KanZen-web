import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/layout/Footer";
import { supabase, getAccessToken } from "../lib/supabase";
import { readJson, apiErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../constants";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function DeckCard({ deck, onRemove, onDownload, isBusy }) {
  // Deleting is permanent, so the ✕ only arms it; a second, explicit click confirms.
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="card raised card-hover" style={{ borderRadius: 10, padding: "1.25rem" }}>
      <div style={{
        height: 84, position: "relative", background: "var(--surface2)",
        borderRadius: 7, marginBottom: "1rem", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "1px solid var(--border)",
      }}>
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "var(--border-hover)" }} />
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "var(--border-hover)" }} />
        <span aria-hidden="true" style={{ position: "relative", fontSize: 26, color: "var(--text2)", letterSpacing: "0.1em" }}>
          漢字
        </span>
      </div>
      <p style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: "0.3rem", letterSpacing: "-0.01em" }}>
        {deck.name}
      </p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontSize: "0.72rem", color: "var(--jade)",
          background: "var(--jade-dim)", border: "1px solid var(--jade-border)",
          borderRadius: 99, padding: "0.15rem 0.5rem",
          fontWeight: 600,
        }}>
          {deck.card_count} cards
        </span>
        <span style={{ fontSize: "0.72rem", color: "var(--text3)", fontFamily: "var(--font-mono)" }}>
          {formatDate(deck.created_at)}
        </span>
      </div>
      <div style={{
        marginTop: "0.85rem", paddingTop: "0.85rem",
        borderTop: "1px solid var(--border)",
        display: "flex", gap: "0.5rem",
      }}>
        {confirming ? (
          <>
            <button
              className="btn-primary"
              onClick={onRemove}
              disabled={isBusy}
              style={{
                flex: 1, padding: "0.45rem", borderRadius: 6, fontSize: "0.75rem", fontWeight: 600,
                background: "var(--flame)", color: "#fff", boxShadow: "none",
              }}
            >
              {isBusy ? "Deleting…" : "Delete deck"}
            </button>
            <button
              className="btn-secondary"
              onClick={() => setConfirming(false)}
              disabled={isBusy}
              style={{ padding: "0.45rem 0.75rem", borderRadius: 6, fontSize: "0.75rem" }}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              className="btn-primary"
              onClick={onDownload}
              disabled={isBusy}
              style={{ flex: 1, padding: "0.45rem", borderRadius: 6, fontSize: "0.75rem", fontWeight: 600, boxShadow: "none" }}
            >
              ↓ Download
            </button>
            <button
              className="btn-secondary btn-danger"
              onClick={() => setConfirming(true)}
              disabled={isBusy}
              title="Remove this deck"
              aria-label={`Remove deck ${deck.name}`}
              style={{ padding: "0.45rem 0.75rem", borderRadius: 6, fontSize: "0.75rem" }}
            >
              ✕
            </button>
          </>
        )}
      </div>
    </div>
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
    if (!token) throw new Error("Your session has expired — please sign in again.");
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
      if (!res.ok) throw new Error(apiErrorMessage(await readJson(res), "Failed to remove that deck."));
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
        throw new Error(apiErrorMessage(data, "Failed to generate a download link."));
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

  return (
    <>
      <main className="page-main" style={{ maxWidth: 900, paddingBlock: "3rem" }}>

        <div style={{
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", flexWrap: "wrap",
          gap: "1rem", marginBottom: "2.5rem",
          animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 600, letterSpacing: "-0.01em", marginBottom: "0.3rem" }}>
              Your decks
            </h1>
            <p style={{ color: "var(--text2)", fontSize: "0.85rem" }}>
              {authLoading || decksLoading
                ? " " /* hold the line's height without flashing the wrong message */
                : !user
                ? "Sign in to see decks saved here"
                : decks.length === 0
                  ? "No decks yet — generate your first one"
                  : `${decks.length} deck${decks.length === 1 ? "" : "s"} · ${totalCards} cards total`}
            </p>
          </div>
          <Link to="/app" className="btn-primary" style={{ padding: "0.65rem 1.25rem", fontSize: "0.88rem" }}>
            + New deck
          </Link>
        </div>

        {error && (
          <p role="alert" style={{
            color: "var(--flame)", fontSize: "0.82rem", marginBottom: "1rem",
            background: "var(--flame-dim)", border: "1px solid var(--flame-border)",
            borderRadius: 8, padding: "0.6rem 0.85rem",
          }}>
            {error}
          </p>
        )}

        {!authLoading && !user ? (
          <div className="card" style={{
            padding: "1.25rem 1.5rem",
            borderRadius: 10,
            animation: "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text2)", lineHeight: 1.7, marginBottom: "1rem" }}>
              Decks you generate while signed in are saved here automatically. You can still use the tool without an account — you just won't see a history of what you've made.
            </p>
            <Link to="/login" className="btn-primary" style={{ display: "inline-block", padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}>
              Sign in
            </Link>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "1rem",
            animation: "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            {decksLoading ? (
              <p style={{ color: "var(--text3)", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>Loading…</p>
            ) : (
              decks.map(deck => (
                <DeckCard
                  key={deck.id}
                  deck={deck}
                  isBusy={busyId === deck.id}
                  onRemove={() => handleRemove(deck.id)}
                  onDownload={() => handleDownload(deck.id)}
                />
              ))
            )}

            <Link to="/app" className="tile-dashed">
              <span aria-hidden="true" style={{ fontSize: 28 }}>+</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>Generate new deck</span>
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
