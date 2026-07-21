import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { apiRequest } from "../../api/client";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
}

interface BlogPostDetail {
  id: number;
  title: string;
  slug: string;
  author: string;
  category: BlogCategory | null;
  content: string;
  image: string | null;
  published_at: string | null;
}

function formatDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    apiRequest<BlogPostDetail>(`/club/blog/${slug}/`)
      .then(setPost)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <>
      <PageMeta
        title={post ? `${post.title} | Blog` : "Blog | Clube de Leitura"}
        description="Publicação do blog"
      />
      <div className="mx-auto max-w-screen-md px-4 py-6 sm:px-6">
        <PageBreadCrumb pageTitle="Blog" />

        <Link to="/blog" className="mb-6 inline-block text-sm text-brand-500 hover:underline">
          ← Voltar ao blog
        </Link>

        {loading ? (
          <div className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" />
        ) : notFound || !post ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center dark:border-gray-700 dark:bg-gray-900">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Publicação não encontrada</h3>
          </div>
        ) : (
          <article className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 sm:p-8">
            {post.image && (
              <img src={post.image} alt="" className="mb-6 h-64 w-full rounded-xl object-cover" />
            )}
            {post.category && (
              <span className="mb-3 inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                {post.category.name}
              </span>
            )}
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">{post.title}</h1>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              {post.author} · {formatDate(post.published_at)}
            </p>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {post.content}
            </div>
          </article>
        )}
      </div>
    </>
  );
}
