import { apiRequest } from "../../../api/client";
import { useToast } from "../../../context/ToastContext";

export default function PaymentHistoryTable({ payments, reload }: any) {
  const { showToast } = useToast();

  const handlePay = async (paymentId: number) => {
    try {
      const res = await apiRequest<{ checkout_url: string }>(
        `/billing/payments/${paymentId}/confirm/`,
        "POST"
      );

      window.location.href = res.checkout_url;

    } catch {
      showToast("error", "Payment error", "Could not start payment");
    }
  };

  return (
    <div className="p-6 border rounded-xl bg-white dark:bg-gray-900">

      <h3 className="text-lg text-gray-800 dark:text-white/90 font-semibold mb-4">
        Payment History
      </h3>

      <table className="w-full text-sm">

        <thead>
          <tr className="border-b text-gray-800 dark:text-white/90">
            <th className="text-left py-2">Date</th>
            <th className="text-left py-2">Amount</th>
            <th className="text-left py-2">Status</th>
            <th></th>
          </tr>
        </thead>

        <tbody>

          {payments.map((p: any) => (
            <tr key={p.id} className="border-b">

              <td className="py-2">
                {p.paid_at || p.due_date}
              </td>

              <td>
                R$ {p.amount}
              </td>

              <td>
                {p.status}
              </td>

              <td>

                {p.status === "PENDING" && (
                  <button
                    onClick={() => handlePay(p.id)}
                    className="px-3 py-1 text-sm bg-brand-500 text-white rounded"
                  >
                    Pay
                  </button>
                )}

              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}