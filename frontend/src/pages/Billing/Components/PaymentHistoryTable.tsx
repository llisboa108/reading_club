import { useState } from "react";
import { apiRequest } from "../../../api/client";
import { useToast } from "../../../context/ToastContext";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PENDING:   { label: "Pendente",    className: "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400" },
  CONFIRMED: { label: "Confirmado",  className: "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400" },
  CANCELED:  { label: "Cancelado",   className: "bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400" },
  FAILED:    { label: "Falhado",     className: "bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400" },
};

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-PT", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

export default function PaymentHistoryTable({ payments, reload }: any) {
  const { showToast } = useToast();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  // Mercado Pago → creates a real checkout preference and redirects the
  // member there; the payment is confirmed automatically by the webhook
  // once Mercado Pago reports it as approved (see billing/views.py).
  const handleMercadoPago = async (paymentId: number) => {
    setLoadingId(paymentId);
    try {
      const { init_point } = await apiRequest<{ init_point: string }>(
        `/billing/payments/${paymentId}/mercadopago-preference/`,
        "POST"
      );
      if (!init_point) {
        throw new Error("no init_point");
      }
      window.location.href = init_point;
    } catch {
      showToast("error", "Erro", "Não foi possível iniciar o pagamento via Mercado Pago.");
      setLoadingId(null);
    }
  };

  // Cash → PATCH method to CASH, stays PENDING for financial to confirm
  const handleCash = async (paymentId: number) => {
    setLoadingId(paymentId);
    try {
      await apiRequest(
        `/billing/payments/${paymentId}/`,
        "PATCH",
        { method: "CASH" }
      );
      showToast("success", "Pagamento registado", "O pagamento em dinheiro foi registado e aguarda confirmação.");
      reload();
    } catch {
      showToast("error", "Erro", "Não foi possível registar o pagamento em dinheiro.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Histórico de Pagamentos
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Método
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">

            {payments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  Nenhum pagamento encontrado.
                </td>
              </tr>
            )}

            {payments.map((p: any) => {
              const badge = STATUS_BADGE[p.status] ?? { label: p.status, className: "bg-gray-100 text-gray-600" };
              const isLoading = loadingId === p.id;
              const isPending = p.status === "PENDING";

              return (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">

                  {/* Date */}
                  <td className="px-6 py-4 text-gray-800 dark:text-white/80">
                    {formatDate(p.paid_at || p.due_date)}
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    R$ {p.amount}
                  </td>

                  {/* Method */}
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {p.method_display || "—"}
                  </td>

                  {/* Status badge */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    {isPending && (
                      <div className="flex items-center gap-2 justify-end">

                        <button
                          onClick={() => handleMercadoPago(p.id)}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 px-3 py-1.5 text-xs font-medium text-white transition-colors"
                        >
                          {isLoading ? "..." : "Pagar com Mercado Pago"}
                        </button>

                        <button
                          onClick={() => handleCash(p.id)}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors"
                        >
                          {isLoading ? "..." : "Dinheiro"}
                        </button>

                      </div>
                    )}
                  </td>

                </tr>
              );
            })}

          </tbody>
        </table>
      </div>

    </div>
  );
}
