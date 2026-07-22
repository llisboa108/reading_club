import { useEffect, useRef, useState } from "react";
import DistortImage from "../../../components/landing/DistortImage";
import { apiRequest } from "../../../api/client";
import { loadGsap, prefersReducedMotion } from "../../../lib/landingMotion";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
  instagram?: string;
}

export default function TeamSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useRef(prefersReducedMotion()).current;
  const [team, setTeam] = useState<TeamMember[] | null>(null);

  useEffect(() => {
    apiRequest<TeamMember[]>("/club/team-members/", "GET", undefined, { silent: true })
      .then(setTeam)
      .catch(() => setTeam([]));
  }, []);

  useEffect(() => {
    if (reducedMotion || !sectionRef.current || !team?.length) return;
    let cancelled = false;
    let revert: (() => void) | undefined;

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled || !sectionRef.current) return;
      const ctx = gsap.context(() => {
        ScrollTrigger.batch(gsap.utils.toArray<HTMLElement>(".team-card"), {
          start: "top 88%",
          onEnter: (batch) =>
            gsap.to(batch, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }),
        });
      }, sectionRef);
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [reducedMotion, team]);

  if (team === null) return null;
  // Empty (not just unloaded) still renders the anchor so #membros in the nav
  // never scrolls to a missing element.
  if (team.length === 0) return <section id="membros" aria-hidden="true" />;

  const cardPending = `team-card ${reducedMotion ? "" : "opacity-0 translate-y-4"}`;

  return (
    <section id="membros" ref={sectionRef} className="bg-stone-25 py-20 dark:bg-gray-950 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <span aria-hidden="true" className="h-px w-8 bg-brand-300 dark:bg-brand-500/40" />
            <p className="font-body text-sm italic tracking-normal text-brand-600 dark:text-brand-400">
              Rostos que dão vida às nossas leituras.
            </p>
            <span aria-hidden="true" className="h-px w-8 bg-brand-300 dark:bg-brand-500/40" />
          </div>
          <h2 className="font-heading text-3xl font-medium text-stone-900 dark:text-white sm:text-4xl">
            Membros do clube
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {team.map((member) => {
            const content = (
              <>
                <div className="paper-grain relative mx-auto mb-4 h-28 w-28 overflow-hidden rounded-full ring-4 ring-transparent transition-all group-hover:ring-brand-200 dark:group-hover:ring-brand-500/30 sm:h-32 sm:w-32">
                  <DistortImage src={member.image} alt={member.name} className="h-full w-full rounded-full" />
                </div>
                <h4 className="font-heading font-semibold text-stone-900 dark:text-white">{member.name}</h4>
                <span className="text-sm text-stone-500 dark:text-gray-400">{member.role}</span>
              </>
            );

            return member.instagram ? (
              <a
                key={member.id}
                href={member.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={`group w-[calc(50%-0.75rem)] text-center sm:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.125rem)] ${cardPending}`}
              >
                {content}
              </a>
            ) : (
              <div
                key={member.id}
                className={`group w-[calc(50%-0.75rem)] text-center sm:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.125rem)] ${cardPending}`}
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
