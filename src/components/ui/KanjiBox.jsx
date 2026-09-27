// Text written into genkouyoushi-style practice squares — one square per
// character, so a compound like 日本語 reads the way it would on a real sheet.
export default function KanjiBox({ children, size = 64, className = "", ...rest }) {
  const chars = [...String(children ?? "")];
  if (chars.length === 0) chars.push("");

  return (
    <span className={`kanji-row ${className}`.trim()} style={{ "--box": `${size}px` }} {...rest}>
      {chars.map((char, i) => (
        <span key={i} className="kanji-box"><span>{char}</span></span>
      ))}
    </span>
  );
}
