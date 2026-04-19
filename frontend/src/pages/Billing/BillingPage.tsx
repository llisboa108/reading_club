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
      showToast("error", "Billing error", "Could not load billing data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">

      <CurrentPlanCard subscription={subscription} />

      <PaymentHistoryTable payments={payments} reload={loadData} />

    </div>
  );
}