import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import SubscribersModal from "@/components/SubscribersModal";
import { Link } from "wouter";

const wildlifeFacts = [
  {
    title: "73% average decline",
    description: "The 2024 Living Planet Report reports an average 73% decline in monitored wildlife population sizes since 1970.",
    sourceLabel: "WWF — Living Planet Report 2024",
    sourceUrl: "https://www.worldwildlife.org/publications/2024-living-planet-report/",
  },
  {
    title: "Around 1 million species",
    description: "Around 1 million animal and plant species are threatened with extinction, many within decades, according to the IPBES Global Assessment.",
    sourceLabel: "UNEP / IPBES Global Assessment",
    sourceUrl: "https://www.unep.org/news-and-stories/press-release/natures-dangerous-decline-unprecedented-species-extinction-rates",
  },
  {
    title: "44% of CMS-listed species",
    description: "Nearly half of species listed under the Convention on Migratory Species are showing population declines.",
    sourceLabel: "UNEP — State of the World's Migratory Species",
    sourceUrl: "https://www.unep.org/news-and-stories/press-release/landmark-un-report-worlds-migratory-species-animals-are-decline-and",
  },
];

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const clickCount = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subscribeMutation = trpc.subscribers.subscribe.useMutation();

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        setIsModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => {
      window.removeEventListener("keydown", handleShortcut);
      if (clickTimer.current) clearTimeout(clickTimer.current);
    };
  }, []);

  const handleSubscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    try {
      const result = await subscribeMutation.mutateAsync({ email: email.trim() });
      if (result.success) {
        setEmail("");
        setStatus({ type: "success", message: "You're on the list. Watch your inbox for the next briefing." });
      } else {
        setStatus({ type: "error", message: result.error || "That address is already subscribed." });
      }
    } catch (error) {
      const message = error instanceof Error && error.message.toLowerCase().includes("email")
        ? "Please enter a valid email address."
        : "We couldn't save your address. Please try again.";
      setStatus({ type: "error", message });
    }
  };

  const handleCopyrightClick = () => {
    clickCount.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);

    if (clickCount.current === 3) {
      setIsModalOpen(true);
      clickCount.current = 0;
      return;
    }

    clickTimer.current = setTimeout(() => {
      clickCount.current = 0;
    }, 900);
  };

  return (
    <div className="canopy-page">
      <div className="canopy-shell">
        <header className="site-header">
          <a href="#top" className="brand-link" aria-label="The Wild Brief home">
            <img className="brand-logo" src="/logo.png" alt="The Wild Brief Environmental Intelligence" />
          </a>
          <div className="header-actions">
            <nav className="page-nav" aria-label="Main navigation">
              <Link href="/">Home</Link>
              <Link href="/about">About</Link>
            </nav>
            <span className="issue-chip">A weekly briefing</span>
            <button className="theme-button" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
              <span className="theme-icon" aria-hidden="true">{theme === "dark" ? "☀" : "◐"}</span>
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </header>

        <p className="site-update-note" role="note"><span>Schedule</span> Updates every Sunday at 9:00 AM PST</p>

        <main id="top">
          <section className="hero-layout" aria-labelledby="hero-title">
            <div className="hero-copy">
              <h1 className="hero-title" id="hero-title">Essential environmental intelligence. <em>Clear & focused.</em></h1>
              <p className="hero-lede">A weekly synthesis of critical developments in climate policy, wildlife and conservation, animal health and field science, and clean technology.</p>

              <div className="subscribe-panel">
                <form className="subscribe-form" onSubmit={handleSubscribe} noValidate>
                  <label className="sr-only" htmlFor="email-input">Your email address</label>
                  <input
                    className="subscribe-input"
                    id="email-input"
                    type="email"
                    autoComplete="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                  <button className="subscribe-button" type="submit" disabled={subscribeMutation.isPending}>
                    {subscribeMutation.isPending ? "Saving…" : "Subscribe"}
                  </button>
                </form>
                {status && <p className={`form-status ${status.type}`} role="status">{status.message}</p>}
              </div>
            </div>

                                    <aside className="hero-note" aria-label="This week's edition available">
              <div className="note-inner">
                <div className="note-kicker"><span>This week</span><span className="note-number">PDF</span></div>
                <h2 className="note-title">One briefing. Four topics.</h2>
                <p className="note-quote">See what this week covers before you subscribe.</p>
                <div className="note-rule" />
                <a href="/editions/this-weeks-edition.pdf" download className="edition-request-email">Get this week's PDF →</a>
              </div>
            </aside>
          </section>

          <section className="content-section" aria-labelledby="article-title">
            <div className="section-heading">
              <span className="section-index">01 / General article</span>
              <h2 className="section-title" id="article-title">One article. Four areas of focus.</h2>
            </div>
            <p className="section-description">The Wild Brief brings climate policy, wildlife and conservation, animal health and field science, and clean technology together in one general article.</p>
            <div className="article-scope" aria-label="Article coverage areas">
              <span>Climate policy</span>
              <span>Wildlife &amp; conservation</span>
              <span>Animal health &amp; field science</span>
              <span>Clean technology</span>
            </div>
          </section>

          <section className="content-section" aria-labelledby="facts-title">
            <div className="section-heading">
              <span className="section-index">02 / Wildlife facts</span>
              <h2 className="section-title" id="facts-title">Wildlife facts, with sources.</h2>
            </div>
            <div className="facts-layout">
              <div className="fact-intro">
                <span className="section-index">Verified sources</span>
                <h3>Figures you can check.</h3>
              </div>
              <div className="facts-list">
                {wildlifeFacts.map((fact) => (
                  <article className="fact-card" key={fact.title}>
                    <span className="fact-marker" aria-hidden="true" />
                    <div>
                      <h3 className="fact-title">{fact.title}</h3>
                      <p className="fact-description">{fact.description}</p>
                      <a className="fact-source" href={fact.sourceUrl} target="_blank" rel="noreferrer">Source: {fact.sourceLabel} ↗</a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

                    <section className="archive-section" aria-labelledby="past-editions-title">
            <div className="archive-heading">
              <span className="section-index">03 / This week's edition</span>
              <h2 className="section-title" id="past-editions-title">Read this week's edition.</h2>
            </div>
            <div className="archive-list">
              <article className="edition-row">
                <span className="edition-number" aria-hidden="true">PDF</span>
                <div className="edition-main">
                  <span className="edition-label">This week</span>
                  <h3><a href="/editions/this-weeks-edition.pdf" download>Climate, Wildlife, Animal Science, and Clean Tech</a></h3>
                  <p>Climate policy, wildlife &amp; conservation, animal health &amp; field science, and clean technology.</p>
                </div>
                <a className="edition-status" href="/editions/this-weeks-edition.pdf" download>Download PDF →</a>
              </article>
            </div>
            <div className="archive-request" role="note">
              <span className="archive-request-kicker">Older editions</span>
              <p>Need an older edition? <a href="#email-input">Subscribe</a>, then email <a href="mailto:thewildbriefweekly@gmail.com">thewildbriefweekly@gmail.com</a> for a past edition.</p>
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <span className="footer-credit" onClick={handleCopyrightClick} title="Triple-click for owner access">© 2026 The Wild Brief</span>
          <a className="footer-contact" href="mailto:thewildbriefweekly@gmail.com">Contact: thewildbriefweekly@gmail.com</a>
        </footer>
      </div>

      <SubscribersModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
