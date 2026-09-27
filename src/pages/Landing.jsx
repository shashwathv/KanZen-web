import { Link } from "react-router-dom";
import Footer from "../components/layout/Footer";
import HeroSection from "../components/landing/HeroSection";
import StatsBar from "../components/landing/StatsBar";
import HowItWorks from "../components/landing/HowItWorks";
import FeaturesSection from "../components/landing/FeaturesSection";

export default function Landing() {
  return (
    <>
      <main className="page-main" style={{ maxWidth: 900, paddingTop: "3.5rem", paddingBottom: "2rem" }}>
        <HeroSection />
        <StatsBar />
        <FeaturesSection />
        <HowItWorks />

        <div className="card" style={{
          marginTop: "5rem", padding: "3.5rem 2rem",
          borderRadius: 16,
          textAlign: "center",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
            width: "60%", height: 1,
            background: "linear-gradient(90deg, transparent, var(--seal), var(--jade), transparent)",
          }} />
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.9rem, 3.5vw, 2.4rem)", fontWeight: 600,
            letterSpacing: "-0.01em", marginBottom: "0.85rem",
          }}>
            Ready to ditch manual flashcards?
          </h2>
          <p style={{ color: "var(--text2)", fontSize: "0.92rem", marginBottom: "2rem" }}>
            Free forever. No account required to get started.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/app" className="btn-primary" style={{ padding: "0.75rem 2rem", fontSize: "0.95rem" }}>
              Try it free →
            </Link>
            <a
              href="https://github.com/shashwathv/KanZen"
              target="_blank" rel="noreferrer"
              className="btn-secondary"
              style={{ padding: "0.75rem 2rem", borderRadius: 8, fontWeight: 600, fontSize: "0.95rem", color: "var(--text1)" }}
            >
              View on GitHub
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
