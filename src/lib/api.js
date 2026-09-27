// Parse a JSON body without throwing. Error responses from a proxy or load
// balancer (502/504) are often HTML, and res.json() on those surfaces as a
// cryptic "Unexpected token <" instead of a useful message.
export async function readJson(res) {
  return res.json().catch(() => ({}));
}

// FastAPI puts a string in `detail` for HTTPException, but a list of
// validation-error objects for 422s — only show it to the user if it's text.
export function apiErrorMessage(data, fallback) {
  return typeof data?.detail === "string" && data.detail ? data.detail : fallback;
}
