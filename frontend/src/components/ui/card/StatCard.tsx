import { ReactNode } from "react";
import { Link } from "react-router";
import Card from "./Card";

const ACCENT_CLASSES = {
  brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400",
  success: "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400",
  warning: "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400",
  error: "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400",
};

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  accent?: keyof typeof ACCENT_CLASSES;
  to?: string;
}

export default function StatCard({ label, value, icon, accent = "brand", to }: StatCardProps) {
  const content = (
    <>
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${ACCENT_CLASSES[accent]}`}>
        {icon}
      </div>
      <div className="mt-5">
        <span className="font-ui text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <h4 className="mt-1 font-heading text-2xl text-gray-800 dark:text-white/90">
          {value}
        </h4>
      </div>
    </>
  );

  if (to) {
    return (
      <Card hoverable as={Link} to={to} className="block transition hover:-translate-y-0.5">
        {content}
      </Card>
    );
  }

  return <Card hoverable>{content}</Card>;
}
