import { useState, useCallback, lazy, Suspense } from "react";
import { API_BASE, STEPS, MAX_IMAGES_PER_UPLOAD } from "../constants";
import UploadZone from "../components/tool/UploadZone";
import ReviewView from "../components/tool/ReviewView";
import SuccessView from "../components/tool/SuccessView";
import ErrorView from "../components/tool/ErrorView";
import { useJobPoller } from "../hooks/useJobPoller";
import { getAccessToken } from "../lib/supabase";
import { compressImages } from "../lib/imageCompress";
import { readJson, apiErrorMessage } from "../lib/api";

// The file picker filters by `accept`, but drag-and-drop doesn't — so check
// here. HEIC often arrives with an empty MIME type, hence the extension test.
function isImage(file) {
  return file.type.startsWith("image/") || /\.(heic|heif)$/i.test(file.name);
}

// framer-motion (used only by ProcessingView) is a sizeable chunk of JS —
// load it on demand instead of blocking the initial /app bundle, so the
// upload button is interactive as soon as the page paints.
const ProcessingView = lazy(() => import("../components/tool/ProcessingView"));

export default function AppPage() {
  const [state, setState] = useState("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadNotice, setUploadNotice] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [filename, setFilename] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [cards, setCards] = useState([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildError, setBuildError] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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
    const room = MAX_IMAGES_PER_UPLOAD - files.length;
    // Only compress what will actually be kept — compression is slow on phones.
    const accepted = images.slice(0, Math.max(room, 0));

    const notes = [];
    const rejected = newFiles.length - images.length;
    if (rejected === 1) notes.push("1 file wasn't an image and was skipped.");
    if (rejected > 1) notes.push(`${rejected} files weren't images and were skipped.`);
    if (images.length > accepted.length) notes.push(`Only ${MAX_IMAGES_PER_UPLOAD} images can be uploaded at once.`);
    setUploadNotice(notes.join(" ") || null);

    if (accepted.length === 0) return;
    const compressed = await compressImages(accepted);
    setFiles(prev => [...prev, ...compressed].slice(0, MAX_IMAGES_PER_UPLOAD));
  }, [files.length]);

  const handleRemoveFile = useCallback((idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setUploadNotice(null);
  }, []);

  const handleSubmitFiles = useCallback(async () => {
    if (files.length === 0) return;
    setFilename(files.length === 1 ? files[0].name : `${files.length} images`);
    setStepIndex(0);
    setState("processing");
    const formData = new FormData();
    files.forEach(f => formData.append("images", f));
    try {
      const res = await fetch(`${API_BASE}/process`, { method: "POST", body: formData });
      const data = await readJson(res);
      if (!res.ok) throw new Error(apiErrorMessage(data, "Could not connect to the server."));
      setJobId(data.job_id);
    } catch (err) {
      handleError(err.message || "Could not connect to the server.");
    }
  }, [files, handleError]);

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
      if (!res.ok) throw new Error(apiErrorMessage(data, "Failed to generate the deck."));
      setResult(data);
      setState("done");
    } catch (err) {
      setBuildError(err.message || "Failed to generate the deck.");
    } finally {
      setIsBuilding(false);
    }
  }, [jobId]);

  const reset = useCallback(() => {
    setState("idle"); setJobId(null); setFilename(""); setFiles([]); setUploadNotice(null);
    setStepIndex(0); setCards([]); setIsBuilding(false); setBuildError(null);
    setResult(null); setError(null);
  }, []);

  return (
    <main className="page-main" style={{
      maxWidth: state === "review" ? 720 : 600,
      paddingTop: "3rem", paddingBottom: "6rem",
      transition: "max-width 0.3s ease",
    }}>

      {state === "idle" && (
        <>
          <div style={{
            marginBottom: "2.5rem",
            animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
          }}>
            <h1 style={{
              fontFamily: "var(--font-display)", fontSize: "2.3rem", fontWeight: 600,
              letterSpacing: "-0.01em", marginBottom: "0.5rem",
            }}>
              Generate your deck
            </h1>
            <p style={{ color: "var(--text2)", fontSize: "0.9rem" }}>
              Upload up to {MAX_IMAGES_PER_UPLOAD} study sheets and get one Anki deck in under a minute.
            </p>
          </div>
          <UploadZone
            files={files}
            onAddFiles={handleAddFiles}
            onRemoveFile={handleRemoveFile}
            onSubmit={handleSubmitFiles}
            notice={uploadNotice}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
          />
        </>
      )}

      {state === "processing" && (
        <Suspense fallback={
          <div className="card" style={{
            borderRadius: 16, padding: "2.5rem", textAlign: "center",
            color: "var(--text3)", fontSize: "0.82rem", fontFamily: "var(--font-mono)",
          }}>
            Loading…
          </div>
        }>
          <ProcessingView stepIndex={stepIndex} filename={filename} />
        </Suspense>
      )}

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

      {state === "error" && (
        <ErrorView message={error} onReset={reset} />
      )}
    </main>
  );
}
