import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { apiRequest } from "../../api/client";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../hooks/useAuth";
import LandingHeader from "./Components/LandingHeader";
import LandingHero from "./Components/LandingHero";
import LandingAbout from "./Components/LandingAbout";
import HistoryTimeline from "./Components/HistoryTimeline";
import StatsSection from "./Components/StatsSection";
import TeamSection from "./Components/TeamSection";
import PartnersSection from "./Components/PartnersSection";
import LandingFooter from "./Components/LandingFooter";

interface ClubStats {
  books_read: number;
  pages_read: number;
  reading_hours: number;
  meets_held: number;
}

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<ClubStats | null>(null);

  useEffect(() => {
    apiRequest<ClubStats>("/club/public-stats/", "GET", undefined, { silent: true })
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  // Already logged in members land on their dashboard, not the marketing page.
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <PageMeta
        title="Sonhos Literários | Clube do Livro"
        description="Clube do livro Sonhos Literários - leituras, encontros e uma comunidade que transforma páginas em laços."
      />
      <div className="bg-white dark:bg-gray-950">
        <LandingHeader />
        <main>
          <LandingHero />
          <LandingAbout />
          <HistoryTimeline />
          <StatsSection stats={stats} />
          <TeamSection />
          <PartnersSection />
        </main>
        <LandingFooter />
      </div>
    </>
  );
}
