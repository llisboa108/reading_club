import { useEffect, useState } from "react";
import { BillingService } from "../../api/generated";
import { useToast } from "../../context/ToastContext";

import CurrentPlanCard from "./Components/CurrentPlanCard";
import PaymentHistoryTable from "./Components/PaymentHistoryTable";

export default function BillingPage() {
  const { showToast } = useToast();

  const [subscription, setSubscription] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const sub = await BillingService.billingSubscriptionRetrieve();
      const pay = await BillingService.paymentsList();

      setSubscription(sub);
      setPayments(pay);
    } catch {
      showToast("error", "Erro de faturação", "Não foi possível carregar os dados de faturação.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Faturação</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Consulta o teu plano e o histórico de pagamentos.
        </p>
      </div>

      <CurrentPlanCard subscription={subscription} />

      <PaymentHistoryTable payments={payments} reload={loadData} />
    </div>
  );
}
