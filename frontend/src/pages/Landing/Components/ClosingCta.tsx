import { FormEvent, useEffect, useRef, useState } from "react";
import { apiRequest, ApiRequestError } from "../../../api/client";
import { useToast } from "../../../context/ToastContext";
import { loadGsap, prefersReducedMotion } from "../../../lib/landingMotion";

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

const EMPTY_FORM: ContactForm = { name: "", email: "", message: "" };

export default function ClosingCta() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const reducedMotion = useRef(prefersReducedMotion()).current;
  const { showToast } = useToast();

  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return;
    let cancelled = false;
    let revert: (() => void) | undefined;

    loadGsap().then(({ gsap }) => {
      if (cancelled || !sectionRef.current) return;

      const ctx = gsap.context(() => {
        if (imageRef.current) {
          gsap.fromTo(
            imageRef.current,
            { clipPath: "inset(0 0 100% 0)" },
            {
              clipPath: "inset(0 0 0% 0)",
              duration: 1.1,
              ease: "power3.inOut",
              scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
            }
          );
        }
        gsap.to(".cta-line", {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
        });
      }, sectionRef);
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [reducedMotion]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Preencha nome, e-mail e mensagem.");
      return;
    }

    setSending(true);
    setError(null);
    try {
      await apiRequest("/club/contact-messages/", "POST", form, { silent: true });
      showToast("success", "Mensagem enviada!", "Vamos responder em breve.");
      setForm(EMPTY_FORM);
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 429) {
        setError("Muitas mensagens enviadas — tente novamente em algumas horas.");
      } else {
        setError("Não foi possível enviar sua mensagem. Tente novamente.");
      }
    } finally {
      setSending(false);
    }
  }

  const pending = `cta-line ${reducedMotion ? "" : "opacity-0 translate-y-4"}`;

  return (
    // Larger padding than other sections: final CTA gets extra breathing room before the footer.
    <section id="contato" ref={sectionRef} className="relative isolate overflow-hidden py-28 sm:py-36">
      <img
        ref={imageRef}
        src="/images/landing/cta-bg.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-950/80 via-brand-700/75 to-brand-950/90" />

      <div className="relative mx-auto max-w-lg px-4 text-center sm:px-6">
        <p className={`mb-4 text-xs font-medium uppercase tracking-[0.35em] text-brand-200 ${pending}`}>
          Venha sonhar com a gente
        </p>
        <h2 className={`font-heading text-3xl font-medium text-white sm:text-4xl md:text-5xl ${pending}`}>
          Quer saber mais? Fale com a gente.
        </h2>
        <p className={`mx-auto mt-5 max-w-md text-balance font-body text-lg text-brand-100 ${pending}`}>
          Dúvidas, curiosidade sobre o clube ou vontade de participar — deixe sua mensagem e
          respondemos por e-mail.
        </p>

        <form onSubmit={handleSubmit} className={`mt-10 space-y-4 text-left ${pending}`}>
          <div>
            <label htmlFor="contact-name" className="sr-only">
              Nome
            </label>
            <input
              id="contact-name"
              type="text"
              placeholder="Seu nome"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 backdrop-blur-sm focus:border-white/50 focus:outline-hidden focus:ring-3 focus:ring-brand-200/40"
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="sr-only">
              E-mail
            </label>
            <input
              id="contact-email"
              type="email"
              placeholder="Seu e-mail"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 backdrop-blur-sm focus:border-white/50 focus:outline-hidden focus:ring-3 focus:ring-brand-200/40"
            />
          </div>
          <div>
            <label htmlFor="contact-message" className="sr-only">
              Mensagem
            </label>
            <textarea
              id="contact-message"
              rows={4}
              placeholder="Como podemos ajudar?"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full resize-none rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 backdrop-blur-sm focus:border-white/50 focus:outline-hidden focus:ring-3 focus:ring-brand-200/40"
            />
          </div>

          {error && <p className="text-sm text-error-300">{error}</p>}

          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-lg bg-white px-9 py-3.5 text-sm font-semibold text-brand-700 shadow-theme-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "Enviando..." : "Enviar mensagem"}
          </button>
        </form>
      </div>
    </section>
  );
}
