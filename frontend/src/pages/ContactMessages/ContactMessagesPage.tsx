import { useEffect, useMemo, useState } from "react";
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

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ContactMessagesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"recent" | "old">("recent");

  const [viewingMessage, setViewingMessage] = useState<ContactMessage | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function fetchAll() {
    setLoading(true);
    const m = await apiRequest<ContactMessage[]>("/club/contact-messages/").catch(
      () => [] as ContactMessage[]
    );
    setMessages(m);
    setLoading(false);
  }

  useEffect(() => {
    if (user?.is_admin) {
      fetchAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.is_admin]);

  const sortedMessages = useMemo(
    () =>
      [...messages].sort((a, b) =>
        sortOrder === "recent"
          ? b.created_at.localeCompare(a.created_at)
          : a.created_at.localeCompare(b.created_at)
      ),
    [messages, sortOrder]
  );

  if (!user?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  async function openMessage(message: ContactMessage) {
    setViewingMessage(message);
    setViewModalOpen(true);
    if (!message.is_read) {
      try {
        await apiRequest(`/club/contact-messages/${message.id}/`, "PATCH", { is_read: true }, { silent: true });
        setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, is_read: true } : m)));
      } catch {
        // Não crítico — a mensagem continua legível no modal mesmo se a marcação falhar.
      }
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await apiRequest(`/club/contact-messages/${deleteTarget.id}/`, "DELETE", undefined, { silent: true });
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      showToast("success", "Mensagem eliminada", "A mensagem foi removida com sucesso.");
      await fetchAll();
    } catch {
      setDeleteError("Não foi possível eliminar a mensagem.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageMeta title="Mensagens | Clube de Leitura" description="Mensagens recebidas pelo formulário de contato da landing page" />
      <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6">
        <PageBreadCrumb pageTitle="Mensagens" />

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
              title="Mensagens de contato"
              description="Enviadas pelo formulário público na landing page."
            />

            {messages.length === 0 ? (
              <EmptyState
                title="Nenhuma mensagem recebida"
                description="Mensagens enviadas pelo formulário de contato da landing page aparecem aqui."
              />
            ) : (
              <>
                <div className="mb-4 flex justify-end font-ui">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as "recent" | "old")}
                    className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option value="recent">Mais recentes</option>
                    <option value="old">Mais antigas</option>
                  </select>
                </div>
                <Table>
                <TableHeader>
                  <Th>Nome</Th>
                  <Th>Mensagem</Th>
                  <Th>Data</Th>
                  <Th>Estado</Th>
                  <Th />
                </TableHeader>
                <TableBody>
                  {sortedMessages.map((message) => (
                    <TableRow
                      key={message.id}
                      onClick={() => openMessage(message)}
                      className="cursor-pointer"
                    >
                      <Td>
                        <div className="font-medium text-gray-900 dark:text-white">{message.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{message.email}</div>
                      </Td>
                      <Td className="max-w-sm">
                        <div className="line-clamp-1 text-gray-700 dark:text-gray-300">{message.message}</div>
                      </Td>
                      <Td className="whitespace-nowrap">
                        {formatDate(message.created_at)}
                      </Td>
                      <Td>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            message.is_read
                              ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                              : "bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                          }`}
                        >
                          {message.is_read ? "Lida" : "Nova"}
                        </span>
                      </Td>
                      <Td>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(message);
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
              </>
            )}
          </section>
        )}
      </div>

      {/* View Modal */}
      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} className="max-w-lg p-6 sm:p-8">
        {viewingMessage && (
          <div className="font-ui">
            <h2 className="mb-1 font-heading text-xl text-gray-900 dark:text-white">{viewingMessage.name}</h2>
            <a
              href={`mailto:${viewingMessage.email}`}
              className="mb-4 inline-block text-sm text-brand-600 hover:underline dark:text-brand-400"
            >
              {viewingMessage.email}
            </a>
            <p className="mb-6 whitespace-pre-wrap rounded-lg bg-gray-50 p-4 font-body text-sm text-gray-700 dark:bg-gray-800/50 dark:text-gray-300">
              {viewingMessage.message}
            </p>
            <p className="mb-6 text-xs text-gray-400 dark:text-gray-500">
              Recebida em {formatDate(viewingMessage.created_at)}
            </p>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} className="max-w-sm p-6 sm:p-8">
        <div className="flex flex-col items-center text-center font-ui">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-50 dark:bg-error-500/15">
            <TrashIcon className="h-7 w-7 text-error-500" />
          </div>
          <h2 className="mb-2 font-heading text-lg text-gray-900 dark:text-white">Eliminar mensagem?</h2>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            A mensagem de <strong>{deleteTarget?.name}</strong> será eliminada permanentemente.
          </p>
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
