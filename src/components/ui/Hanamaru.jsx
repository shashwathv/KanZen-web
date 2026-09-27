import { HANAMARU_PATH } from "../../lib/hanamaruPath";

// 花丸 — the teacher's red mark for good work (see lib/hanamaruPath.js).
export default function Hanamaru({ draw = false, className = "", label }) {
  return (
    <svg
      className={`hanamaru${draw ? " draw" : ""} ${className}`.trim()}
      viewBox="-2 -2 104 104"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={HANAMARU_PATH} pathLength="1" />
    </svg>
  );
}
