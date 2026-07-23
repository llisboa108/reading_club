import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center dark:border-gray-700 dark:bg-gray-900 ${className}`}
    >
      <img
        src="/images/logo/logo-icon.png"
        alt=""
        aria-hidden="true"
        className="mb-4 h-10 w-auto opacity-20 dark:opacity-30"
      />
      <h3 className="font-heading text-lg text-gray-700 dark:text-white/80">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm font-ui text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
