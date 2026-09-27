import { useEffect, useRef } from "react";
import { API_BASE, STEPS } from "../constants";

const POLL_INTERVAL_MS = 3000;
const STEP_INTERVAL_MS = 8000;
// One dropped request (flaky mobile data, a proxy hiccup) shouldn't abandon a
// job that's still running server-side — only give up after several in a row.
const MAX_CONSECUTIVE_FAILURES = 5;
// Extraction normally finishes in well under a minute; past this, assume the
// job is stuck rather than polling forever.
const MAX_WAIT_MS = 5 * 60 * 1000;

export function useJobPoller({ jobId, state, onDone, onError, onStep }) {
  // Latest callbacks, so a parent re-render doesn't restart the polling loop.
  const callbacks = useRef({ onDone, onError, onStep });
  useEffect(() => {
    callbacks.current = { onDone, onError, onStep };
  });

  useEffect(() => {
    if (state !== "processing" || !jobId) return;

    const controller = new AbortController();
    const startedAt = Date.now();
    let stopped = false;
    let failures = 0;
    let pollTimer;

    const stepTimer = setInterval(() => {
      callbacks.current.onStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }, STEP_INTERVAL_MS);

    const finish = (notify) => {
      stopped = true;
      clearInterval(stepTimer);
      notify(callbacks.current);
    };

    // setTimeout chaining rather than setInterval, so a slow response can
    // never overlap with the next request.
    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE}/jobs/${jobId}`, { signal: controller.signal });
        if (res.status === 404) {
          return finish(cb => cb.onError("This job no longer exists on the server. Please upload your images again."));
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        failures = 0;

        if (data.status === "done") return finish(cb => cb.onDone(data));
        if (data.status === "failed") return finish(cb => cb.onError(data.error || "Processing failed"));
      } catch (err) {
        if (stopped || err.name === "AbortError") return;
        failures += 1;
        if (failures >= MAX_CONSECUTIVE_FAILURES) {
          return finish(cb => cb.onError("Lost contact with the server. Check your connection and try again."));
        }
      }

      if (stopped) return;
      if (Date.now() - startedAt > MAX_WAIT_MS) {
        return finish(cb => cb.onError("This is taking much longer than expected. Please try again."));
      }
      pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    pollTimer = setTimeout(poll, POLL_INTERVAL_MS);

    return () => {
      stopped = true;
      clearTimeout(pollTimer);
      clearInterval(stepTimer);
      controller.abort();
    };
  }, [state, jobId]);
}
