import { useEffect, useState } from "react";
import { BillingService } from "../../api/generated";
import { useToast } from "../../context/ToastContext";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

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
    <>
      <PageMeta title="Faturação | Clube de Leitura" description="Consulta o teu plano e o histórico de pagamentos" />
      <div className="mx-auto max-w-screen-xl space-y-6 px-4 py-6 sm:px-6">
        <PageBreadCrumb pageTitle="Faturação" />

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Faturação</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Consulta o teu plano e o histórico de pagamentos.
          </p>
        </div>

        <CurrentPlanCard subscription={subscription} />

        <PaymentHistoryTable payments={payments} reload={loadData} />
      </div>
    </>
  );
}
