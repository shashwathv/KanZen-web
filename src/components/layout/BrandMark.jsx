// The vermillion 漢 seal used as the Kanzen logo. Decorative — it always sits
// next to the "Kanzen" wordmark or a heading, so it's hidden from screen readers.
export default function BrandMark({ size = 30, style }) {
  return (
    <div
      className="brand-mark"
      aria-hidden="true"
      style={{
        width: size, height: size,
        borderRadius: Math.round(size * 0.23),
        fontSize: Math.round(size * 0.47),
        ...style,
      }}
    >
      漢
    </div>
  );
}
