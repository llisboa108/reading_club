import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { apiRequest } from "../../api/client";
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

interface Announcement {
  id: number;
  subject: string;
  body_html: string;
  created_by_name: string;
  send_to_all: boolean;
  target_users: Member[];
  external_emails: string[];
  created_at: string;
  sent_at: string | null;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

// ── Rich text editor (compose body) ──────────────────────────────────────────

function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false })],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "min-h-[160px] rounded-b-lg border border-t-0 border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 prose prose-sm max-w-none dark:prose-invert",
      },
    },
  });

  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `rounded px-2 py-1 text-xs font-medium ${
      active
        ? "bg-brand-500 text-white"
        : "bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    }`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-gray-300 bg-gray-50 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800">
        <button type="button" className={btnClass(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}>Negrito</button>
        <button type="button" className={btnClass(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}>Itálico</button>
        <button type="button" className={btnClass(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}>Lista</button>
        <button
          type="button"
          className={btnClass(editor.isActive("link"))}
          onClick={() => {
            const url = window.prompt("URL do link:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
            else editor.chain().focus().unsetLink().run();
          }}
        >
          Link
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CommunicationsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [sendToAll, setSendToAll] = useState(true);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [externalEmails, setExternalEmails] = useState<string[]>([]);
  const [externalEmailInput, setExternalEmailInput] = useState("");
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");

  async function fetchAll() {
    setLoading(true);
    const [a, m] = await Promise.all([
      apiRequest<Announcement[]>("/communications/announcements/").catch(() => [] as Announcement[]),
      apiRequest<Member[]>("/auth/members/").catch(() => [] as Member[]),
    ]);
    setAnnouncements(a);
    setMembers(m);
    setLoading(false);
  }

  useEffect(() => {
    if (user?.is_admin) {
      fetchAll();
    }
  }, [user?.is_admin]);

  const filteredMembers = useMemo(() => {
    const term = memberSearch.trim().toLowerCase();
    if (!term) return members;
    return members.filter(
      (m) => m.full_name.toLowerCase().includes(term) || m.email.toLowerCase().includes(term)
    );
  }, [members, memberSearch]);

  if (!user?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  function toggleMember(id: number) {
    setSelectedMemberIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  function addExternalEmail() {
    const email = externalEmailInput.trim();
    if (!email) return;
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValid) {
      setFormError("Email externo inválido.");
      return;
    }
    if (!externalEmails.includes(email)) {
      setExternalEmails((prev) => [...prev, email]);
    }
    setExternalEmailInput("");
    setFormError("");
  }

  function removeExternalEmail(email: string) {
    setExternalEmails((prev) => prev.filter((e) => e !== email));
  }

  function resetForm() {
    setSubject("");
    setBodyHtml("");
    setSendToAll(true);
    setSelectedMemberIds([]);
    setExternalEmails([]);
    setExternalEmailInput("");
  }

  async function handleSend() {
    setFormError("");

    if (!subject.trim()) {
      setFormError("Informe um assunto.");
      return;
    }
    if (!bodyHtml.trim() || bodyHtml === "<p></p>") {
      setFormError("Escreva o conteúdo do comunicado.");
      return;
    }
    if (!sendToAll && selectedMemberIds.length === 0 && externalEmails.length === 0) {
      setFormError("Selecione ao menos um destinatário (membros ou emails externos).");
      return;
    }

    setSending(true);
    try {
      await apiRequest("/communications/announcements/", "POST", {
        subject,
        body_html: bodyHtml,
        send_to_all: sendToAll,
        target_user_ids: sendToAll ? [] : selectedMemberIds,
        external_emails: externalEmails,
      });
      showToast("success", "Comunicado enviado", "O comunicado foi enviado com sucesso.");
      resetForm();
      await fetchAll();
    } catch {
      setFormError("Não foi possível enviar o comunicado.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <PageMeta title="Comunicados | Clube de Leitura" description="Envio de comunicados por email para membros e destinatários externos" />
      <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6">
        <PageBreadCrumb pageTitle="Comunicados" />

        <section className="mb-8">
          <PageHeader
            title="Novo comunicado"
            description="Envie um email para todos os membros, membros selecionados e/ou emails externos."
          />

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4">
              <label className="mb-1.5 block font-ui text-sm font-medium text-gray-700 dark:text-gray-300">Assunto</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                placeholder="Ex.: Encontro remarcado para sábado"
              />
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block font-ui text-sm font-medium text-gray-700 dark:text-gray-300">Mensagem</label>
              <RichTextEditor value={bodyHtml} onChange={setBodyHtml} />
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 font-ui text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={sendToAll}
                  onChange={(e) => setSendToAll(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
                Enviar para todos os membros
              </label>
            </div>

            {!sendToAll && (
              <div className="mb-4">
                <label className="mb-1.5 block font-ui text-sm font-medium text-gray-700 dark:text-gray-300">
                  Membros ({selectedMemberIds.length} selecionado{selectedMemberIds.length === 1 ? "" : "s"})
                </label>
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Buscar por nome ou email…"
                  className="mb-2 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
                <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-800">
                  {filteredMembers.map((m) => (
                    <label
                      key={m.id}
                      className="flex cursor-pointer items-center gap-2 border-b border-gray-100 px-3 py-2 text-sm last:border-b-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMemberIds.includes(m.id)}
                        onChange={() => toggleMember(m.id)}
                        className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                      />
                      <span className="text-gray-800 dark:text-white/90">{m.full_name || m.email}</span>
                      <span className="text-xs text-gray-400">{m.email}</span>
                    </label>
                  ))}
                  {filteredMembers.length === 0 && (
                    <div className="px-3 py-4 text-center text-sm text-gray-400">Nenhum membro encontrado.</div>
                  )}
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="mb-1.5 block font-ui text-sm font-medium text-gray-700 dark:text-gray-300">
                Emails externos
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={externalEmailInput}
                  onChange={(e) => setExternalEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addExternalEmail();
                    }
                  }}
                  placeholder="alguem@exemplo.com"
                  className="h-10 flex-1 rounded-lg border border-gray-300 bg-transparent px-3 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
                <Button variant="outline" size="sm" onClick={addExternalEmail}>Adicionar</Button>
              </div>
              {externalEmails.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {externalEmails.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                    >
                      {email}
                      <button type="button" onClick={() => removeExternalEmail(email)} className="text-brand-400 hover:text-brand-600">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {formError && (
              <p className="mb-4 rounded-lg bg-error-50 px-4 py-2.5 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
                {formError}
              </p>
            )}

            <div className="flex justify-end">
              <Button onClick={handleSend} disabled={sending}>
                {sending ? "A enviar…" : "Enviar comunicado"}
              </Button>
            </div>
          </div>
        </section>

        <section>
          <PageHeader title="Histórico" description="Comunicados enviados anteriormente." />

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" />
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <EmptyState title="Nenhum comunicado enviado" description="Os comunicados enviados aparecem aqui." />
          ) : (
            <Table>
              <TableHeader>
                <Th>Assunto</Th>
                <Th>Destinatários</Th>
                <Th>Enviado por</Th>
                <Th>Data</Th>
                <Th>Status</Th>
              </TableHeader>
              <TableBody>
                {announcements.map((a) => (
                  <TableRow key={a.id}>
                    <Td>
                      <div className="font-medium text-gray-900 dark:text-white">{a.subject}</div>
                    </Td>
                    <Td>{a.recipient_count}</Td>
                    <Td>{a.created_by_name || "—"}</Td>
                    <Td className="whitespace-nowrap">{formatDate(a.created_at)}</Td>
                    <Td>
                      <span className="text-gray-700 dark:text-gray-300">
                        {a.sent_count} enviado{a.sent_count === 1 ? "" : "s"}
                        {a.failed_count > 0 && (
                          <span className="ml-1.5 text-error-500">· {a.failed_count} falha{a.failed_count === 1 ? "" : "s"}</span>
                        )}
                      </span>
                    </Td>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      </div>
    </>
  );
}
