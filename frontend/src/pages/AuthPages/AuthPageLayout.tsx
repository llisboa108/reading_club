import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";
import { apiRequest } from "../../api/client";

interface Quote {
  id: number;
  text: string;
  attribution: string;
}

const FALLBACK_QUOTE: Quote = {
  id: 0,
  text: "Um país se faz com homens e livros.",
  attribution: "Monteiro Lobato",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [quote, setQuote] = useState<Quote>(FALLBACK_QUOTE);

  useEffect(() => {
    apiRequest<Quote[]>("/club/quotes/", "GET", undefined, { silent: true })
      .then((quotes) => {
        if (quotes.length > 0) {
          setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full min-h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="relative hidden h-full min-h-screen w-full overflow-hidden lg:block lg:w-1/2">
          <img
            src="/images/landing/hero-bg.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-900/90 via-brand-700/80 to-brand-900/95 mix-blend-multiply" />
          <div className="absolute inset-0 bg-brand-900/20" />
          <div className="relative z-1 flex h-full min-h-screen flex-col justify-between p-10 xl:p-14">
            <Link to="/" className="block w-fit">
              <img
                className="h-10 w-auto"
                src="/images/logo/logo-dark.png"
                alt="Sonhos Literários"
              />
            </Link>
            <blockquote className="max-w-md">
              <p className="font-body text-2xl italic leading-snug text-white/95 xl:text-[28px]">
                &ldquo;{quote.text}&rdquo;
              </p>
              {quote.attribution && (
                <footer className="mt-4 font-ui text-sm tracking-wide text-white/60">
                  — {quote.attribution}
                </footer>
              )}
            </blockquote>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
