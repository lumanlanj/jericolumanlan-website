/**
 * Four company-attributed impact metrics directly under the hero.
 * Uses `[data-count]` so RevealController can animate the figures.
 */
const STATS = [
  {
    fig: (
      <span data-count="5.8" data-prefix="$" data-suffix="M+" data-decimals="1">
        $5.8M+
      </span>
    ),
    label: "incremental revenue",
    context: "Staples experimentation & journey redesign",
  },
  {
    fig: (
      <span data-count="1" data-prefix="~$" data-suffix="B" data-decimals="0">
        ~$1B
      </span>
    ),
    label: "annual digital revenue influenced",
    context: "Staples e-commerce",
  },
  {
    fig: <span>40% → 85%</span>,
    label: "returns-prediction accuracy",
    context: "Pitney Bowes ML, piloted with Nordstrom & REI",
  },
  {
    fig: (
      <span data-count="80" data-prefix="~" data-suffix="%" data-decimals="0">
        ~80%
      </span>
    ),
    label: "less compliance-reporting effort",
    context: "Xpansiv LCFS / clean-transportation compliance",
  },
] as const;

export default function StatsStrip() {
  return (
    <section className="stats-strip" aria-label="Career impact by the numbers">
      <div className="container stats-grid">
        {STATS.map((s) => (
          <div key={s.label} className="stats-item">
            <span className="cs-fig">{s.fig}</span>
            <span className="stats-label">{s.label}</span>
            <span className="stats-context">{s.context}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
