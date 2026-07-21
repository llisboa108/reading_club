import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { apiRequest } from "../../api/client";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Author {
  id: number;
  first_name: string;
  last_name: string;
}

interface Publisher {
  id: number;
  name: string;
}

interface AuthorForm {
  first_name: string;
  last_name: string;
}

interface PublisherForm {
  name: string;
}

const EMPTY_AUTHOR_FORM: AuthorForm = { first_name: "", last_name: "" };
const EMPTY_PUBLISHER_FORM: PublisherForm = { name: "" };

// ── Helpers ───────────────────────────────────────────────────────────────────

function authorFullName(a: Author) {
  return [a.first_name, a.last_name].filter(Boolean).join(" ");
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AuthorsPublishersPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);

  // Author modal
  const [authorModalOpen, setAuthorModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [authorForm, setAuthorForm] = useState<AuthorForm>(EMPTY_AUTHOR_FORM);
  const [savingAuthor, setSavingAuthor] = useState(false);
  const [authorFormError, setAuthorFormError] = useState("");

  // Publisher modal
  const [publisherModalOpen, setPublisherModalOpen] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(null);
  const [publisherForm, setPublisherForm] = useState<PublisherForm>(EMPTY_PUBLISHER_FORM);
  const [savingPublisher, setSavingPublisher] = useState(false);
  const [publisherFormError, setPublisherFormError] = useState("");

  // Delete confirm
  const [deleteAuthor, setDeleteAuthor] = useState<Author | null>(null);
  const [deletePublisher, setDeletePublisher] = useState<Publisher | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchAll() {
    setLoading(true);
    const [a, p] = await Promise.all([
      apiRequest<Author[]>("/club/authors/").catch(() => [] as Author[]),
      apiRequest<Publisher[]>("/club/publishers/").catch(() => [] as Publisher[]),
    ]);
    setAuthors(a);
    setPublishers(p);
    setLoading(false);
  }

  useEffect(() => {
    if (user?.is_admin) {
      fetchAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.is_admin]);

  if (!user?.is_admin) {
    return <Navigate to="/" replace />;
  }

  // ── Author handlers ────────────────────────────────────────────────────────

  function openCreateAuthor() {
    setEditingAuthor(null);
    setAuthorForm(EMPTY_AUTHOR_FORM);
    setAuthorFormError("");
    setAuthorModalOpen(true);
  }

  function openEditAuthor(author: Author) {
    setEditingAuthor(author);
    setAuthorForm({ first_name: author.first_name, last_name: author.last_name });
    setAuthorFormError("");
    setAuthorModalOpen(true);
  }

  function closeAuthorModal() {
    setAuthorModalOpen(false);
    setEditingAuthor(null);
    setAuthorForm(EMPTY_AUTHOR_FORM);
    setAuthorFormError("");
  }

  async function handleSaveAuthor() {
    if (!authorForm.first_name.trim()) {
      setAuthorFormError("Nome é obrigatório.");
      return;
    }
    setSavingAuthor(true);
    setAuthorFormError("");
    try {
      if (editingAuthor) {
        await apiRequest(`/club/authors/${editingAuthor.id}/`, "PATCH", authorForm);
      } else {
        await apiRequest("/club/authors/", "POST", authorForm);
      }
      showToast("success", "Autor guardado", "As alterações foram guardadas com sucesso.");
      closeAuthorModal();
      await fetchAll();
    } catch {
      setAuthorFormError("Erro ao guardar. Tente novamente.");
    } finally {
      setSavingAuthor(false);
    }
  }

  async function handleDeleteAuthor() {
    if (!deleteAuthor) return;
    setDeleting(true);
    try {
      await apiRequest(`/club/authors/${deleteAuthor.id}/`, "DELETE");
      setDeleteAuthor(null);
      await fetchAll();
    } catch {
      showToast("error", "Erro", "Não foi possível eliminar o autor.");
    } finally {
      setDeleting(false);
    }
  }

  // ── Publisher handlers ─────────────────────────────────────────────────────

  function openCreatePublisher() {
    setEditingPublisher(null);
    setPublisherForm(EMPTY_PUBLISHER_FORM);
    setPublisherFormError("");
    setPublisherModalOpen(true);
  }

  function openEditPublisher(publisher: Publisher) {
    setEditingPublisher(publisher);
    setPublisherForm({ name: publisher.name });
    setPublisherFormError("");
    setPublisherModalOpen(true);
  }

  function closePublisherModal() {
    setPublisherModalOpen(false);
    setEditingPublisher(null);
    setPublisherForm(EMPTY_PUBLISHER_FORM);
    setPublisherFormError("");
  }

  async function handleSavePublisher() {
    if (!publisherForm.name.trim()) {
      setPublisherFormError("Nome é obrigatório.");
      return;
    }
    setSavingPublisher(true);
    setPublisherFormError("");
    try {
      if (editingPublisher) {
        await apiRequest(`/club/publishers/${editingPublisher.id}/`, "PATCH", publisherForm);
      } else {
        await apiRequest("/club/publishers/", "POST", publisherForm);
      }
      showToast("success", "Editora guardada", "As alterações foram guardadas com sucesso.");
      closePublisherModal();
      await fetchAll();
    } catch {
      setPublisherFormError("Erro ao guardar. Tente novamente.");
    } finally {
      setSavingPublisher(false);
    }
  }

  async function handleDeletePublisher() {
    if (!deletePublisher) return;
    setDeleting(true);
    try {
      await apiRequest(`/club/publishers/${deletePublisher.id}/`, "DELETE");
      setDeletePublisher(null);
      await fetchAll();
    } catch {
      showToast("error", "Erro", "Não foi possível eliminar a editora.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageMeta title="Autores e Editoras | Clube de Leitura" description="Gestão de autores e editoras" />
      <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6">
        <PageBreadCrumb pageTitle="Autores e Editoras" />

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* ── Autores ─────────────────────────────────────────────── */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Autores</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {authors.length} autor{authors.length !== 1 ? "es" : ""} cadastrado{authors.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <Button onClick={openCreateAuthor} startIcon={<PlusIcon />}>
                  Novo autor
                </Button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Nome
                      </th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {authors.length === 0 && (
                      <tr>
                        <td colSpan={2} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                          Nenhum autor cadastrado.
                        </td>
                      </tr>
                    )}
                    {authors.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                        <td className="px-6 py-3 text-gray-800 dark:text-white/80">{authorFullName(a)}</td>
                        <td className="px-6 py-3">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => openEditAuthor(a)}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                              title="Editar"
                            >
                              <EditIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteAuthor(a)}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-error-50 hover:text-error-500 dark:hover:bg-error-500/10"
                              title="Eliminar"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── Editoras ────────────────────────────────────────────── */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Editoras</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {publishers.length} editora{publishers.length !== 1 ? "s" : ""} cadastrada{publishers.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <Button onClick={openCreatePublisher} startIcon={<PlusIcon />}>
                  Nova editora
                </Button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Nome
                      </th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {publishers.length === 0 && (
                      <tr>
                        <td colSpan={2} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                          Nenhuma editora cadastrada.
                        </td>
                      </tr>
                    )}
                    {publishers.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                        <td className="px-6 py-3 text-gray-800 dark:text-white/80">{p.name}</td>
                        <td className="px-6 py-3">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => openEditPublisher(p)}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                              title="Editar"
                            >
                              <EditIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeletePublisher(p)}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-error-50 hover:text-error-500 dark:hover:bg-error-500/10"
                              title="Eliminar"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Author create/edit modal */}
      <Modal isOpen={authorModalOpen} onClose={closeAuthorModal} className="max-w-md p-6 sm:p-8">
        <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
          {editingAuthor ? "Editar autor" : "Novo autor"}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nome <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              value={authorForm.first_name}
              onChange={(e) => setAuthorForm({ ...authorForm, first_name: e.target.value })}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Sobrenome</label>
            <input
              type="text"
              value={authorForm.last_name}
              onChange={(e) => setAuthorForm({ ...authorForm, last_name: e.target.value })}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
          {authorFormError && (
            <p className="rounded-lg bg-error-50 px-4 py-2.5 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
              {authorFormError}
            </p>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={closeAuthorModal} disabled={savingAuthor}>
            Cancelar
          </Button>
          <Button onClick={handleSaveAuthor} disabled={savingAuthor}>
            {savingAuthor ? "A guardar…" : editingAuthor ? "Guardar alterações" : "Criar autor"}
          </Button>
        </div>
      </Modal>

      {/* Publisher create/edit modal */}
      <Modal isOpen={publisherModalOpen} onClose={closePublisherModal} className="max-w-md p-6 sm:p-8">
        <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
          {editingPublisher ? "Editar editora" : "Nova editora"}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nome <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              value={publisherForm.name}
              onChange={(e) => setPublisherForm({ name: e.target.value })}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
          {publisherFormError && (
            <p className="rounded-lg bg-error-50 px-4 py-2.5 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
              {publisherFormError}
            </p>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={closePublisherModal} disabled={savingPublisher}>
            Cancelar
          </Button>
          <Button onClick={handleSavePublisher} disabled={savingPublisher}>
            {savingPublisher ? "A guardar…" : editingPublisher ? "Guardar alterações" : "Criar editora"}
          </Button>
        </div>
      </Modal>

      {/* Delete author modal */}
      <Modal isOpen={!!deleteAuthor} onClose={() => setDeleteAuthor(null)} className="max-w-sm p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-50 dark:bg-error-500/15">
            <TrashIcon className="h-7 w-7 text-error-500" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Eliminar autor?</h2>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            {deleteAuthor && (
              <>
                <strong>"{authorFullName(deleteAuthor)}"</strong> será eliminado permanentemente. Isso falha se
                houver livros associados a esse autor.
              </>
            )}
          </p>
          <div className="flex w-full gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteAuthor(null)} disabled={deleting}>
              Cancelar
            </Button>
            <button
              onClick={handleDeleteAuthor}
              disabled={deleting}
              className="flex-1 rounded-lg bg-error-500 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-error-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "A eliminar…" : "Eliminar"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete publisher modal */}
      <Modal isOpen={!!deletePublisher} onClose={() => setDeletePublisher(null)} className="max-w-sm p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-50 dark:bg-error-500/15">
            <TrashIcon className="h-7 w-7 text-error-500" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Eliminar editora?</h2>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            {deletePublisher && (
              <>
                <strong>"{deletePublisher.name}"</strong> será eliminada permanentemente. Isso falha se houver
                livros associados a essa editora.
              </>
            )}
          </p>
          <div className="flex w-full gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeletePublisher(null)} disabled={deleting}>
              Cancelar
            </Button>
            <button
              onClick={handleDeletePublisher}
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

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
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
