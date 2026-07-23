import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { apiRequest } from "../../api/client";
import { API_HOST, API_PREFIX, getAccessToken } from "../../api/config";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../components/common/PageHeader";
import { useAuth } from "../../hooks/useAuth";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Author { id: number; first_name: string; last_name?: string; }
interface Publisher { id: number; name: string; }
interface Book { id: number; title: string; author: Author; publisher: Publisher; cover?: string | null; }

type ReadingStatus = "PLANNED" | "IN_PROGRESS" | "FINISHED" | "CANCELED";

interface ReadingUser { user: string; joined_at: string; }

interface Member { id: number; email: string; full_name: string; }

interface Reading {
  id: number;
  book: Book;
  suggested_by?: Member | null;
  start_date: string;
  end_date?: string | null;
  status?: ReadingStatus;
  participants: ReadingUser[];
}

interface ReadingForm {
  book: string;
  suggested_by: string;
  users: number[];
  start_date: string;
  end_date: string;
  status: ReadingStatus | "";
}

const EMPTY_FORM: ReadingForm = {
  book: "", suggested_by: "", users: [],
  start_date: "", end_date: "", status: "",
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

const STATUS_OPTIONS: { value: ReadingStatus; label: string }[] = [
  { value: "PLANNED",     label: "Planeada" },
  { value: "IN_PROGRESS", label: "Em andamento" },
  { value: "FINISHED",    label: "Finalizada" },
  { value: "CANCELED",    label: "Cancelada" },
];

function formatDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
}

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

export default function ReadingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.is_admin;

  const [readings, setReadings] = useState<Reading[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);   // ← novo
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  const [filterStatus, setFilterStatus] = useState<ReadingStatus | "">("");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"recent" | "old">("recent");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingReading, setEditingReading] = useState<Reading | null>(null);
  const [form, setForm] = useState<ReadingForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteReading, setDeleteReading] = useState<Reading | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  async function fetchAll() {
    setLoading(true);
    const [r, b, m] = await Promise.all([
      silentFetch<Reading[]>("/club/readings/"),
      apiRequest<Book[]>("/club/books/").catch(() => [] as Book[]),
      apiRequest<Member[]>("/auth/members/").catch(() => [] as Member[]),  // ← novo
    ]);
    if (r === null) { setForbidden(true); } else { setReadings(r); setForbidden(false); }
    setBooks((b as Book[]).slice().sort((x, y) => y.id - x.id));
    setMembers(m as Member[]);
    setLoading(false);
  }

  useEffect(() => { fetchAll(); }, []);

  // ── Filter ─────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => readings
    .filter((r) => {
      const matchStatus = !filterStatus || r.status === filterStatus;
      const matchSearch = !search ||
        r.book.title.toLowerCase().includes(search.toLowerCase()) ||
        authorFullName(r.book.author).toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    })
    .sort((a, b) =>
      sortOrder === "recent"
        ? b.start_date.localeCompare(a.start_date)
        : a.start_date.localeCompare(b.start_date)
    ), [readings, filterStatus, search, sortOrder]);

  // ── Modal helpers ──────────────────────────────────────────────────────────

  function openCreate() {
    setEditingReading(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(r: Reading) {
    setEditingReading(r);
    setForm({
      book: String(r.book.id),
      suggested_by: r.suggested_by ? String(r.suggested_by.id) : "",
      users: r.participants.map((p) => {
        const found = members.find((m) => m.email === p.user);
        return found ? found.id : -1;
      }).filter((id) => id !== -1),
      start_date: r.start_date,
      end_date: r.end_date || "",
      status: r.status || "PLANNED",
    });
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingReading(null);
    setForm(EMPTY_FORM);
    setFormError("");
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!form.book) { setFormError("Selecione um livro."); return; }
    if (!form.start_date) { setFormError("Data de início é obrigatória."); return; }
    if (!form.status) { setFormError("Selecione um estado."); return; }
    setSaving(true);
    setFormError("");
    try {
      const payload = {
        book: Number(form.book),
        suggested_by: form.suggested_by ? Number(form.suggested_by) : null,
        users: form.users,
        start_date: form.start_date,
        end_date: form.end_date || null,
        status: form.status,
      };
      if (editingReading) {
        await apiRequest(`/club/readings/${editingReading.id}/`, "PATCH", payload);
      } else {
        await apiRequest("/club/readings/", "POST", payload);
      }
      closeModal();
      await fetchAll();
    } catch {
      setFormError("Erro ao guardar. Verifica os campos e tenta novamente.");
    } finally { setSaving(false); }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!deleteReading) return;
    setDeleting(true);
    try {
      await apiRequest(`/club/readings/${deleteReading.id}/`, "DELETE");
      setDeleteModalOpen(false);
      setDeleteReading(null);
      await fetchAll();
    } finally { setDeleting(false); }
  }

  // ── Toggle member selection ────────────────────────────────────────────────

  function toggleMember(id: number) {
    setForm((prev) => ({
      ...prev,
      users: prev.users.includes(id)
        ? prev.users.filter((u) => u !== id)
        : [...prev.users, id],
    }));
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <PageMeta title="Leituras | Clube de Leitura" description="Leituras do clube" />
      <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6">
        <PageBreadCrumb pageTitle="Leituras" />

        <PageHeader
          title="Leituras"
          description={
            !forbidden
              ? `${readings.length} leitura${readings.length !== 1 ? "s" : ""} registada${readings.length !== 1 ? "s" : ""}`
              : undefined
          }
          actions={
            isAdmin && !forbidden && (
              <Button onClick={openCreate} startIcon={<PlusIcon />}>Nova Leitura</Button>
            )
          }
        />

        {forbidden ? (
          <ForbiddenState />
        ) : loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="mb-5 flex flex-col gap-3 font-ui sm:flex-row">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400"><SearchIcon /></span>
                <input
                  type="text"
                  placeholder="Pesquisar por título ou autor…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent pl-10 pr-4 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ReadingStatus | "")}
                className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="">Todos os estados</option>
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "recent" | "old")}
                className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="recent">Mais recentes</option>
                <option value="old">Mais antigas</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <EmptyState hasFilter={!!search || !!filterStatus} onClear={() => { setSearch(""); setFilterStatus(""); }} />
            ) : (
              <div className="space-y-3">
                {filtered.map((r) => (
                  <ReadingRow
                    key={r.id}
                    reading={r}
                    isAdmin={!!isAdmin}
                    onClick={() => navigate(`/readings/${r.id}`)}
                    onEdit={() => openEdit(r)}
                    onDelete={() => { setDeleteReading(r); setDeleteModalOpen(true); }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} className="max-w-lg p-6 sm:p-8">
        <h2 className="mb-6 font-heading text-xl text-gray-900 dark:text-white">
          {editingReading ? "Editar Leitura" : "Nova Leitura"}
        </h2>
        <div className="space-y-4 font-ui">

          {/* Livro */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Livro <span className="text-error-500">*</span>
            </label>
            <select
              value={form.book}
              onChange={(e) => setForm({ ...form, book: e.target.value })}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="">Selecionar livro</option>
              {books.map((b) => (
                <option key={b.id} value={String(b.id)}>
                  {b.title} — {authorFullName(b.author)}
                </option>
              ))}
            </select>
          </div>

          {/* Sugerido por */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Sugerido por
            </label>
            <select
              value={form.suggested_by}
              onChange={(e) => setForm({ ...form, suggested_by: e.target.value })}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="">Nenhum</option>
              {members.map((m) => (
                <option key={m.id} value={String(m.id)}>
                  {m.full_name || m.email}
                </option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Estado <span className="text-error-500">*</span>
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ReadingStatus })}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="">Selecionar estado</option>
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Data de início <span className="text-error-500">*</span>
              </label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Data de fim</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
          </div>

          {/* Participantes */}
          {members.length > 0 && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Participantes
                <span className="ml-2 text-xs font-normal text-gray-400">
                  ({form.users.length} selecionado{form.users.length !== 1 ? "s" : ""})
                </span>
              </label>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-300 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
                {members.map((m) => {
                  const selected = form.users.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleMember(m.id)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        selected ? "bg-brand-50 dark:bg-brand-500/10" : ""
                      }`}
                    >
                      {/* Avatar */}
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        selected
                          ? "bg-brand-500 text-white"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                      }`}>
                        {(m.full_name || m.email).slice(0, 1).toUpperCase()}
                      </span>
                      <span className="flex-1 truncate text-gray-700 dark:text-gray-200">
                        {m.full_name || m.email}
                      </span>
                      {selected && (
                        <CheckIcon className="h-4 w-4 shrink-0 text-brand-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {formError && (
            <p className="rounded-lg bg-error-50 px-4 py-2.5 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">{formError}</p>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={closeModal} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "A guardar…" : editingReading ? "Guardar alterações" : "Criar leitura"}
          </Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} className="max-w-sm p-6 sm:p-8">
        <div className="flex flex-col items-center text-center font-ui">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-50 dark:bg-error-500/15">
            <TrashIcon className="h-7 w-7 text-error-500" />
          </div>
          <h2 className="mb-2 font-heading text-lg text-gray-900 dark:text-white">Eliminar leitura?</h2>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            A leitura de <strong>"{deleteReading?.book.title}"</strong> e todos os seus encontros serão eliminados. Esta ação não pode ser desfeita.
          </p>
          <div className="flex w-full gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>Cancelar</Button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 rounded-lg bg-error-500 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-error-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "A eliminar…" : "Eliminar"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ── Sub-components (mantidos iguais) ──────────────────────────────────────────

function ReadingRow({ reading, isAdmin, onClick, onEdit, onDelete }: {
  reading: Reading; isAdmin: boolean;
  onClick: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const status = reading.status ?? "PLANNED";
  const { label, color } = statusConfig[status];

  return (
    <div className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs transition hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-900"
      onClick={onClick}>
      <div className="flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-500/10 dark:to-brand-600/20">
        {reading.book.cover ? (
          <img src={reading.book.cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-lg font-bold text-brand-400 dark:text-brand-300 select-none">
            {reading.book.title.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <p className="truncate font-heading text-base text-gray-900 dark:text-white">{reading.book.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{authorFullName(reading.book.author)}</p>
        {/* Sugerido por */}
        {reading.suggested_by && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            💡 Sugerido por <span className="font-medium">{reading.suggested_by.full_name || reading.suggested_by.email}</span>
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" />{formatDate(reading.start_date)}</span>
          {reading.end_date && <span>→ {formatDate(reading.end_date)}</span>}
          <span className="flex items-center gap-1"><UsersIcon className="h-3 w-3" />{reading.participants.length} participante{reading.participants.length !== 1 ? "s" : ""}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <Badge color={color} size="sm">{label}</Badge>
        {isAdmin && (
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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

function ForbiddenState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-warning-200 bg-warning-50 py-20 text-center dark:border-warning-500/20 dark:bg-warning-500/5">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-warning-100 dark:bg-warning-500/15">
        <LockIcon className="h-7 w-7 text-warning-600 dark:text-warning-400" />
      </div>
      <h3 className="mb-1 font-heading text-base text-warning-700 dark:text-warning-400">Subscrição necessária</h3>
      <p className="text-sm text-warning-600 dark:text-warning-500">É necessária uma subscrição ativa para aceder às leituras.</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="h-16 w-12 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/2 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-3 w-1/3 rounded bg-gray-100 dark:bg-gray-800" />
          </div>
          <div className="h-6 w-20 rounded-full bg-gray-100 dark:bg-gray-800" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ hasFilter, onClear }: { hasFilter: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <BookOpenIcon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-1 font-heading text-base text-gray-900 dark:text-white">
        {hasFilter ? "Nenhuma leitura encontrada" : "Ainda não há leituras"}
      </h3>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {hasFilter ? "Tenta mudar os filtros." : "Cria a primeira leitura do clube."}
      </p>
      {hasFilter && <Button variant="outline" size="sm" onClick={onClear}>Limpar filtros</Button>}
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function PlusIcon() { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>; }
function SearchIcon() { return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>; }
function CheckIcon({ className }: { className?: string }) { return <svg className={className ?? "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>; }
function EditIcon({ className }: { className?: string }) { return <svg className={className ?? "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>; }
function TrashIcon({ className }: { className?: string }) { return <svg className={className ?? "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" /></svg>; }
function CalendarIcon({ className }: { className?: string }) { return <svg className={className ?? "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" /></svg>; }
function UsersIcon({ className }: { className?: string }) { return <svg className={className ?? "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" /></svg>; }
function LockIcon({ className }: { className?: string }) { return <svg className={className ?? "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" /></svg>; }
function BookOpenIcon({ className }: { className?: string }) { return <svg className={className ?? "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>; }
