import { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";

export function Table({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
      <table className={`w-full font-ui text-left text-sm ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-gray-200 dark:border-gray-800">
      <tr>{children}</tr>
    </thead>
  );
}

export function TableBody({ children }: { children: ReactNode }) {
  return (
    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
      {children}
    </tbody>
  );
}

export function TableRow({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02] ${className}`}
    >
      {children}
    </tr>
  );
}

export function Th({
  children,
  className = "",
  ...rest
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${className}`}
      {...rest}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className = "",
  ...rest
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`px-5 py-4 text-gray-700 dark:text-gray-300 ${className}`}
      {...rest}
    >
      {children}
    </td>
  );
}
