import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { apiRequest } from "../../api/client";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import { Table, TableHeader, TableBody, TableRow, Th, Td } from "../../components/ui/table/Table";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Quote {
  id: number;
  text: string;
  attribution: string;
  order: number;
  is_active: boolean;
}

interface QuoteForm {
  text: string;
  attribution: string;
  order: number;
  is_active: boolean;
}

const EMPTY_FORM: QuoteForm = {
  text: "",
  attribution: "",
  order: 0,
  is_active: true,
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function QuotesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [form, setForm] = useState<QuoteForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteQuote, setDeleteQuote] = useState<Quote | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function fetchAll() {
    setLoading(true);
    const q = await apiRequest<Quote[]>("/club/quotes/").catch(() => [] as Quote[]);
    setQuotes(q);
    setLoading(false);
  }

  useEffect(() => {
    if (user?.is_admin) {
      fetchAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.is_admin]);

  if (!user?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  function openCreate() {
    setEditingQuote(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(quote: Quote) {
    setEditingQuote(quote);
    setForm({
      text: quote.text,
      attribution: quote.attribution,
      order: quote.order,
      is_active: quote.is_active,
    });
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingQuote(null);
    setForm(EMPTY_FORM);
    setFormError("");
  }

  async function handleSave() {
    if (!form.text.trim()) {
      setFormError("Informe o texto da citação.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const payload = {
        text: form.text.trim(),
        attribution: form.attribution.trim(),
        order: form.order,
        is_active: form.is_active,
      };
      if (editingQuote) {
        await apiRequest(`/club/quotes/${editingQuote.id}/`, "PATCH", payload);
        showToast("success", "Citação atualizada", "As alterações foram guardadas com sucesso.");
      } else {
        await apiRequest("/club/quotes/", "POST", payload);
        showToast("success", "Citação criada", "A citação foi criada com sucesso.");
      }
      closeModal();
      await fetchAll();
    } catch {
      setFormError("Não foi possível guardar a citação. Verifica os dados informados.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteQuote) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await apiRequest(`/club/quotes/${deleteQuote.id}/`, "DELETE", undefined, { silent: true });
      setDeleteModalOpen(false);
      setDeleteQuote(null);
      await fetchAll();
    } catch {
      setDeleteError("Não foi possível eliminar a citação.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageMeta title="Citações | Clube de Leitura" description="Citações exibidas no carrossel da landing page" />
      <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6">
        <PageBreadCrumb pageTitle="Citações" />

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
              />
            ))}
          </div>
        ) : (
          <section>
            <PageHeader
              title="Vozes do clube"
              description="Citações exibidas no carrossel da landing page, na ordem definida abaixo."
              actions={
                <Button onClick={openCreate} startIcon={<PlusIcon />}>
                  Nova citação
                </Button>
              }
            />

            {quotes.length === 0 ? (
              <EmptyState
                title="Nenhuma citação criada"
                description="Adicione a primeira citação para exibir no carrossel da landing page."
                action={
                  <Button onClick={openCreate} startIcon={<PlusIcon />}>
                    Nova citação
                  </Button>
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <Th>Citação</Th>
                  <Th>Atribuição</Th>
                  <Th>Ordem</Th>
                  <Th>Estado</Th>
                  <Th />
                </TableHeader>
                <TableBody>
                  {quotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <Td className="max-w-sm">
                        <div className="line-clamp-2 text-gray-900 dark:text-white">{quote.text}</div>
                      </Td>
                      <Td>{quote.attribution || "—"}</Td>
                      <Td>{quote.order}</Td>
                      <Td>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            quote.is_active
                              ? "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {quote.is_active ? "Ativa" : "Inativa"}
                        </span>
                      </Td>
                      <Td>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(quote)}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              setDeleteQuote(quote);
                              setDeleteError("");
                              setDeleteModalOpen(true);
                            }}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-error-50 hover:text-error-500 dark:hover:bg-error-500/10"
                            title="Eliminar"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </Td>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} className="max-w-md p-6 sm:p-8">
        <h2 className="mb-6 font-heading text-xl text-gray-900 dark:text-white">
          {editingQuote ? "Editar citação" : "Nova citação"}
        </h2>
        <div className="space-y-4 font-ui">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Texto <span className="text-error-500">*</span>
            </label>
            <textarea
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              rows={4}
              placeholder="Ex: Ler é sonhar de olhos abertos."
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Atribuição
            </label>
            <input
              type="text"
              value={form.attribution}
              onChange={(e) => setForm({ ...form, attribution: e.target.value })}
              placeholder="Ex: uma data, ou 'Sonhos Literários'"
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Não usar o nome de uma pessoa a menos que ela tenha realmente dito essa frase.
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ordem de exibição
            </label>
            <input
              type="number"
              min={0}
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
            />
            Citação ativa (visível no carrossel do site)
          </label>
          {formError && (
            <p className="rounded-lg bg-error-50 px-4 py-2.5 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
              {formError}
            </p>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={closeModal} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "A guardar…" : editingQuote ? "Guardar alterações" : "Criar citação"}
          </Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} className="max-w-sm p-6 sm:p-8">
        <div className="flex flex-col items-center text-center font-ui">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-50 dark:bg-error-500/15">
            <TrashIcon className="h-7 w-7 text-error-500" />
          </div>
          <h2 className="mb-2 font-heading text-lg text-gray-900 dark:text-white">Eliminar citação?</h2>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">Esta citação será eliminada permanentemente.</p>
          {deleteError && (
            <p className="mb-4 w-full rounded-lg bg-error-50 px-4 py-2.5 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
              {deleteError}
            </p>
          )}
          <div className="flex w-full gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
              Cancelar
            </Button>
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

// ── Icons ─────────────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16"
      />
    </svg>
  );
}
