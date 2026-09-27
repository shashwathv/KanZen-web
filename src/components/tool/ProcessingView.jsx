import { useEffect, useState } from "react";
import { STEPS, WRITING_KANJI } from "../../constants";
import KanjiBox from "../ui/KanjiBox";
import { CheckIcon } from "../ui/icons";

function useElapsed() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function ProcessingView({ stepIndex, pageCount }) {
  const elapsed = useElapsed();

  return (
    <section className="sheet processing" aria-busy="true">
      {/* Kanji being written into practice squares, one after another. */}
      <div className="writing-row" aria-hidden="true">
        <KanjiBox size={58}>{WRITING_KANJI.join("")}</KanjiBox>
      </div>

      <h2 className="display">Reading {pageCount === 1 ? "your page" : `your ${pageCount} pages`}</h2>
      <p>This usually takes under a minute. Keep this tab open.</p>

      <ol className="progress-list">
        {STEPS.map((step, i) => {
          const status = i < stepIndex ? "done" : i === stepIndex ? "current" : "";
          return (
            <li key={step.id} className={status} aria-current={status === "current" ? "step" : undefined}>
              <span className="progress-mark" aria-hidden="true">{status === "done" && <CheckIcon />}</span>
              <span>
                <span className="progress-label">{step.label}</span>
                {status === "current" && <span className="progress-detail">{step.detail}</span>}
              </span>
            </li>
          );
        })}
      </ol>

      <p className="elapsed">{elapsed} elapsed</p>
    </section>
  );
}
