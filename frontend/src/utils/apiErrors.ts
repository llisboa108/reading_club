export function normalizeApiError(data: unknown): string {
  if (!data) return "Unknown error";

  // Caso DRF padrão
  if (typeof data === "object" && "detail" in data) {
    return (data as any).detail;
  }

  // Caso serializer errors
  if (typeof data === "object") {
    const entries = Object.entries(data as Record<string, any>);

    const messages: string[] = [];

    for (const [field, value] of entries) {
      if (Array.isArray(value)) {
        messages.push(`${field}: ${value[0]}`);
      }
    }

    if (messages.length) {
      return messages.join(" • ");
    }
  }

  return "Unexpected error";
}