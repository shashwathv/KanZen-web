import { useState, useCallback, useEffect, useRef } from "react";
import { API_BASE, STEPS, MAX_IMAGES_PER_UPLOAD } from "../constants";
import Stepper from "../components/tool/Stepper";
import UploadZone from "../components/tool/UploadZone";
import ProcessingView from "../components/tool/ProcessingView";
import ReviewView from "../components/tool/ReviewView";
import SuccessView from "../components/tool/SuccessView";
import ErrorView from "../components/tool/ErrorView";
import { useJobPoller } from "../hooks/useJobPoller";
import { useApiStatus } from "../hooks/useApiStatus";
import { getAccessToken } from "../lib/supabase";
import { compressImages } from "../lib/imageCompress";
import { readJson, apiErrorMessage } from "../lib/api";

// The file picker filters by `accept`, but drag-and-drop doesn't — so check
// here. HEIC often arrives with an empty MIME type, hence the extension test.
function isImage(file) {
  return file.type.startsWith("image/") || /\.(heic|heif)$/i.test(file.name);
}

const STAGE_FOR_STATE = { idle: 0, processing: 1, error: 1, review: 2, done: 3 };

let nextPageId = 0;

export default function AppPage() {
  const [state, setState] = useState("idle");
  const [pages, setPages] = useState([]); // { id, file, preview }
  const [preparing, setPreparing] = useState(false);
  const [uploadNotice, setUploadNotice] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [cards, setCards] = useState([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildError, setBuildError] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const apiStatus = useApiStatus();

  // Preview URLs hold the image in memory until revoked — release them when
  // pages are removed and when leaving the page.
  const pagesRef = useRef(pages);
  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);
  useEffect(() => () => pagesRef.current.forEach(p => URL.revokeObjectURL(p.preview)), []);

  // "done" here means extraction finished — the extracted cards still need
  // review/build via /v1/build before a deck actually exists.
  const handleExtracted = useCallback((data) => {
    setStepIndex(STEPS.length);
    setCards(data.cards || []);
    setState("review");
  }, []);

  const handleError = useCallback((msg) => {
    setError(msg);
    setState("error");
  }, []);

  useJobPoller({ jobId, state, onDone: handleExtracted, onError: handleError, onStep: setStepIndex });

  const handleAddFiles = useCallback(async (newFiles) => {
    const images = newFiles.filter(isImage);
    // Only compress what will actually be kept — compression is slow on phones.
    const accepted = images.slice(0, Math.max(MAX_IMAGES_PER_UPLOAD - pages.length, 0));

    const notes = [];
    const rejected = newFiles.length - images.length;
    if (rejected === 1) notes.push("1 file wasn't an image, so it was left out.");
    if (rejected > 1) notes.push(`${rejected} files weren't images, so they were left out.`);
    if (images.length > accepted.length) notes.push(`A deck can use up to ${MAX_IMAGES_PER_UPLOAD} pages, so the extra photos weren't added.`);
    setUploadNotice(notes.join(" ") || null);

    if (accepted.length === 0) return;
    setPreparing(true);
    try {
      const compressed = await compressImages(accepted);
      const added = compressed.map(file => ({ id: nextPageId++, file, preview: URL.createObjectURL(file) }));
      setPages(prev => [...prev, ...added]);
    } finally {
      setPreparing(false);
    }
  }, [pages.length]);

  const handleRemovePage = useCallback((id) => {
    setPages(prev => {
      const page = prev.find(p => p.id === id);
      if (page) URL.revokeObjectURL(page.preview);
      return prev.filter(p => p.id !== id);
    });
    setUploadNotice(null);
  }, []);

  const handleSubmitPages = useCallback(async () => {
    if (pages.length === 0) return;
    setPageCount(pages.length);
    setStepIndex(0);
    setState("processing");
    const formData = new FormData();
    pages.forEach(p => formData.append("images", p.file));
    try {
      const res = await fetch(`${API_BASE}/process`, { method: "POST", body: formData });
      const data = await readJson(res);
      if (!res.ok) throw new Error(apiErrorMessage(data, "The server didn't accept these pages."));
      setJobId(data.job_id);
    } catch (err) {
      handleError(err instanceof TypeError ? "Couldn't reach the Kanzen server. Check your connection and try again." : err.message);
    }
  }, [pages, handleError]);

  const handleBuild = useCallback(async (editedCards, deckName) => {
    setIsBuilding(true);
    setBuildError(null);
    try {
      // Anonymous builds are allowed; the token only links the deck to an account.
      const token = await getAccessToken();
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/build`, {
        method: "POST",
        headers,
        body: JSON.stringify({ cards: editedCards, job_id: jobId, deck_name: deckName }),
      });
      const data = await readJson(res);
      if (!res.ok) throw new Error(apiErrorMessage(data, "The deck couldn't be made. Try again in a moment."));
      setResult(data);
      setState("done");
    } catch (err) {
      setBuildError(err instanceof TypeError ? "Couldn't reach the Kanzen server. Check your connection and try again." : err.message);
    } finally {
      setIsBuilding(false);
    }
  }, [jobId]);

  const reset = useCallback(() => {
    pagesRef.current.forEach(p => URL.revokeObjectURL(p.preview));
    setState("idle"); setJobId(null); setPages([]); setUploadNotice(null); setPageCount(0);
    setStepIndex(0); setCards([]); setIsBuilding(false); setBuildError(null);
    setResult(null); setError(null);
  }, []);

  return (
    <div className="page page-narrow">
      <header className="tool-head">
        <h1 className="display">Make a deck</h1>
        <Stepper current={STAGE_FOR_STATE[state]} failed={state === "error"} />
      </header>

      {state === "idle" && (
        <>
          {(apiStatus === "offline" || apiStatus === "degraded") && (
            <p className="notice error" role="status" style={{ marginBottom: "1rem" }}>
              The Kanzen server isn't responding right now, so pages can't be read yet.
              You can still add your photos. Try again in a minute.
            </p>
          )}
          <UploadZone
            pages={pages}
            onAddFiles={handleAddFiles}
            onRemovePage={handleRemovePage}
            onSubmit={handleSubmitPages}
            notice={preparing ? "Preparing your photos…" : uploadNotice}
            disabled={preparing}
          />
        </>
      )}

      {state === "processing" && <ProcessingView stepIndex={stepIndex} pageCount={pageCount} />}

      {state === "review" && (
        <ReviewView
          cards={cards}
          onBuild={handleBuild}
          onReset={reset}
          isBuilding={isBuilding}
          buildError={buildError}
        />
      )}

      {state === "done" && result && (
        <SuccessView stats={result.stats} downloadUrl={result.download_url} savedToDashboard={Boolean(result.deck_id)} onReset={reset} />
      )}

      {state === "error" && <ErrorView message={error} onReset={reset} />}
    </div>
  );
}
