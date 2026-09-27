import { useRef, useCallback } from "react";
import { MAX_IMAGES_PER_UPLOAD } from "../../constants";

export default function UploadZone({ files, onAddFiles, onRemoveFile, onSubmit, notice, isDragging, setIsDragging }) {
  const inputRef = useRef();
  const cameraInputRef = useRef();
  const atLimit = files.length >= MAX_IMAGES_PER_UPLOAD;

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) onAddFiles(Array.from(e.dataTransfer.files));
  }, [onAddFiles, setIsDragging]);

  // Clear the input value after reading so selecting the same file twice
  // (e.g. after removing it from the staged list) still fires onChange.
  const handlePicked = useCallback((e) => {
    if (e.target.files.length) onAddFiles(Array.from(e.target.files));
    e.target.value = "";
  }, [onAddFiles]);

  return (
    <div style={{ animation: "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" }}>
      {/* Rendered outside the clickable box below: input.click() dispatches a
          real bubbling click event, and if these lived inside that box it would
          re-trigger the box's own onClick right after opening the picker. */}
      <input ref={inputRef} type="file" accept="image/*,.heic,.heif" multiple style={{ display: "none" }}
        onChange={handlePicked} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }}
        onChange={handlePicked} />

      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); if (!atLimit) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => !atLimit && inputRef.current.click()}
        style={{
          border: `2px dashed ${isDragging ? "var(--jade)" : "var(--border-hover)"}`,
          borderRadius: 12, padding: "2.5rem 2rem",
          textAlign: "center", cursor: atLimit ? "default" : "pointer",
          background: isDragging ? "var(--jade-dim)" : "var(--surface)",
          transition: "all 0.25s ease",
          boxShadow: isDragging ? "0 0 0 4px var(--jade-dim), var(--shadow-card)" : "var(--shadow-card)",
          position: "relative", overflow: "hidden",
          opacity: atLimit ? 0.65 : 1,
          // Mobile browsers paint a translucent tap-highlight over any element
          // with cursor:pointer on touch — since this box wraps the camera/
          // choose-files buttons, that made the whole box flash on every tap.
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {!isDragging && (
          <div style={{
            position: "absolute", top: 0, left: "-100%",
            width: "60%", height: "100%",
            background: "linear-gradient(90deg, transparent, var(--jade-dim), transparent)",
            animation: "shimmer 3s ease-in-out 2s infinite",
            pointerEvents: "none",
          }} />
        )}

        <div aria-hidden="true" style={{
          width: 52, height: 52, margin: "0 auto 1.25rem",
          background: isDragging ? "var(--jade-dim)" : "var(--surface2)",
          borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
          border: `1px solid ${isDragging ? "var(--jade-border)" : "var(--border-hover)"}`,
          fontSize: 22, transition: "all 0.25s",
          transform: isDragging ? "scale(1.1)" : "scale(1)",
        }}>
          {isDragging ? "⬇" : "📷"}
        </div>

        <p style={{
          fontFamily: "var(--font-display)", fontWeight: 600,
          fontSize: "1.2rem", marginBottom: "0.4rem", letterSpacing: "-0.01em",
        }}>
          {atLimit ? `${MAX_IMAGES_PER_UPLOAD} images staged` : isDragging ? "Release to add" : "Drop your study sheets here"}
        </p>
        <p style={{ fontSize: "0.82rem", color: "var(--text3)", marginBottom: "1.5rem", fontFamily: "var(--font-mono)" }}>
          {atLimit
            ? "Remove one below to add another"
            : `Up to ${MAX_IMAGES_PER_UPLOAD} pages at once · JPG PNG HEIC`}
        </p>

        <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            className="btn-primary"
            disabled={atLimit}
            onClick={(e) => { e.stopPropagation(); inputRef.current.click(); }}
            style={{ padding: "0.6rem 1.5rem", borderRadius: 7, fontSize: "0.88rem" }}
          >
            Choose files
          </button>

          <button
            className="btn-secondary upload-camera-btn"
            disabled={atLimit}
            onClick={(e) => { e.stopPropagation(); cameraInputRef.current.click(); }}
            style={{
              padding: "0.6rem 1.5rem", fontWeight: 700, fontSize: "0.88rem",
              letterSpacing: "-0.01em", color: "var(--text1)",
              alignItems: "center", gap: "0.4rem",
            }}
          >
            📷 Take photo
          </button>
        </div>
      </div>

      {notice && (
        <p role="status" style={{
          marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--gold)",
          background: "var(--gold-dim)", border: "1px solid var(--gold-border)",
          borderRadius: 8, padding: "0.55rem 0.85rem",
        }}>
          {notice}
        </p>
      )}

      {files.length > 0 && (
        <div style={{ marginTop: "1rem", animation: "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.85rem" }}>
            {files.map((file, i) => (
              <div key={`${file.name}-${i}`} className="card" style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                borderRadius: 8, padding: "0.55rem 0.5rem 0.55rem 0.85rem",
              }}>
                <span style={{
                  fontSize: "0.82rem", color: "var(--text2)", fontFamily: "var(--font-mono)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {i + 1}. {file.name}
                </span>
                <button
                  className="btn-icon-danger"
                  onClick={() => onRemoveFile(i)}
                  title="Remove"
                  aria-label={`Remove ${file.name}`}
                  style={{ flexShrink: 0, width: 26, height: 26, fontSize: "0.85rem" }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button className="btn-primary" onClick={onSubmit} style={{
            width: "100%", padding: "0.85rem",
            fontWeight: 800, fontSize: "0.92rem", letterSpacing: "-0.02em",
          }}>
            Generate cards from {files.length} image{files.length === 1 ? "" : "s"}
          </button>
        </div>
      )}

      <div style={{
        display: "flex", justifyContent: "center", gap: "1.5rem",
        marginTop: "1rem", flexWrap: "wrap",
      }}>
        {[
          { dot: "var(--jade)", label: "Dictionary-verified" },
          { dot: "var(--gold)", label: "AI-polished" },
          { dot: "var(--seal)", label: "Anki-ready" },
        ].map(f => (
          <div key={f.label} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", color: "var(--text3)", fontFamily: "var(--font-mono)" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: f.dot, display: "inline-block" }} />
            {f.label}
          </div>
        ))}
      </div>
    </div>
  );
}
