import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiRequest } from "../../api/client";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../components/common/PageHeader";

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

        <PageHeader
          title="Blog"
          description={`${posts.length} ${posts.length === 1 ? "publicação" : "publicações"}`}
        />

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-1 font-heading text-lg text-gray-900 dark:text-white">Ainda não há publicações</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/blog/${p.slug}`)}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs transition hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-500/15 dark:to-brand-600/25">
                  {p.image ? (
                    <img src={p.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <OpenBookIcon className="h-16 w-16 text-brand-400/70 dark:text-brand-300/60" />
                  )}
                </div>
                <div className="p-4 font-ui">
                  {p.category && (
                    <span className="mb-2 inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                      {p.category.name}
                    </span>
                  )}
                  <h3 className="truncate font-heading text-base text-gray-900 dark:text-white">{p.title}</h3>
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

function OpenBookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );
}
