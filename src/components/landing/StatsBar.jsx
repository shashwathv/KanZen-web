const STATS = [
  { value: "< 60s", label: "Processing time" },
  { value: "5 pages", label: "Merged into one deck" },
  { value: ".apkg", label: "Anki native format" },
  { value: "Free", label: "No account needed" },
];

export default function StatsBar() {
  return (
    <div className="stats-grid" style={{
      animation: "fadeUp 0.7s 0.2s cubic-bezier(0.16,1,0.3,1) both",
    }}>
      {STATS.map(s => (
        <div key={s.label} className="card raised card-hover" style={{
          borderRadius: 8, padding: "0.85rem 0.75rem",
          textAlign: "center",
        }}>
          <div style={{
            fontSize: "1.2rem", fontWeight: 800,
            color: "var(--jade)", letterSpacing: "-0.03em",
            fontFamily: "var(--font-mono)", marginBottom: "0.2rem",
          }}>
            {s.value}
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--text3)", letterSpacing: "0.02em" }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}