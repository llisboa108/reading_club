import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { apiRequest } from "../../api/client";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";

interface PendingPayment {
  id: number;
  member_email: string;
  member_name: string;
  amount: string;
  method_display: string;
  due_date: string;
  receipt: string | null;
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function PaymentConfirmationsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const loadPayments = async () => {
    try {
      const data = await apiRequest<PendingPayment[]>("/billing/payments/pending/");
      setPayments(data);
    } catch {
      showToast("error", "Erro", "Não foi possível carregar os pagamentos pendentes.");
    }
  };

  useEffect(() => {
    if (user?.is_financial) {
      loadPayments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.is_financial]);

  if (!user?.is_financial) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleConfirm = async (paymentId: number) => {
    setLoadingId(paymentId);
    try {
      await apiRequest(`/billing/payments/${paymentId}/confirm/`, "POST", {
        confirm: true,
      });
      showToast(
        "success",
        "Pagamento confirmado",
        "A assinatura do membro foi renovada."
      );
      loadPayments();
    } catch {
      showToast("error", "Erro", "Não foi possível confirmar o pagamento.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Confirmações de Pagamento
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Pagamentos pendentes de todos os membros, aguardando confirmação.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Membro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Vencimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Comprovativo
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {payments.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    Nenhum pagamento pendente.
                  </td>
                </tr>
              )}

              {payments.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-800 dark:text-white/80">
                    {p.member_name || p.member_email}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    R$ {p.amount}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {p.method_display || "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {formatDate(p.due_date)}
                  </td>
                  <td className="px-6 py-4">
                    {p.receipt ? (
                      <a
                        href={p.receipt}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-500 hover:underline"
                      >
                        Ver
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleConfirm(p.id)}
                      disabled={loadingId === p.id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 px-3 py-1.5 text-xs font-medium text-white transition-colors"
                    >
                      {loadingId === p.id ? "..." : "Confirmar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
