export default function CurrentPlanCard({ subscription }: any) {

  if (!subscription) {
    return (
      <div className="p-6 border text-gray-800 dark:text-white/90 rounded-xl bg-white dark:bg-gray-900">
        No active subscription
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-xl bg-white dark:bg-gray-900">

      <h3 className="text-lg text-gray-800 dark:text-white/90 font-semibold mb-4">
        Your Plan
      </h3>

      <div className="flex justify-between items-center">

        <div>

          <p className="text-xl font-semibold">
            {subscription.plan.name}
          </p>

          <p className="text-gray-500 text-sm">
            {subscription.plan.description}
          </p>

          <p className="text-sm text-gray-800 dark:text-white/90 text-gray-400 mt-1">
            Next billing: {subscription.next_billing_date}
          </p>

        </div>

        <div className="text-right">

          <p className="text-2xl text-gray-800 dark:text-white/90 font-bold">
            R$ {subscription.plan.price}
          </p>

          <p className="text-sm text-gray-800 dark:text-white/90 text-gray-500">
            per month
          </p>

        </div>

      </div>

    </div>
  );
}