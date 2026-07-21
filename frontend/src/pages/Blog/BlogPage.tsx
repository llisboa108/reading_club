import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiRequest } from "../../api/client";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  author: string;
  category: BlogCategory | null;
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

export default function BlogPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<BlogPost[]>("/club/blog/")
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageMeta title="Blog | Clube de Leitura" description="Blog do clube de leitura" />
      <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6">
        <PageBreadCrumb pageTitle="Blog" />

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {posts.length} publicação{posts.length !== 1 ? "ões" : ""}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">Ainda não há publicações</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/blog/${p.slug}`)}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs transition hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-500/10 dark:to-brand-600/20">
                  {p.image ? (
                    <img src={p.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-brand-400 dark:text-brand-300 select-none">
                      {p.title.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  {p.category && (
                    <span className="mb-2 inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                      {p.category.name}
                    </span>
                  )}
                  <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">{p.title}</h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {p.author} · {formatDate(p.published_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
