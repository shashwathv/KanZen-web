import { CheckIcon } from "../ui/icons";

const STAGES = ["Add pages", "Reading", "Check cards", "Download"];

// Where the user is in the four-stage flow. `current` is a 0-based index;
// `failed` marks the current stage as the one that went wrong.
export default function Stepper({ current, failed = false }) {
  return (
    <ol className="stepper" aria-label="Progress">
      {STAGES.map((label, i) => {
        const status = i < current ? "done" : i === current ? (failed ? "current failed" : "current") : "";
        return (
          <li key={label} className={status} aria-current={i === current ? "step" : undefined}>
            <span className="step-dot" aria-hidden="true">{i < current ? <CheckIcon /> : i + 1}</span>
            <span className="step-label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
