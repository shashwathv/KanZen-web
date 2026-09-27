import { useEffect, useState } from "react";
import { API_URL } from "../constants";

// Polls the backend's /health endpoint. Returns "checking", "online",
// "degraded" (responding, but unhealthy) or "offline".
export function useApiStatus(intervalMs = 30000) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(4000) });
        if (!cancelled) setStatus(res.ok ? "online" : "degraded");
      } catch {
        if (!cancelled) setStatus("offline");
      }
    };
    check();
    const id = setInterval(check, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs]);

  return status;
}
