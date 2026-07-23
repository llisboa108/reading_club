import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";

export default function NotFound() {
  return (
    <>
      <PageMeta
        title="Página não encontrada | Sonhos Literários"
        description="Página não encontrada"
      />
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
        <img
          src="/images/logo/logo-icon.png"
          alt=""
          aria-hidden="true"
          className="mb-6 h-12 w-auto opacity-30"
        />
        <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
          <h1 className="mb-4 font-heading text-title-md text-gray-800 dark:text-white/90 xl:text-title-2xl">
            Página perdida
          </h1>

          <p className="mb-6 font-ui text-base text-gray-700 dark:text-gray-400 sm:text-lg">
            Não conseguimos encontrar a página que procura — talvez ela tenha mudado de capítulo.
          </p>

          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 font-ui text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Voltar à Página Inicial
          </Link>
        </div>
        {/* <!-- Footer --> */}
        <p className="absolute font-ui text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
          &copy; {new Date().getFullYear()} - Sonhos Literários
        </p>
      </div>
    </>
  );
}
