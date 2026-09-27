import { useRef, useState } from "react";
import { MAX_IMAGES_PER_UPLOAD } from "../../constants";
import KanjiBox from "../ui/KanjiBox";
import { CameraIcon, CloseIcon } from "../ui/icons";

// A staged page shown as a small photo print. HEIC can't be previewed outside
// Safari, so fall back to the file name if the image won't decode.
function PageThumb({ page, number, onRemove }) {
  const [failed, setFailed] = useState(false);
  return (
    <li className="thumb">
      {failed ? (
        <div className="thumb-fallback">{page.file.name}</div>
      ) : (
        <img src={page.preview} alt={`Page ${number}: ${page.file.name}`} onError={() => setFailed(true)} />
      )}
      <span className="thumb-caption">Page {number}</span>
      <button className="icon-btn danger" onClick={onRemove} aria-label={`Remove page ${number} (${page.file.name})`}>
        <CloseIcon />
      </button>
    </li>
  );
}

export default function UploadZone({ pages, onAddFiles, onRemovePage, onSubmit, notice, disabled }) {
  const inputRef = useRef();
  const cameraInputRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const full = pages.length >= MAX_IMAGES_PER_UPLOAD;

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (!full && e.dataTransfer.files.length) onAddFiles(Array.from(e.dataTransfer.files));
  };

  // Clear the input after reading so picking the same file again (e.g. after
  // removing it) still fires onChange.
  const handlePicked = (e) => {
    if (e.target.files.length) onAddFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  const pickFiles = (e) => {
    e.stopPropagation();
    inputRef.current.click();
  };
  const takePhoto = (e) => {
    e.stopPropagation();
    cameraInputRef.current.click();
  };

  return (
    <div>
      {/* Kept outside the drop area: input.click() dispatches a bubbling click
          that would otherwise re-trigger the drop area's own onClick. */}
      <input ref={inputRef} type="file" accept="image/*,.heic,.heif" multiple hidden onChange={handlePicked} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden onChange={handlePicked} />

      <div
        className={`dropzone${isDragging ? " dragging" : ""}${full ? " full" : ""}`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); if (!full) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => !full && inputRef.current.click()}
      >
        <KanjiBox size={64} aria-hidden="true">写</KanjiBox>
        <p className="dropzone-title">
          {full ? `That's ${MAX_IMAGES_PER_UPLOAD} pages, the most for one deck` : isDragging ? "Drop to add these pages" : "Drop photos of your worksheets here"}
        </p>
        <p className="dropzone-hint">
          {full ? "Remove a page below to swap in a different one." : `JPG, PNG or HEIC. Up to ${MAX_IMAGES_PER_UPLOAD} pages, combined into one deck.`}
        </p>
        <div className="dropzone-actions">
          <button className="btn btn-ink" disabled={full} onClick={pickFiles}>Choose photos</button>
          <button className="btn btn-outline camera-btn" disabled={full} onClick={takePhoto}>
            <CameraIcon /> Take a photo
          </button>
        </div>
      </div>

      {notice && <p className="notice" role="status" style={{ marginTop: "1rem" }}>{notice}</p>}

      {pages.length > 0 && (
        <>
          <ol className="thumbs" aria-label="Pages to read">
            {pages.map((page, i) => (
              <PageThumb key={page.id} page={page} number={i + 1} onRemove={() => onRemovePage(page.id)} />
            ))}
          </ol>
          <div className="upload-submit">
            <button className="btn btn-ink" onClick={onSubmit} disabled={disabled}>
              Read {pages.length === 1 ? "this page" : `these ${pages.length} pages`}
            </button>
            <span className="muted small">Usually takes under a minute.</span>
          </div>
        </>
      )}
    </div>
  );
}
