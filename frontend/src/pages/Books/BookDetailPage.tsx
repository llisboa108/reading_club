import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { apiRequest } from "../../api/client";
import { API_HOST, API_PREFIX, getAccessToken } from "../../api/config";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import PageMeta from "../../components/common/PageMeta";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Author {
  id: number;
  first_name: string;
  last_name?: string;
}

interface Publisher {
  id: number;
  name: string;
}

interface Book {
  id: number;
  title: string;
  subtitle?: string;
  isbn?: string;
  published_date?: string | null;
  pages: number;
  author: Author;
  publisher: Publisher;
  cover?: string | null;
}

type ReadingStatus = "PLANNED" | "IN_PROGRESS" | "FINISHED" | "CANCELED";

interface ReadingUser {
  user: string;
  joined_at: string;
}

interface Reading {
  id: number;
  book: Book;
  start_date: string;
  end_date?: string | null;
  status?: ReadingStatus;
  participants: ReadingUser[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function authorFullName(a: Author) {
  return [a.first_name, a.last_name].filter(Boolean).join(" ");
}

const statusConfig: Record<ReadingStatus, { label: string; color: "info" | "success" | "warning" | "error" }> = {
  PLANNED: { label: "Planeada", color: "info" },
  IN_PROGRESS: { label: "Em andamento", color: "warning" },
  FINISHED: { label: "Finalizada", color: "success" },
  CANCELED: { label: "Cancelada", color: "error" },
};

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [book, setBook] = useState<Book | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [readingsError, setReadingsError] = useState<"forbidden" | "error" | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);

      // Fetch book — se falhar, mostra "não encontrado"
      try {
        const bookData = await apiRequest<Book>(`/club/books/${id}/`);
        setBook(bookData);
      } catch {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Fetch leituras — tratado separadamente para não rebentar a página
      // Usa fetch manual para evitar o toast automático do apiRequest em caso de 403
      try {
        const token = getAccessToken();
        const res = await fetch(`${API_HOST}${API_PREFIX}/club/readings/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.status === 403) {
          setReadingsError("forbidden");
        } else if (!res.ok) {
          setReadingsError("error");
        } else {
          const allReadings: Reading[] = await res.json();
          setReadings(allReadings.filter((r) => r.book.id === Number(id)));
        }
      } catch {
        setReadingsError("error");
      }

      setLoading(false);
    }
    fetchData();
  }, [id]);

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-lg px-4 py-10 sm:px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-5 w-32 rounded bg-gray-100 dark:bg-gray-800" />
          <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex gap-8">
              <div className="h-52 w-36 shrink-0 rounded-xl bg-gray-100 dark:bg-gray-800" />
              <div className="flex-1 space-y-4 pt-2">
                <div className="h-7 w-3/4 rounded bg-gray-100 dark:bg-gray-800" />
                <div className="h-4 w-1/2 rounded bg-gray-100 dark:bg-gray-800" />
                <div className="h-4 w-1/3 rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Not Found ────────────────────────────────────────────────────────────────

  if (notFound || !book) {
    return (
      <div className="mx-auto flex max-w-screen-lg flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <BookOpenIcon className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Livro não encontrado</h2>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          O livro que procuras não existe ou foi removido.
        </p>
        <Button onClick={() => navigate("/books")}>Voltar ao catálogo</Button>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const initials = book.title.slice(0, 2).toUpperCase();

  return (
    <>
      <PageMeta title={`${book.title} | Clube de Leitura`} description={book.subtitle} />

      <div className="mx-auto max-w-screen-lg px-4 py-6 sm:px-6">

        {/* Back link */}
        <button
          onClick={() => navigate("/books")}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeftIcon />
          Voltar ao catálogo
        </button>

        {/* Book card */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:p-8">

            {/* Cover */}
            <div className="flex h-52 w-36 shrink-0 items-center justify-center self-start overflow-hidden rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-500/10 dark:to-brand-600/20">
              {book.cover ? (
                <img
                  src={book.cover}
                  alt={`Capa de ${book.title}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-5xl font-bold text-brand-400 dark:text-brand-300 select-none">
                  {initials}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col">
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {book.title}
                </h1>
                {book.subtitle && (
                  <p className="mt-1 text-base text-gray-500 dark:text-gray-400">
                    {book.subtitle}
                  </p>
                )}
              </div>

              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoItem label="Autor" value={authorFullName(book.author)} />
                <InfoItem label="Editora" value={book.publisher.name} />
                <InfoItem label="Páginas" value={`${book.pages} páginas`} />
                {book.published_date && (
                  <InfoItem
                    label="Data de publicação"
                    value={formatDate(book.published_date)}
                  />
                )}
                {book.isbn && <InfoItem label="ISBN" value={book.isbn} mono />}
              </dl>
            </div>
          </div>
        </div>

        {/* Readings section */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Leituras {readingsError === null && `(${readings.length})`}
          </h2>

          {readingsError === "forbidden" ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-warning-200 bg-warning-50 py-12 text-center dark:border-warning-500/20 dark:bg-warning-500/5">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-warning-100 dark:bg-warning-500/15">
                <LockIcon className="h-5 w-5 text-warning-600 dark:text-warning-400" />
              </div>
              <p className="text-sm font-medium text-warning-700 dark:text-warning-400">
                Subscrição necessária
              </p>
              <p className="mt-1 text-xs text-warning-600 dark:text-warning-500">
                É necessária uma subscrição ativa para ver as leituras.
              </p>
            </div>
          ) : readingsError === "error" ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center dark:border-gray-700 dark:bg-gray-900">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Não foi possível carregar as leituras.
              </p>
            </div>
          ) : readings.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <BookOpenIcon className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Nenhuma leitura registada para este livro.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {readings.map((reading) => (
                <ReadingCard key={reading.id} reading={reading} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {label}
      </dt>
      <dd
        className={`mt-0.5 text-sm text-gray-900 dark:text-white ${
          mono ? "font-mono" : "font-medium"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function ReadingCard({ reading }: { reading: Reading }) {
  const status = reading.status ?? "PLANNED";
  const { label, color } = statusConfig[status];
  const participantCount = reading.participants.length;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge color={color} size="sm">{label}</Badge>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              #{reading.id}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
              Início: {formatDate(reading.start_date)}
            </span>
            {reading.end_date && (
              <span className="flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
                Fim: {formatDate(reading.end_date)}
              </span>
            )}
          </div>
        </div>

        {/* Participants */}
        {participantCount > 0 && (
          <div className="flex flex-col items-end gap-1">
            <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <UsersIcon className="h-3.5 w-3.5" />
              {participantCount} participante{participantCount !== 1 ? "s" : ""}
            </span>
            <div className="flex flex-wrap justify-end gap-1 max-w-xs">
              {reading.participants.slice(0, 5).map((p) => (
                <span
                  key={p.user}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
                  title={p.user}
                >
                  {p.user.slice(0, 1).toUpperCase()}
                </span>
              ))}
              {participantCount > 5 && (
                <span className="inline-flex h-7 items-center justify-center rounded-full bg-gray-100 px-2 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  +{participantCount - 5}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function ArrowLeftIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

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

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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
