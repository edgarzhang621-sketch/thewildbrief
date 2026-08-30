import SitePageShell from "@/components/SitePageShell";

const coverage = [
  ["Climate policy", "Decisions, commitments, and the context behind them."],
  ["Wildlife & conservation", "Species, habitats, ecosystem protection, and developments affecting the living world."],
  ["Animal health & field science", "Veterinary science, zoology, and field biology connecting animal health with habitat conservation."],
  ["Clean technology", "Tools and systems shaping a lower-impact future."],
];

export default function About() {
  return (
    <SitePageShell
      eyebrow="About The Wild Brief"
      title="A clearer way to follow environmental change."
      intro="The Wild Brief brings climate policy, wildlife and conservation, animal health and field science, and clean technology together in one general article."
    >
      <section className="inner-section" aria-labelledby="about-purpose-title">
        <div className="inner-section-label">01 / Purpose</div>
        <div>
          <h2 className="inner-section-title" id="about-purpose-title">One useful briefing.</h2>
          <p className="inner-section-copy">The Wild Brief is a weekly environmental briefing that brings related developments into one clear read.</p>
          <p className="inner-section-copy">It is built to help readers understand how policy, wildlife conservation, animal health, field science, and technology relate to each other.</p>
        </div>
      </section>

      <section className="inner-section" aria-labelledby="about-coverage-title">
        <div className="inner-section-label">02 / Coverage</div>
        <div>
          <h2 className="inner-section-title" id="about-coverage-title">One connected article.</h2>
          <div className="coverage-grid">
            {coverage.map(([title, description]) => (
              <article className="coverage-card" key={title}>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section" aria-labelledby="about-standard-title">
        <div className="inner-section-label">03 / Standard</div>
        <div>
          <h2 className="inner-section-title" id="about-standard-title">How it works.</h2>
          <p className="inner-section-copy">Each weekly article brings the four coverage areas together rather than splitting them into separate sections.</p>
          <p className="inner-section-copy">The goal is a focused summary that gives readers enough context to follow what matters.</p>
        </div>
      </section>
    </SitePageShell>
  );
}
