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

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
  instagram: string;
  order: number;
  is_active: boolean;
}

interface TeamMemberForm {
  name: string;
  role: string;
  instagram: string;
  order: number;
  is_active: boolean;
  imageFile: File | null;
}

const EMPTY_FORM: TeamMemberForm = {
  name: "",
  role: "",
  instagram: "",
  order: 0,
  is_active: true,
  imageFile: null,
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function TeamMembersPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [form, setForm] = useState<TeamMemberForm>(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteMember, setDeleteMember] = useState<TeamMember | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function fetchAll() {
    setLoading(true);
    const m = await apiRequest<TeamMember[]>("/club/team-members/").catch(() => [] as TeamMember[]);
    setMembers(m);
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
    setEditingMember(null);
    setForm(EMPTY_FORM);
    setImagePreview(null);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(member: TeamMember) {
    setEditingMember(member);
    setForm({
      name: member.name,
      role: member.role,
      instagram: member.instagram,
      order: member.order,
      is_active: member.is_active,
      imageFile: null,
    });
    setImagePreview(member.image);
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingMember(null);
    setForm(EMPTY_FORM);
    setImagePreview(null);
    setFormError("");
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setFormError("Informe o nome.");
      return;
    }
    if (!editingMember && !form.imageFile) {
      setFormError("Escolha uma foto.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("role", form.role.trim());
      fd.append("instagram", form.instagram.trim());
      fd.append("order", String(form.order));
      fd.append("is_active", String(form.is_active));
      if (form.imageFile) fd.append("image", form.imageFile);

      if (editingMember) {
        await apiRequest(`/club/team-members/${editingMember.id}/`, "PATCH", fd);
        showToast("success", "Membro atualizado", "As alterações foram guardadas com sucesso.");
      } else {
        await apiRequest("/club/team-members/", "POST", fd);
        showToast("success", "Membro criado", "O membro foi adicionado à equipe da landing page.");
      }
      closeModal();
      await fetchAll();
    } catch {
      setFormError("Não foi possível guardar. Verifique os dados informados.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteMember) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await apiRequest(`/club/team-members/${deleteMember.id}/`, "DELETE", undefined, { silent: true });
      setDeleteModalOpen(false);
      setDeleteMember(null);
      await fetchAll();
    } catch {
      setDeleteError("Não foi possível eliminar o membro.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageMeta title="Equipe | Clube de Leitura" description="Membros exibidos na landing page" />
      <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6">
        <PageBreadCrumb pageTitle="Equipe" />

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
              title="Membros do clube"
              description='Exibidos na seção "Membros" da landing page, na ordem definida abaixo.'
              actions={
                <Button onClick={openCreate} startIcon={<PlusIcon />}>
                  Novo membro
                </Button>
              }
            />

            {members.length === 0 ? (
              <EmptyState
                title="Nenhum membro cadastrado"
                description="Adicione o primeiro membro para exibir na seção da landing page."
                action={
                  <Button onClick={openCreate} startIcon={<PlusIcon />}>
                    Novo membro
                  </Button>
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <Th>Membro</Th>
                  <Th>Papel</Th>
                  <Th>Ordem</Th>
                  <Th>Estado</Th>
                  <Th />
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <img
                            src={member.image}
                            alt={member.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <span className="font-medium text-gray-900 dark:text-white">{member.name}</span>
                        </div>
                      </Td>
                      <Td>{member.role || "—"}</Td>
                      <Td>{member.order}</Td>
                      <Td>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            member.is_active
                              ? "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {member.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </Td>
                      <Td>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(member)}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              setDeleteMember(member);
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
          {editingMember ? "Editar membro" : "Novo membro"}
        </h2>
        <div className="space-y-4 font-ui">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nome <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Ana Silva"
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Papel
            </label>
            <input
              type="text"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="Ex: Membro desde 2024"
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>

          {/* Foto */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Foto {!editingMember && <span className="text-error-500">*</span>}
            </label>
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                {imagePreview ? (
                  <img src={imagePreview} alt="Prévia" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-7 w-7 text-gray-300 dark:text-gray-600" />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 transition hover:border-brand-400 hover:text-brand-500 dark:border-gray-700 dark:text-gray-400 dark:hover:border-brand-500 dark:hover:text-brand-400">
                  <UploadIcon className="h-4 w-4 shrink-0" />
                  <span>{form.imageFile ? form.imageFile.name : "Escolher foto…"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setForm({ ...form, imageFile: file });
                      if (file) setImagePreview(URL.createObjectURL(file));
                    }}
                  />
                </label>
                <p className="text-xs text-gray-400">JPG, PNG ou WEBP. A imagem é recortada em círculo automaticamente.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Instagram (opcional)
            </label>
            <input
              type="url"
              value={form.instagram}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              placeholder="https://www.instagram.com/..."
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
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
            Membro ativo (visível na landing page)
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
            {saving ? "A guardar…" : editingMember ? "Guardar alterações" : "Criar membro"}
          </Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} className="max-w-sm p-6 sm:p-8">
        <div className="flex flex-col items-center text-center font-ui">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-50 dark:bg-error-500/15">
            <TrashIcon className="h-7 w-7 text-error-500" />
          </div>
          <h2 className="mb-2 font-heading text-lg text-gray-900 dark:text-white">Eliminar membro?</h2>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            <strong>{deleteMember?.name}</strong> será removido(a) da landing page permanentemente.
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

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L7 9m5-5 5 5M5 20h14" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}
