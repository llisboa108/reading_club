import { useEffect, useState } from "react";
import { apiRequest } from "../../api/client";
import PageMeta from "../../components/common/PageMeta";
import { useLandingScroll } from "../../hooks/useLandingScroll";
import { LandingScrollProvider } from "../../context/LandingScrollContext";
import LandingHeader from "./Components/LandingHeader";
import LandingHero from "./Components/LandingHero";
import LandingAbout from "./Components/LandingAbout";
import HistoryTimeline from "./Components/HistoryTimeline";
import StatsSection from "./Components/StatsSection";
import TeamSection from "./Components/TeamSection";
import VozesDoClube from "./Components/VozesDoClube";
import PartnersSection from "./Components/PartnersSection";
import ClosingCta from "./Components/ClosingCta";
import LandingFooter from "./Components/LandingFooter";
import BackToTop from "./Components/BackToTop";

interface ClubStats {
  books_read: number;
  pages_read: number;
  reading_hours: number;
  meets_held: number;
}

export default function LandingPage() {
  const [stats, setStats] = useState<ClubStats | null>(null);
  const scroll = useLandingScroll();

  useEffect(() => {
    apiRequest<ClubStats>("/club/public-stats/", "GET", undefined, { silent: true })
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  return (
    <>
      <PageMeta
        title="Sonhos Literários | Clube do Livro"
        description="Clube do livro Sonhos Literários - leituras, encontros e uma comunidade que transforma páginas em laços."
      />
      <LandingScrollProvider value={scroll}>
        <div className="bg-stone-25 dark:bg-gray-950">
          <LandingHeader />
          <main>
            <LandingHero />
            <LandingAbout />
            <HistoryTimeline />
            <StatsSection stats={stats} />
            <TeamSection />
            <VozesDoClube />
            <PartnersSection />
            <ClosingCta />
          </main>
          <LandingFooter />
          <BackToTop />
        </div>
      </LandingScrollProvider>
    </>
  );
}
