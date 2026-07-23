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

interface Member {
  id: number;
  email: string;
  full_name: string;
}

interface InviteCode {
  id: number;
  code: string;
  is_active: boolean;
  max_uses: number;
  used_count: number;
  created_at: string;
}

interface InviteForm {
  code: string;
  max_uses: number;
}

const EMPTY_FORM: InviteForm = { code: "", max_uses: 1 };

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MembersPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<InviteForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteInvite, setDeleteInvite] = useState<InviteCode | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function fetchAll() {
    setLoading(true);
    const [m, i] = await Promise.all([
      apiRequest<Member[]>("/auth/members/").catch(() => [] as Member[]),
      apiRequest<InviteCode[]>("/auth/invite-codes/").catch(() => [] as InviteCode[]),
    ]);
    setMembers(m);
    setInvites(i);
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
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setForm(EMPTY_FORM);
    setFormError("");
  }

  async function handleSave() {
    if (!form.code.trim()) {
      setFormError("Informe um código.");
      return;
    }
    if (!form.max_uses || form.max_uses < 1) {
      setFormError("O número de usos deve ser pelo menos 1.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await apiRequest("/auth/invite-codes/", "POST", {
        code: form.code.trim(),
        max_uses: form.max_uses,
        is_active: true,
      });
      showToast("success", "Código criado", "O convite foi criado com sucesso.");
      closeModal();
      await fetchAll();
    } catch {
      setFormError("Erro ao criar. Verifica se o código já existe.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(invite: InviteCode) {
    try {
      await apiRequest(`/auth/invite-codes/${invite.id}/`, "PATCH", {
        is_active: !invite.is_active,
      });
      await fetchAll();
    } catch {
      showToast("error", "Erro", "Não foi possível atualizar o código.");
    }
  }

  async function handleDelete() {
    if (!deleteInvite) return;
    setDeleting(true);
    try {
      await apiRequest(`/auth/invite-codes/${deleteInvite.id}/`, "DELETE");
      setDeleteModalOpen(false);
      setDeleteInvite(null);
      await fetchAll();
    } catch {
      showToast("error", "Erro", "Não foi possível eliminar o código.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageMeta title="Membros | Clube de Leitura" description="Gestão de membros e convites" />
      <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6">
        <PageBreadCrumb pageTitle="Membros" />

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
            {/* ── Membros ─────────────────────────────────────────────── */}
            <section>
              <PageHeader
                title="Membros"
                description={`${members.length} membro${members.length !== 1 ? "s" : ""} ativo${members.length !== 1 ? "s" : ""}`}
              />

              {members.length === 0 ? (
                <EmptyState title="Nenhum membro encontrado" />
              ) : (
                <Table>
                  <TableHeader>
                    <Th>Nome</Th>
                    <Th>Email</Th>
                  </TableHeader>
                  <TableBody>
                    {members.map((m) => (
                      <TableRow key={m.id}>
                        <Td className="text-gray-800 dark:text-white/80">
                          {m.full_name || "—"}
                        </Td>
                        <Td>{m.email}</Td>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </section>

            {/* ── Códigos de convite ──────────────────────────────────── */}
            <section>
              <PageHeader
                title="Códigos de convite"
                description="Gere e controla os códigos usados no cadastro de novos membros."
                actions={
                  <Button onClick={openCreate} startIcon={<PlusIcon />}>
                    Novo código
                  </Button>
                }
              />

              {invites.length === 0 ? (
                <EmptyState
                  title="Nenhum código de convite criado"
                  action={
                    <Button onClick={openCreate} startIcon={<PlusIcon />}>
                      Novo código
                    </Button>
                  }
                />
              ) : (
                <Table>
                  <TableHeader>
                    <Th>Código</Th>
                    <Th>Usos</Th>
                    <Th>Criado em</Th>
                    <Th>Estado</Th>
                    <Th />
                  </TableHeader>
                  <TableBody>
                    {invites.map((inv) => (
                      <TableRow key={inv.id}>
                        <Td className="font-mono text-gray-900 dark:text-white">{inv.code}</Td>
                        <Td>
                          {inv.used_count} / {inv.max_uses}
                        </Td>
                        <Td>{formatDate(inv.created_at)}</Td>
                        <Td>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              inv.is_active
                                ? "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {inv.is_active ? "Ativo" : "Inativo"}
                          </span>
                        </Td>
                        <Td>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => toggleActive(inv)}
                              className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                              {inv.is_active ? "Desativar" : "Ativar"}
                            </button>
                            <button
                              onClick={() => {
                                setDeleteInvite(inv);
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
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} className="max-w-md p-6 sm:p-8">
        <h2 className="mb-6 font-heading text-xl text-gray-900 dark:text-white">Novo código de convite</h2>
        <div className="space-y-4 font-ui">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Código <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="EX: CLUBE-2026"
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Número máximo de usos <span className="text-error-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={form.max_uses}
              onChange={(e) => setForm({ ...form, max_uses: Number(e.target.value) })}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
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
            {saving ? "A criar…" : "Criar código"}
          </Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} className="max-w-sm p-6 sm:p-8">
        <div className="flex flex-col items-center text-center font-ui">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-50 dark:bg-error-500/15">
            <TrashIcon className="h-7 w-7 text-error-500" />
          </div>
          <h2 className="mb-2 font-heading text-lg text-gray-900 dark:text-white">Eliminar código?</h2>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            O código <strong>"{deleteInvite?.code}"</strong> será eliminado permanentemente.
          </p>
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
