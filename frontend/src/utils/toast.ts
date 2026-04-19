type ToastVariant = "success" | "error" | "warning" | "info";

let toastHandler: (
  variant: ToastVariant,
  title: string,
  message?: string
) => void;

export function registerToast(
  fn: typeof toastHandler
) {
  toastHandler = fn;
}

export function triggerToast(
  variant: ToastVariant,
  title: string,
  message?: string
) {
  if (toastHandler) {
    toastHandler(variant, title, message);
  }
}