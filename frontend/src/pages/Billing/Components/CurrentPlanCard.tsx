const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  ACTIVE:   { label: "Ativa",      className: "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400" },
  PENDING:  { label: "Pendente",   className: "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400" },
  EXPIRED:  { label: "Expirada",   className: "bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400" },
  CANCELED: { label: "Cancelada",  className: "bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400" },
};

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-PT", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

export default function CurrentPlanCard({ subscription }: any) {
  if (!subscription) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-theme-xs">
        <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma subscrição ativa.</p>
      </div>
    );
  }

  const badge = STATUS_BADGE[subscription.status] ?? {
    label: subscription.status,
    className: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-theme-xs">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          O Meu Plano
        </h3>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      {/* Plan name + price */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {subscription.plan.name}
          </p>
          {subscription.plan.description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subscription.plan.description}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            R$ {subscription.plan.price}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">por mês</p>
        </div>
      </div>

      {/* Dates grid */}
      <div className="grid grid-cols-3 gap-4 rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Início</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {formatDate(subscription.start_date)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fim</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {formatDate(subscription.end_date)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Próxima cobrança</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {formatDate(subscription.next_billing_date)}
          </p>
        </div>
      </div>

    </div>
  );
}
