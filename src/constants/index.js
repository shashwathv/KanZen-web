if (!import.meta.env.VITE_API_URL) {
  console.error("VITE_API_URL is not set — API requests will fail. Check your .env file.");
}
export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";
if (window.location.protocol === "https:" && API_URL.startsWith("http:")) {
  console.error(
    `VITE_API_URL (${API_URL}) uses http:// but this page is served over https:// — ` +
    "browsers block these requests as mixed content. Serve the API over HTTPS."
  );
}
// Every route except /health is mounted under /v1 on the backend (see src/api.py).
export const API_BASE = `${API_URL}/v1`;

export const MAX_IMAGES_PER_UPLOAD = 5;

// Written into the practice squares while a job is processing.
export const WRITING_KANJI = ["漢", "字", "読", "書", "学"];

// Shown while a job is processing. The backend doesn't report progress, so
// these advance on a timer (see useJobPoller) — keep the wording honest.
export const STEPS = [
  { id: "upload",  label: "Photos received",     detail: "Your pages are queued to be read" },
  { id: "vision",  label: "Reading the page",    detail: "Finding the kanji and skipping stroke-order diagrams" },
  { id: "extract", label: "Looking up readings", detail: "Checking on-yomi and kun-yomi against KANJIDIC2" },
  { id: "cards",   label: "Writing cards",       detail: "Adding meanings and example sentences" },
];
