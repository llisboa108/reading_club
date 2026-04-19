import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { apiRequest } from "../../api/client";
import { API_HOST, API_PREFIX, getAccessToken } from "../../api/config";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../hooks/useAuth";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Author { id: number; first_name: string; last_name?: string; }
interface Publisher { id: number; name: string; }
interface Book { id: number; title: string; author: Author; publisher: Publisher; cover?: string | null; pages: number; }

type ReadingStatus = "PLANNED" | "IN_PROGRESS" | "FINISHED" | "CANCELED";
type MeetType = "ONLINE" | "IN_PERSON";

interface ReadingUser { user: string; joined_at: string; }
interface MeetPhoto { id: number; image: string; }
interface MeetParticipant { user: string; joined_at: string; }

interface Meet {
  id: number;
  reading: number;
  moderator?: string | null;
  meet_date: string;
  start_page?: number | null;
  end_page?: number | null;
  meet_type: MeetType;
  meeting_link?: string;
  address?: string;
  participants: MeetParticipant[];
  photos: MeetPhoto[];
}

interface Reading {
  id: number;
  book: Book;
  start_date: string;
  end_date?: string | null;
  status?: ReadingStatus;
  participants: ReadingUser[];
}

interface MeetForm {
  meet_date: string;
  meet_type: MeetType | "";
  start_page: string;
  end_page: string;
  meeting_link: string;
  address: string;
}

const EMPTY_MEET_FORM: MeetForm = {
  meet_date: "", meet_type: "", start_page: "", end_page: "",
  meeting_link: "", address: "",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function authorFullName(a: Author) {
  return [a.first_name, a.last_name].filter(Boolean).join(" ");
}

const statusConfig: Record<ReadingStatus, { label: string; color: "info" | "warning" | "success" | "error" }> = {
  PLANNED:     { label: "Planeada",      color: "info" },
  IN_PROGRESS: { label: "Em andamento",  color: "warning" },
  FINISHED:    { label: "Finalizada",    color: "success" },
  CANCELED:    { label: "Cancelada",     color: "error" },
};

function formatDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString("pt-PT", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Silent fetch ──────────────────────────────────────────────────────────────

async function silentFetch<T>(path: string): Promise<T | null> {
  try {
    const token = getAccessToken();
    const res = await fetch(`${API_HOST}${API_PREFIX}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ReadingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.is_admin;

  const [reading, setReading] = useState<Reading | null>(null);
  const [meets, setMeets] = useState<Meet[]>([]);
  const [loadingReading, setLoadingReading] = useState(true);
  const [meetsError, setMeetsError] = useState<"forbidden" | "error" | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Meet modal
  const [meetModalOpen, setMeetModalOpen] = useState(false);
  const [editingMeet, setEditingMeet] = useState<Meet | null>(null);
  const [meetForm, setMeetForm] = useState<MeetForm>(EMPTY_MEET_FORM);
  const [savingMeet, setSavingMeet] = useState(false);
  const [meetFormError, setMeetFormError] = useState("");

  // Delete meet modal
  const [deleteMeet, setDeleteMeet] = useState<Meet | null>(null);
  const [deleteMeetModalOpen, setDeleteMeetModalOpen] = useState(false);
  const [deletingMeet, setDeletingMeet] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  async function fetchData() {
    if (!id) return;
    setLoadingReading(true);

    // Reading — uses apiRequest (will 404 if not found)
    try {
      const r = await apiRequest<Reading>(`/club/readings/${id}/`);
      setReading(r);
    } catch {
      setNotFound(true);
      setLoadingReading(false);
      return;
    }

    // Meets — silent fetch to handle 403 gracefully
    const allMeets = await silentFetch<Meet[]>("/club/meets/");
    if (allMeets === null) {
      setMeetsError("forbidden");
    } else {
      setMeets(allMeets.filter((m) => m.reading === Number(id)));
      setMeetsError(null);
    }

    setLoadingReading(false);
  }

  useEffect(() => { fetchData(); }, [id]);

  // ── Meet Modal ─────────────────────────────────────────────────────────────

  function openCreateMeet() {
    setEditingMeet(null);
    setMeetForm(EMPTY_MEET_FORM);
    setMeetFormError("");
    setMeetModalOpen(true);
  }

  function openEditMeet(meet: Meet) {
    setEditingMeet(meet);
    // meet_date from API is ISO string — convert to datetime-local format
    const dt = new Date(meet.meet_date);
    const local = dt.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
    setMeetForm({
      meet_date: local,
      meet_type: meet.meet_type,
      start_page: meet.start_page ? String(meet.start_page) : "",
      end_page: meet.end_page ? String(meet.end_page) : "",
      meeting_link: meet.meeting_link || "",
      address: meet.address || "",
    });
    setMeetFormError("");
    setMeetModalOpen(true);
  }

  function closeMeetModal() {
    setMeetModalOpen(false);
    setEditingMeet(null);
    setMeetForm(EMPTY_MEET_FORM);
    setMeetFormError("");
  }

  async function handleSaveMeet() {
    if (!meetForm.meet_date) { setMeetFormError("Data e hora são obrigatórias."); return; }
    if (!meetForm.meet_type) { setMeetFormError("Seleciona o tipo de encontro."); return; }
    if (meetForm.meet_type === "ONLINE" && !meetForm.meeting_link) {
      setMeetFormError("Link da reunião é obrigatório para encontros online."); return;
    }
    if (meetForm.meet_type === "IN_PERSON" && !meetForm.address) {
      setMeetFormError("Morada é obrigatória para encontros presenciais."); return;
    }

    setSavingMeet(true);
    setMeetFormError("");
    try {
      const payload: Record<string, unknown> = {
        reading: Number(id),
        meet_date: new Date(meetForm.meet_date).toISOString(),
        meet_type: meetForm.meet_type,
        start_page: meetForm.start_page ? Number(meetForm.start_page) : null,
        end_page: meetForm.end_page ? Number(meetForm.end_page) : null,
        meeting_link: meetForm.meeting_link || "",
        address: meetForm.address || "",
      };
      if (editingMeet) {
        await apiRequest(`/club/meets/${editingMeet.id}/`, "PATCH", payload);
      } else {
        await apiRequest("/club/meets/", "POST", payload);
      }
      closeMeetModal();
      await fetchData();
    } catch {
      setMeetFormError("Erro ao guardar. Verifica os campos e tenta novamente.");
    } finally { setSavingMeet(false); }
  }

  async function handleDeleteMeet() {
    if (!deleteMeet) return;
    setDeletingMeet(true);
    try {
      await apiRequest(`/club/meets/${deleteMeet.id}/`, "DELETE");
      setDeleteMeetModalOpen(false);
      setDeleteMeet(null);
      await fetchData();
    } finally { setDeletingMeet(false); }
  }

  // ── Not Found ──────────────────────────────────────────────────────────────

  if (!loadingReading && notFound) {
    return (
      <div className="mx-auto flex max-w-screen-lg flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <BookOpenIcon className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Leitura não encontrada</h2>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">A leitura que procuras não existe ou foi removida.</p>
        <Button onClick={() => navigate("/readings")}>Voltar às leituras</Button>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loadingReading) {
    return (
      <div className="mx-auto max-w-screen-lg px-4 py-10 sm:px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-5 w-32 rounded bg-gray-100 dark:bg-gray-800" />
          <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex gap-6">
              <div className="h-24 w-16 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800" />
              <div className="flex-1 space-y-3">
                <div className="h-6 w-1/2 rounded bg-gray-100 dark:bg-gray-800" />
                <div className="h-4 w-1/3 rounded bg-gray-100 dark:bg-gray-800" />
                <div className="h-4 w-1/4 rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!reading) return null;

  const status = reading.status ?? "PLANNED";
  const { label: statusLabel, color: statusColor } = statusConfig[status];
  const bookInitials = reading.book.title.slice(0, 2).toUpperCase();

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <PageMeta title={`Leitura: ${reading.book.title} | Clube de Leitura`} description="" />

      <div className="mx-auto max-w-screen-lg px-4 py-6 sm:px-6">

        {/* Back */}
        <button
          onClick={() => navigate("/readings")}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeftIcon /> Voltar às leituras
        </button>

        {/* Reading header card */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:p-8">
            {/* Book cover */}
            <div
              className="flex h-24 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-500/10 dark:to-brand-600/20"
              onClick={() => navigate(`/books/${reading.book.id}`)}
              title="Ver livro"
            >
              {reading.book.cover ? (
                <img src={reading.book.cover} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-brand-400 dark:text-brand-300 select-none">{bookInitials}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col justify-between gap-4">
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">{reading.book.title}</h1>
                  <Badge color={statusColor} size="sm">{statusLabel}</Badge>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{authorFullName(reading.book.author)} · {reading.book.publisher.name}</p>
              </div>

              <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1.5"><CalendarIcon className="h-4 w-4 text-gray-400" />Início: {formatDate(reading.start_date)}</span>
                {reading.end_date && <span className="flex items-center gap-1.5"><CalendarIcon className="h-4 w-4 text-gray-400" />Fim: {formatDate(reading.end_date)}</span>}
                <span className="flex items-center gap-1.5">
                  <UsersIcon className="h-4 w-4 text-gray-400" />
                  {reading.participants.length} participante{reading.participants.length !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5"><BookIcon className="h-4 w-4 text-gray-400" />{reading.book.pages} páginas</span>
              </div>

              {/* Participants avatars */}
              {reading.participants.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {reading.participants.slice(0, 8).map((p) => (
                    <span
                      key={p.user}
                      title={p.user}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
                    >
                      {p.user.slice(0, 1).toUpperCase()}
                    </span>
                  ))}
                  {reading.participants.length > 8 && (
                    <span className="inline-flex h-7 items-center justify-center rounded-full bg-gray-100 px-2 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      +{reading.participants.length - 8}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Meets section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Encontros {meetsError === null && `(${meets.length})`}
            </h2>
            {isAdmin && meetsError === null && (
              <Button size="sm" onClick={openCreateMeet} startIcon={<PlusIcon />}>Novo Encontro</Button>
            )}
          </div>

          {meetsError === "forbidden" ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-warning-200 bg-warning-50 py-12 text-center dark:border-warning-500/20 dark:bg-warning-500/5">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-warning-100 dark:bg-warning-500/15">
                <LockIcon className="h-5 w-5 text-warning-600 dark:text-warning-400" />
              </div>
              <p className="text-sm font-medium text-warning-700 dark:text-warning-400">Subscrição necessária para ver os encontros.</p>
            </div>
          ) : meets.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <CalendarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Nenhum encontro agendado para esta leitura.</p>
              {isAdmin && <p className="mt-1 text-xs text-gray-400">Clica em "Novo Encontro" para agendar o primeiro.</p>}
            </div>
          ) : (
            <div className="space-y-3">
              {meets
                .slice()
                .sort((a, b) => new Date(a.meet_date).getTime() - new Date(b.meet_date).getTime())
                .map((meet, idx) => (
                  <MeetCard
                    key={meet.id}
                    meet={meet}
                    index={idx + 1}
                    totalPages={reading.book.pages}
                    isAdmin={!!isAdmin}
                    onEdit={() => openEditMeet(meet)}
                    onDelete={() => { setDeleteMeet(meet); setDeleteMeetModalOpen(true); }}
                  />
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Meet create/edit modal */}
      <Modal isOpen={meetModalOpen} onClose={closeMeetModal} className="max-w-lg p-6 sm:p-8">
        <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
          {editingMeet ? "Editar Encontro" : "Novo Encontro"}
        </h2>
        <div className="space-y-4">
          {/* Data/hora */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Data e hora <span className="text-error-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={meetForm.meet_date}
              onChange={(e) => setMeetForm({ ...meetForm, meet_date: e.target.value })}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo <span className="text-error-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[{ value: "ONLINE", label: "Online", icon: <VideoIcon className="h-4 w-4" /> },
                { value: "IN_PERSON", label: "Presencial", icon: <MapPinIcon className="h-4 w-4" /> }].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMeetForm({ ...meetForm, meet_type: opt.value as MeetType })}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition ${
                    meetForm.meet_type === opt.value
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                      : "border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:text-gray-400"
                  }`}
                >
                  {opt.icon}{opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional field */}
          {meetForm.meet_type === "ONLINE" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Link da reunião <span className="text-error-500">*</span>
              </label>
              <input
                type="url"
                value={meetForm.meeting_link}
                onChange={(e) => setMeetForm({ ...meetForm, meeting_link: e.target.value })}
                placeholder="https://meet.google.com/..."
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
          )}
          {meetForm.meet_type === "IN_PERSON" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Morada <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                value={meetForm.address}
                onChange={(e) => setMeetForm({ ...meetForm, address: e.target.value })}
                placeholder="Rua, nº, cidade"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
          )}

          {/* Páginas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Página início</label>
              <input
                type="number" min="1" value={meetForm.start_page}
                onChange={(e) => setMeetForm({ ...meetForm, start_page: e.target.value })}
                placeholder="Ex: 1"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Página fim</label>
              <input
                type="number" min="1" value={meetForm.end_page}
                onChange={(e) => setMeetForm({ ...meetForm, end_page: e.target.value })}
                placeholder="Ex: 120"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
          </div>

          {meetFormError && (
            <p className="rounded-lg bg-error-50 px-4 py-2.5 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">{meetFormError}</p>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={closeMeetModal} disabled={savingMeet}>Cancelar</Button>
          <Button onClick={handleSaveMeet} disabled={savingMeet}>
            {savingMeet ? "A guardar…" : editingMeet ? "Guardar alterações" : "Criar encontro"}
          </Button>
        </div>
      </Modal>

      {/* Delete meet modal */}
      <Modal isOpen={deleteMeetModalOpen} onClose={() => setDeleteMeetModalOpen(false)} className="max-w-sm p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-50 dark:bg-error-500/15">
            <TrashIcon className="h-7 w-7 text-error-500" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Eliminar encontro?</h2>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            O encontro de <strong>{deleteMeet ? formatDateTime(deleteMeet.meet_date) : ""}</strong> será eliminado. Esta ação não pode ser desfeita.
          </p>
          <div className="flex w-full gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteMeetModalOpen(false)} disabled={deletingMeet}>Cancelar</Button>
            <button
              onClick={handleDeleteMeet}
              disabled={deletingMeet}
              className="flex-1 rounded-lg bg-error-500 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-error-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deletingMeet ? "A eliminar…" : "Eliminar"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ── MeetCard ─────────────────────────────────────────────────────────────────

function MeetCard({ meet, index, totalPages, isAdmin, onEdit, onDelete }: {
  meet: Meet; index: number; totalPages: number;
  isAdmin: boolean; onEdit: () => void; onDelete: () => void;
}) {
  const isOnline = meet.meet_type === "ONLINE";
  const isPast = new Date(meet.meet_date) < new Date();
  const hasPages = meet.start_page || meet.end_page;
  const pagesRange = hasPages
    ? `Págs. ${meet.start_page ?? "?"} — ${meet.end_page ?? "?"}`
    : null;
  const progress = meet.end_page ? Math.round((meet.end_page / totalPages) * 100) : null;

  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-4">
        {/* Left: number + info */}
        <div className="flex items-start gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
            {index}
          </div>
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatDateTime(meet.meet_date)}
              </span>
              <Badge color={isPast ? "light" : "info"} size="sm">
                {isOnline ? "Online" : "Presencial"}
              </Badge>
              {isPast && <Badge color="light" size="sm">Realizado</Badge>}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
              {meet.moderator && (
                <span className="flex items-center gap-1"><UsersIcon className="h-3 w-3" />Mod: {meet.moderator}</span>
              )}
              {isOnline && meet.meeting_link && (
                <a
                  href={meet.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-brand-500 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <LinkIcon className="h-3 w-3" />Entrar na reunião
                </a>
              )}
              {!isOnline && meet.address && (
                <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3" />{meet.address}</span>
              )}
              {pagesRange && <span className="flex items-center gap-1"><BookIcon className="h-3 w-3" />{pagesRange}</span>}
              <span className="flex items-center gap-1">
                <UsersIcon className="h-3 w-3" />{meet.participants.length} participante{meet.participants.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Progress bar */}
            {progress !== null && (
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 w-32 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{progress}% do livro</span>
              </div>
            )}

            {/* Photos */}
            {meet.photos.length > 0 && (
              <div className="mt-3 flex gap-2">
                {meet.photos.slice(0, 4).map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.image}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover ring-2 ring-white dark:ring-gray-900"
                  />
                ))}
                {meet.photos.length > 4 && (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    +{meet.photos.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Admin actions */}
        {isAdmin && (
          <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button onClick={onEdit} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white" title="Editar">
              <EditIcon className="h-4 w-4" />
            </button>
            <button onClick={onDelete} className="rounded-lg p-1.5 text-gray-400 hover:bg-error-50 hover:text-error-500 dark:hover:bg-error-500/10" title="Eliminar">
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function ArrowLeftIcon() { return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>; }
function PlusIcon() { return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>; }
function CalendarIcon({ className }: { className?: string }) { return <svg className={className ?? "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" /></svg>; }
function UsersIcon({ className }: { className?: string }) { return <svg className={className ?? "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" /></svg>; }
function BookOpenIcon({ className }: { className?: string }) { return <svg className={className ?? "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>; }
function BookIcon({ className }: { className?: string }) { return <svg className={className ?? "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>; }
function LockIcon({ className }: { className?: string }) { return <svg className={className ?? "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" /></svg>; }
function EditIcon({ className }: { className?: string }) { return <svg className={className ?? "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>; }
function TrashIcon({ className }: { className?: string }) { return <svg className={className ?? "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" /></svg>; }
function VideoIcon({ className }: { className?: string }) { return <svg className={className ?? "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" /></svg>; }
function MapPinIcon({ className }: { className?: string }) { return <svg className={className ?? "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" /></svg>; }
function LinkIcon({ className }: { className?: string }) { return <svg className={className ?? "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101m-.758-4.899a4 4 0 0 0 5.656 0l4-4a4 4 0 0 0-5.656-5.656l-1.1 1.1" /></svg>; }