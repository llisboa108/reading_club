import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { apiRequest, ApiRequestError } from "../../api/client";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/ui/button/Button";

type ReadingStatus = "PLANNED" | "IN_PROGRESS" | "FINISHED" | "CANCELED";

interface Reading {
  id: number;
  status?: ReadingStatus;
  book?: { title: string };
}

interface Payment {
  id: number;
  amount: string;
  due_date: string;
  status: "PENDING" | "CONFIRMED" | "CANCELED" | "FAILED";
}

interface MeetParticipant {
  user: string;
}

interface Meet {
  id: number;
  reading: number;
  meet_date: string;
  meet_type: "ONLINE" | "IN_PERSON";
  participants: MeetParticipant[];
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
        {icon}
      </div>
      <div className="mt-5">
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
          {value}
        </h4>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [readings, setReadings] = useState<Reading[]>([]);
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState<number | null>(null);
  const [membersCount, setMembersCount] = useState<number | null>(null);
  const [myPendingPayments, setMyPendingPayments] = useState<Payment[]>([]);
  const [myUpcomingMeets, setMyUpcomingMeets] = useState<(Meet & { bookTitle: string })[]>([]);

  useEffect(() => {
    // silent: a member without an active subscription gets a 403 here,
    // which is an expected state (not a bug) — handled below with a
    // dedicated banner instead of the generic error toast.
    apiRequest<Reading[]>("/club/readings/", "GET", undefined, { silent: true })
      .then((data) => {
        setReadings(data);
        setSubscriptionRequired(false);
      })
      .catch((err) => {
        setReadings([]);
        setSubscriptionRequired(err instanceof ApiRequestError && err.status === 403);
      });

    // Own pending payments - available regardless of subscription state,
    // since this is often exactly why the subscription isn't active yet.
    apiRequest<Payment[]>("/billing/payments/", "GET", undefined, { silent: true })
      .then((data) => setMyPendingPayments(data.filter((p) => p.status === "PENDING")))
      .catch(() => setMyPendingPayments([]));

    // Upcoming meets the member is signed up for - meets require an active
    // subscription, so this silently comes back empty for those without one.
    Promise.all([
      apiRequest<Meet[]>("/club/meets/", "GET", undefined, { silent: true }),
      apiRequest<Reading[]>("/club/readings/", "GET", undefined, { silent: true }),
    ])
      .then(([meets, allReadings]) => {
        const readingById = new Map(allReadings.map((r) => [r.id, r]));
        const now = new Date();
        const upcoming = meets
          .filter(
            (m) =>
              new Date(m.meet_date) > now &&
              m.participants.some((p) => p.user === user?.email)
          )
          .map((m) => ({
            ...m,
            bookTitle: readingById.get(m.reading)?.book?.title ?? "Leitura",
          }))
          .sort((a, b) => a.meet_date.localeCompare(b.meet_date))
          .slice(0, 3);
        setMyUpcomingMeets(upcoming);
      })
      .catch(() => setMyUpcomingMeets([]));

    if (user?.is_financial) {
      apiRequest<unknown[]>("/billing/payments/pending/")
        .then((data) => setPendingPaymentsCount(data.length))
        .catch(() => setPendingPaymentsCount(null));
    }

    if (user?.is_admin) {
      apiRequest<unknown[]>("/auth/members/")
        .then((data) => setMembersCount(data.length))
        .catch(() => setMembersCount(null));
    }
  }, [user?.email, user?.is_financial, user?.is_admin]);

  const activeReadings = readings.filter(
    (r) => r.status === "IN_PROGRESS" || r.status === "PLANNED"
  ).length;

  return (
    <>
      <PageMeta
        title="Dashboard | Clube de Leitura"
        description="Visão geral do clube de leitura"
      />
      {subscriptionRequired && (
        <div className="mb-6 flex flex-col items-start gap-4 rounded-2xl border border-warning-200 bg-warning-50 p-6 dark:border-warning-500/20 dark:bg-warning-500/5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-warning-100 dark:bg-warning-500/15">
              <LockIcon className="h-6 w-6 text-warning-600 dark:text-warning-400" />
            </div>
            <div>
              <h3 className="mb-1 text-base font-semibold text-warning-700 dark:text-warning-400">
                Assinatura necessária
              </h3>
              <p className="text-sm text-warning-600 dark:text-warning-500">
                A sua assinatura não está ativa, por isso algumas áreas do clube (Leituras, Encontros)
                ainda não estão disponíveis. Regularize o pagamento na página de Assinatura para
                liberar o acesso completo — em breve você poderá pagar diretamente por lá.
              </p>
            </div>
          </div>
          <Button onClick={() => navigate("/billing")} className="shrink-0">
            Ir para Assinatura
          </Button>
        </div>
      )}

      {myPendingPayments.length > 0 && (
        <div className="mb-6 flex flex-col items-start gap-4 rounded-2xl border border-warning-200 bg-warning-50 p-6 dark:border-warning-500/20 dark:bg-warning-500/5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-warning-100 dark:bg-warning-500/15">
              <WalletIcon className="h-6 w-6 text-warning-600 dark:text-warning-400" />
            </div>
            <div>
              <h3 className="mb-1 text-base font-semibold text-warning-700 dark:text-warning-400">
                Pagamento pendente
              </h3>
              <p className="text-sm text-warning-600 dark:text-warning-500">
                {myPendingPayments.length === 1 ? (
                  <>
                    Tens um pagamento de <strong>R$ {myPendingPayments[0].amount}</strong> com
                    vencimento em {formatDate(myPendingPayments[0].due_date)}.
                  </>
                ) : (
                  <>Tens {myPendingPayments.length} pagamentos pendentes na tua conta.</>
                )}
              </p>
            </div>
          </div>
          <Button onClick={() => navigate("/billing")} className="shrink-0">
            Ver pagamentos
          </Button>
        </div>
      )}

      {myUpcomingMeets.length > 0 && (
        <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-25 p-6 dark:border-brand-500/20 dark:bg-brand-500/5">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/15">
              <CalendarIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            </div>
            <h3 className="text-base font-semibold text-brand-700 dark:text-brand-400">
              Próximos encontros
            </h3>
          </div>
          <ul className="space-y-2">
            {myUpcomingMeets.map((meet) => (
              <li
                key={meet.id}
                className="flex flex-col justify-between gap-1 rounded-lg bg-white/60 px-4 py-3 text-sm dark:bg-white/5 sm:flex-row sm:items-center"
              >
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {meet.bookTitle}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {formatDateTime(meet.meet_date)} ·{" "}
                  {meet.meet_type === "ONLINE" ? "Online" : "Presencial"}
                </span>
              </li>
            ))}
          </ul>
          <Button variant="outline" onClick={() => navigate("/meets")} className="mt-4">
            Ver todos os encontros
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
        {!subscriptionRequired && (
          <>
            <StatCard
              label="Leituras cadastradas"
              value={readings.length}
              icon={<BookIcon />}
            />
            <StatCard
              label="Leituras ativas/planeadas"
              value={activeReadings}
              icon={<CalendarIcon />}
            />
          </>
        )}

        {user?.is_financial && (
          <StatCard
            label="Pagamentos pendentes"
            value={pendingPaymentsCount ?? "—"}
            icon={<WalletIcon />}
          />
        )}

        {user?.is_admin && (
          <StatCard
            label="Membros ativos"
            value={membersCount ?? "—"}
            icon={<UsersIcon />}
          />
        )}
      </div>
    </>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function BookIcon() {
  return (
    <svg className="h-6 w-6 text-gray-800 dark:text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-6 w-6 text-gray-800 dark:text-white/90"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
    </svg>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-6 w-6 text-gray-800 dark:text-white/90"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 12a2 2 0 0 0 0 4h3v-4h-3z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="h-6 w-6 text-gray-800 dark:text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" />
    </svg>
  );
}
