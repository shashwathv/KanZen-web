import KanjiBox from "../ui/KanjiBox";

// The Kanzen mark: 漢 written in a practice square. Decorative — it always sits
// next to the "Kanzen" wordmark or a heading.
export default function BrandMark({ size = 30 }) {
  return <KanjiBox size={size} aria-hidden="true">漢</KanjiBox>;
}
