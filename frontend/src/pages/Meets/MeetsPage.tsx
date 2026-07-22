import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { apiRequest } from "../../api/client";
import { API_HOST, API_PREFIX, getAccessToken } from "../../api/config";
import Badge from "../../components/ui/badge/Badge";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Author {
  id: number;
  first_name: string;
  last_name?: string;
}
interface Book {
  id: number;
  title: string;
  author: Author;
}
interface Reading {
  id: number;
  book: Book;
}

type MeetType = "ONLINE" | "IN_PERSON";

interface MeetParticipant {
  user: string;
  joined_at: string;
}

interface Meet {
  id: number;
  reading: number;
  moderator: string | null;
  meet_date: string;
  start_page?: number | null;
  end_page?: number | null;
  meet_type: MeetType;
  meeting_link?: string | null;
  address?: string | null;
  participants: MeetParticipant[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateTime(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function silentFetch<T>(path: string): Promise<T | null> {
  try {
    const token = getAccessToken();
    const res = await fetch(`${API_HOST}${API_PREFIX}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MeetsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight") ? Number(searchParams.get("highlight")) : null;

  const [meets, setMeets] = useState<Meet[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [filterReading, setFilterReading] = useState<string>("");

  const rowRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const [m, r] = await Promise.all([
        silentFetch<Meet[]>("/club/meets/"),
        apiRequest<Reading[]>("/club/readings/").catch(() => [] as Reading[]),
      ]);
      if (m === null) {
        setForbidden(true);
      } else {
        setMeets(m);
        setForbidden(false);
      }
      setReadings(r);
      setLoading(false);
    }
    fetchAll();
  }, []);

  useEffect(() => {
    if (!highlightId || loading) return;
    rowRefs.current[highlightId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightId, loading, meets]);

  const readingById = useMemo(() => {
    const map = new Map<number, Reading>();
    readings.forEach((r) => map.set(r.id, r));
    return map;
  }, [readings]);

  const sortedMeets = useMemo(
    () =>
      meets
        .filter((m) => !filterReading || String(m.reading) === filterReading)
        .sort((a, b) => a.meet_date.localeCompare(b.meet_date)),
    [meets, filterReading]
  );

  return (
    <>
      <PageMeta title="Encontros | Clube de Leitura" description="Encontros do clube" />
      <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6">
        <PageBreadCrumb pageTitle="Encontros" />

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Encontros</h1>
          {!forbidden && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {meets.length} encontro{meets.length !== 1 ? "s" : ""} agendado{meets.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {forbidden ? (
          <ForbiddenState />
        ) : loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {readings.length > 0 && (
              <div className="mb-5">
                <select
                  value={filterReading}
                  onChange={(e) => setFilterReading(e.target.value)}
                  className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="">Todas as leituras</option>
                  {readings.map((r) => (
                    <option key={r.id} value={String(r.id)}>
                      {r.book.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {sortedMeets.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                {sortedMeets.map((m) => (
                  <MeetRow
                    key={m.id}
                    ref={(el) => {
                      rowRefs.current[m.id] = el;
                    }}
                    meet={m}
                    reading={readingById.get(m.reading)}
                    highlighted={m.id === highlightId}
                    onClick={() => navigate(`/readings/${m.reading}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

const MeetRow = forwardRef<
  HTMLDivElement,
  { meet: Meet; reading?: Reading; highlighted?: boolean; onClick: () => void }
>(function MeetRow({ meet, reading, highlighted, onClick }, ref) {
  return (
    <div
      ref={ref}
      className={`flex cursor-pointer flex-col gap-3 rounded-2xl border bg-white p-4 shadow-theme-xs transition hover:shadow-theme-md dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between ${
        highlighted
          ? "border-brand-400 ring-2 ring-brand-300 dark:border-brand-500 dark:ring-brand-500/40"
          : "border-gray-200 dark:border-gray-800"
      }`}
      onClick={onClick}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
          {reading?.book.title || `Leitura #${meet.reading}`}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            {formatDateTime(meet.meet_date)}
          </span>
          {meet.moderator && <span>Moderador: {meet.moderator}</span>}
          <span className="flex items-center gap-1">
            <UsersIcon className="h-3 w-3" />
            {meet.participants.length} participante{meet.participants.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
      <div className="shrink-0">
        <Badge color={meet.meet_type === "ONLINE" ? "info" : "success"} size="sm">
          {meet.meet_type === "ONLINE" ? "Online" : "Presencial"}
        </Badge>
      </div>
    </div>
  );
});

function ForbiddenState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-warning-200 bg-warning-50 py-20 text-center dark:border-warning-500/20 dark:bg-warning-500/5">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-warning-100 dark:bg-warning-500/15">
        <LockIcon className="h-7 w-7 text-warning-600 dark:text-warning-400" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-warning-700 dark:text-warning-400">Subscrição necessária</h3>
      <p className="text-sm text-warning-600 dark:text-warning-500">É necessária uma subscrição ativa para aceder aos encontros.</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center dark:border-gray-700 dark:bg-gray-900">
      <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">Nenhum encontro agendado</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Encontros são criados a partir da página de uma leitura.
      </p>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" />
    </svg>
  );
}
