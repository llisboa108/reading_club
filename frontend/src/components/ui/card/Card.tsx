import { ElementType, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  as?: ElementType;
  hoverable?: boolean;
  [key: string]: unknown;
}

const PADDING_CLASSES = {
  none: "",
  sm: "p-4",
  md: "p-5 md:p-6",
  lg: "p-6 md:p-8",
};

export default function Card({
  children,
  className = "",
  padding = "md",
  as: Tag = "div",
  hoverable = false,
  ...rest
}: CardProps) {
  return (
    <Tag
      className={`rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 ${
        hoverable ? "transition-shadow hover:shadow-theme-sm" : ""
      } ${PADDING_CLASSES[padding]} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
