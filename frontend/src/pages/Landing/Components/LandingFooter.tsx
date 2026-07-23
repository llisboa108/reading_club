export default function LandingFooter() {
  return (
    <footer className="border-t border-stone-200 bg-stone-25 py-8 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="font-body text-sm text-stone-500 dark:text-gray-400">
          © {new Date().getFullYear()}{" "}
          <a
            href="https://www.instagram.com/clubedolivrosonhosliterarios/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-stone-700 hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-400"
          >
            Sonhos Literários
          </a>{" "}
          · Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
}
