import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { apiRequest } from "../../api/client";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import { Table, TableHeader, TableBody, TableRow, Th, Td } from "../../components/ui/table/Table";

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
      <PageHeader
        title="Confirmações de Pagamento"
        description="Pagamentos pendentes de todos os membros, aguardando confirmação."
      />

      {payments.length === 0 ? (
        <EmptyState title="Nenhum pagamento pendente" />
      ) : (
        <Table>
          <TableHeader>
            <Th>Membro</Th>
            <Th>Valor</Th>
            <Th>Método</Th>
            <Th>Vencimento</Th>
            <Th>Comprovativo</Th>
            <Th />
          </TableHeader>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <Td className="text-gray-800 dark:text-white/80">
                  {p.member_name || p.member_email}
                </Td>
                <Td className="font-medium text-gray-900 dark:text-white">
                  R$ {p.amount}
                </Td>
                <Td>{p.method_display || "—"}</Td>
                <Td>{formatDate(p.due_date)}</Td>
                <Td>
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
                </Td>
                <Td>
                  <button
                    onClick={() => handleConfirm(p.id)}
                    disabled={loadingId === p.id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 px-3 py-1.5 text-xs font-medium text-white transition-colors"
                  >
                    {loadingId === p.id ? "..." : "Confirmar"}
                  </button>
                </Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
