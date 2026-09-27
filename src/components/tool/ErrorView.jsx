export default function ErrorView({ message, onReset }) {
  return (
    <section className="sheet result" role="alert">
      {/* A red-pen cross, drawn in two strokes. */}
      <svg className="red-cross" viewBox="0 0 100 100" aria-hidden="true">
        <path d="M28 26 L74 76" pathLength="1" />
        <path d="M73 25 L27 75" pathLength="1" />
      </svg>
      <h2 className="display">This deck couldn't be made</h2>
      <p>{message || "Something went wrong while reading your pages."}</p>
      <p>Clear, well-lit photos taken straight on work best.</p>
      <div className="result-actions">
        <button className="btn btn-ink" onClick={onReset}>Try again</button>
      </div>
    </section>
  );
}
