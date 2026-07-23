import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { apiRequest } from "../../api/client";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../components/common/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";

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

interface BookForm {
  title: string;
  subtitle: string;
  isbn: string;
  published_date: string;
  pages: string;
  author: string;
  publisher: string;
  coverFile: File | null;
  removeCover: boolean;
  // Cover URL returned by the ISBN lookup, used when no file was uploaded manually.
  coverUrl: string;
}

const EMPTY_FORM: BookForm = {
  title: "",
  subtitle: "",
  isbn: "",
  published_date: "",
  pages: "",
  author: "",
  publisher: "",
  coverFile: null,
  removeCover: false,
  coverUrl: "",
};

interface ISBNLookupResult {
  isbn: string;
  title: string;
  subtitle: string;
  published_date: string | null;
  pages: number | null;
  cover_url: string | null;
  author: Author | null;
  publisher: Publisher | null;
  already_registered: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function authorFullName(a: Author) {
  return [a.first_name, a.last_name].filter(Boolean).join(" ");
}

function getPagesBadge(pages: number) {
  if (pages < 200) return { color: "success" as const, label: "Curto" };
  if (pages < 400) return { color: "info" as const, label: "Médio" };
  return { color: "warning" as const, label: "Longo" };
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function BooksPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.is_admin;

  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAuthor, setFilterAuthor] = useState("");
  const [sortOrder, setSortOrder] = useState<"recent" | "old" | "title">("recent");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form, setForm] = useState<BookForm>(EMPTY_FORM);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // ISBN lookup
  const [lookingUpIsbn, setLookingUpIsbn] = useState(false);
  const [isbnLookupMessage, setIsbnLookupMessage] = useState("");

  // Delete confirm
  const [deleteBook, setDeleteBook] = useState<Book | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  async function fetchAll() {
    setLoading(true);
    try {
      const [b, a, p] = await Promise.all([
        apiRequest<Book[]>("/club/books/"),
        apiRequest<Author[]>("/club/authors/"),
        apiRequest<Publisher[]>("/club/publishers/"),
      ]);
      setBooks(b);
      setAuthors(a);
      setPublishers(p);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  // ── Filter ─────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return books
      .filter((b) => {
        const matchSearch =
          !search ||
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          authorFullName(b.author).toLowerCase().includes(search.toLowerCase()) ||
          (b.isbn && b.isbn.includes(search));
        const matchAuthor =
          !filterAuthor || String(b.author.id) === filterAuthor;
        return matchSearch && matchAuthor;
      })
      .sort((a, b) => {
        if (sortOrder === "title") return a.title.localeCompare(b.title, "pt-BR");
        return sortOrder === "recent" ? b.id - a.id : a.id - b.id;
      });
  }, [books, search, filterAuthor, sortOrder]);

  // ── Modal open/close ───────────────────────────────────────────────────────

  function openCreate() {
    setEditingBook(null);
    setForm(EMPTY_FORM);
    setCoverPreview(null);
    setFormError("");
    setIsbnLookupMessage("");
    setModalOpen(true);
  }

  function openEdit(book: Book) {
    setEditingBook(book);
    setForm({
      title: book.title,
      subtitle: book.subtitle || "",
      isbn: book.isbn || "",
      published_date: book.published_date || "",
      pages: String(book.pages),
      author: String(book.author.id),
      publisher: String(book.publisher.id),
      coverFile: null,
      removeCover: false,
      coverUrl: "",
    });
    setCoverPreview(book.cover || null);
    setFormError("");
    setIsbnLookupMessage("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setIsbnLookupMessage("");
    setEditingBook(null);
    setForm(EMPTY_FORM);
    setCoverPreview(null);
    setFormError("");
  }

  // ── ISBN lookup ────────────────────────────────────────────────────────────

  async function handleIsbnLookup() {
    if (!form.isbn.trim()) return;

    setLookingUpIsbn(true);
    setIsbnLookupMessage("");
    try {
      const result = await apiRequest<ISBNLookupResult>(
        `/club/books/lookup-isbn/?isbn=${encodeURIComponent(form.isbn.trim())}`
      );

      if (result.author && !authors.some((a) => a.id === result.author!.id)) {
        setAuthors((prev) => [...prev, result.author!]);
      }
      if (result.publisher && !publishers.some((p) => p.id === result.publisher!.id)) {
        setPublishers((prev) => [...prev, result.publisher!]);
      }

      setForm((prev) => ({
        ...prev,
        title: result.title || prev.title,
        subtitle: result.subtitle || prev.subtitle,
        published_date: result.published_date || prev.published_date,
        pages: result.pages ? String(result.pages) : prev.pages,
        author: result.author ? String(result.author.id) : prev.author,
        publisher: result.publisher ? String(result.publisher.id) : prev.publisher,
        coverFile: null,
        removeCover: false,
        coverUrl: result.cover_url || "",
      }));
      if (result.cover_url) setCoverPreview(result.cover_url);

      if (result.already_registered) {
        showToast(
          "warning",
          "Livro já cadastrado",
          "Já existe um livro com este ISBN no catálogo."
        );
      } else {
        showToast("success", "Livro encontrado", "Dados preenchidos a partir do ISBN.");
      }
    } catch (err: any) {
      setIsbnLookupMessage(err?.message || "Não foi possível buscar esse ISBN.");
    } finally {
      setLookingUpIsbn(false);
    }
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!form.title.trim()) { setFormError("Título é obrigatório."); return; }
    if (!form.author) { setFormError("Selecione um autor."); return; }
    if (!form.publisher) { setFormError("Selecione uma editora."); return; }
    if (!form.pages || isNaN(Number(form.pages))) { setFormError("Páginas inválidas."); return; }

    setSaving(true);
    setFormError("");
    try {
      // Usa FormData para suportar upload de imagem
      const fd = new FormData();
      fd.append("title", form.title);
      if (form.subtitle) fd.append("subtitle", form.subtitle);
      if (form.isbn) fd.append("isbn", form.isbn);
      if (form.published_date) fd.append("published_date", form.published_date);
      fd.append("pages", String(Number(form.pages)));
      fd.append("author", form.author);
      fd.append("publisher", form.publisher);
      if (form.coverFile) {
        fd.append("cover", form.coverFile);
      } else if (form.removeCover) {
        fd.append("cover", "");  // sinal para o backend limpar o campo
      } else if (form.coverUrl) {
        fd.append("cover_url", form.coverUrl);
      }

      if (editingBook) {
        await apiRequest(`/club/books/${editingBook.id}/`, "PATCH", fd);
      } else {
        await apiRequest("/club/books/", "POST", fd);
      }

      closeModal();
      await fetchAll();
    } catch {
      setFormError("Erro ao guardar. Verifique os campos e tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  function openDelete(book: Book) {
    setDeleteBook(book);
    setDeleteModalOpen(true);
  }

  async function handleDelete() {
    if (!deleteBook) return;
    setDeleting(true);
    try {
      await apiRequest(`/club/books/${deleteBook.id}/`, "DELETE");
      setDeleteModalOpen(false);
      setDeleteBook(null);
      await fetchAll();
    } finally {
      setDeleting(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <PageMeta title="Livros | Clube de Leitura" description="Catálogo de livros do clube" />

      <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6">
        <PageBreadCrumb pageTitle="Livros" />

        {/* Header */}
        <PageHeader
          title="Catálogo de Livros"
          description={`${books.length} livro${books.length !== 1 ? "s" : ""} no catálogo`}
          actions={
            isAdmin && (
              <Button onClick={openCreate} startIcon={<PlusIcon />}>
                Novo Livro
              </Button>
            )
          }
        />

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 font-ui sm:flex-row">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Pesquisar por título, autor ou ISBN…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent pl-10 pr-4 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>
          <select
            value={filterAuthor}
            onChange={(e) => setFilterAuthor(e.target.value)}
            className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            <option value="">Todos os autores</option>
            {authors.map((a) => (
              <option key={a.id} value={String(a.id)}>
                {authorFullName(a)}
              </option>
            ))}
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "recent" | "old" | "title")}
            className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            <option value="recent">Mais recentes</option>
            <option value="old">Mais antigos</option>
            <option value="title">Título (A-Z)</option>
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState hasSearch={!!search || !!filterAuthor} onClear={() => { setSearch(""); setFilterAuthor(""); }} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isAdmin={!!isAdmin}
                onView={() => navigate(`/books/${book.id}`)}
                onEdit={() => openEdit(book)}
                onDelete={() => openDelete(book)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} className="max-w-lg p-6 sm:p-8">
        <h2 className="mb-6 font-heading text-xl text-gray-900 dark:text-white">
          {editingBook ? "Editar Livro" : "Novo Livro"}
        </h2>

        <div className="space-y-4 font-ui">
          {/* Título */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Título <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Título do livro"
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>

          {/* Subtítulo */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Subtítulo
            </label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="Subtítulo (opcional)"
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>

          {/* Autor */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Autor <span className="text-error-500">*</span>
            </label>
            <select
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="">Selecionar autor</option>
              {authors.map((a) => (
                <option key={a.id} value={String(a.id)}>
                  {authorFullName(a)}
                </option>
              ))}
            </select>
          </div>

          {/* Editora */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Editora <span className="text-error-500">*</span>
            </label>
            <select
              value={form.publisher}
              onChange={(e) => setForm({ ...form, publisher: e.target.value })}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="">Selecionar editora</option>
              {publishers.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Páginas + ISBN */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Páginas <span className="text-error-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={form.pages}
                onChange={(e) => setForm({ ...form, pages: e.target.value })}
                placeholder="Ex: 320"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                ISBN
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.isbn}
                  onChange={(e) => {
                    setForm({ ...form, isbn: e.target.value });
                    setIsbnLookupMessage("");
                  }}
                  placeholder="Ex: 978-..."
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleIsbnLookup}
                  disabled={!form.isbn.trim() || lookingUpIsbn}
                >
                  {lookingUpIsbn ? "…" : "Buscar"}
                </Button>
              </div>
              {isbnLookupMessage && (
                <p className="mt-1.5 text-xs text-error-500">{isbnLookupMessage}</p>
              )}
            </div>
          </div>

          {/* Data de publicação */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Data de Publicação
            </label>
            <input
              type="date"
              value={form.published_date}
              onChange={(e) => setForm({ ...form, published_date: e.target.value })}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>

          {/* Capa */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Capa
            </label>
            <div className="flex items-start gap-4">
              {/* Preview */}
              <div className="flex h-28 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                {coverPreview && !form.removeCover ? (
                  <img src={coverPreview} alt="Capa" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-7 w-7 text-gray-300 dark:text-gray-600" />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 transition hover:border-brand-400 hover:text-brand-500 dark:border-gray-700 dark:text-gray-400 dark:hover:border-brand-500 dark:hover:text-brand-400">
                  <UploadIcon className="h-4 w-4 shrink-0" />
                  <span>{form.coverFile ? form.coverFile.name : "Escolher imagem…"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setForm({ ...form, coverFile: file, removeCover: false, coverUrl: "" });
                      if (file) setCoverPreview(URL.createObjectURL(file));
                    }}
                  />
                </label>
                {(coverPreview || form.coverFile) && !form.removeCover && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, coverFile: null, removeCover: true, coverUrl: "" });
                      setCoverPreview(null);
                    }}
                    className="text-left text-xs text-error-500 hover:underline"
                  >
                    Remover capa
                  </button>
                )}
                <p className="text-xs text-gray-400">JPG, PNG ou WEBP. Máx. 5 MB.</p>
              </div>
            </div>
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
            {saving ? "A guardar…" : editingBook ? "Guardar alterações" : "Criar livro"}
          </Button>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} className="max-w-sm p-6 sm:p-8">
        <div className="flex flex-col items-center text-center font-ui">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-50 dark:bg-error-500/15">
            <TrashIcon className="h-7 w-7 text-error-500" />
          </div>
          <h2 className="mb-2 font-heading text-lg text-gray-900 dark:text-white">
            Eliminar livro?
          </h2>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Tens a certeza que queres eliminar <strong>"{deleteBook?.title}"</strong>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex w-full gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
              Cancelar
            </Button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 rounded-lg bg-error-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-error-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "A eliminar…" : "Eliminar"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function BookCard({
  book,
  isAdmin,
  onView,
  onEdit,
  onDelete,
}: {
  book: Book;
  isAdmin: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { color, label } = getPagesBadge(book.pages);
  const initials = book.title.slice(0, 2).toUpperCase();

  return (
    <div className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs transition hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-900">
      {/* Cover */}
      <div
        className="mb-4 flex h-36 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-500/10 dark:to-brand-600/20"
        onClick={onView}
      >
        {book.cover ? (
          <img
            src={book.cover}
            alt={`Capa de ${book.title}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-4xl font-bold text-brand-400 dark:text-brand-300 select-none">
            {initials}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col font-ui">
        <h3
          className="mb-1 cursor-pointer line-clamp-2 font-heading text-base leading-snug text-gray-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
          onClick={onView}
        >
          {book.title}
        </h3>
        {book.subtitle && (
          <p className="mb-2 line-clamp-1 text-xs text-gray-400 dark:text-gray-500">
            {book.subtitle}
          </p>
        )}
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          {authorFullName(book.author)}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            <Badge color={color} size="sm">{label}</Badge>
            <Badge color="light" size="sm">{book.pages} pág.</Badge>
          </div>

          {isAdmin && (
            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={onEdit}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                title="Editar"
              >
                <EditIcon className="h-4 w-4" />
              </button>
              <button
                onClick={onDelete}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-error-50 hover:text-error-500 dark:hover:bg-error-500/10"
                title="Eliminar"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 h-36 rounded-xl bg-gray-100 dark:bg-gray-800" />
          <div className="mb-2 h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-800" />
          <div className="mb-3 h-3 w-1/2 rounded bg-gray-100 dark:bg-gray-800" />
          <div className="h-3 w-1/3 rounded bg-gray-100 dark:bg-gray-800" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ hasSearch, onClear }: { hasSearch: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <BookOpenIcon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-1 font-heading text-lg text-gray-900 dark:text-white">
        {hasSearch ? "Nenhum livro encontrado" : "Ainda não há livros"}
      </h3>
      <p className="mb-4 font-ui text-sm text-gray-500 dark:text-gray-400">
        {hasSearch ? "Tenta mudar os filtros de pesquisa." : "Adiciona o primeiro livro ao catálogo."}
      </p>
      {hasSearch && (
        <Button variant="outline" size="sm" onClick={onClear}>
          Limpar filtros
        </Button>
      )}
    </div>
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

function SearchIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
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

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-8-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3 20.25h18A2.25 2.25 0 0 0 23.25 18V6A2.25 2.25 0 0 0 21 3.75H3A2.25 2.25 0 0 0 .75 6v12A2.25 2.25 0 0 0 3 20.25z" />
    </svg>
  );
}