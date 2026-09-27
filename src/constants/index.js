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

export const KANJI_BG = [
  "漢", "字", "語", "学", "読", "書", "話", "聞",
  "見", "知", "力", "心", "人", "日", "本",
];

export const STEPS = [
  { id: "upload",  label: "Image received", icon: "📷", detail: "Uploaded and queued for the vision model" },
  { id: "vision",  label: "Reading the page", icon: "👁️", detail: "Scanning layout, skipping stroke-order diagrams" },
  { id: "extract", label: "Identifying kanji", icon: "漢", detail: "Cross-referencing readings against KanjiDic2" },
  { id: "cards",   label: "Building cards", icon: "🎴", detail: "Assembling meanings, readings and examples" },
];