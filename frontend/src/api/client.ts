import { triggerToast } from "../utils/toast";
import { normalizeApiError } from "../utils/apiErrors";

import { API_HOST, API_PREFIX, getAccessToken } from "./config";

// Carries the HTTP status so callers can branch on specific error
// cases (e.g. 403 for "no active subscription") without re-parsing.
export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface ApiRequestOptions {
  // Skip the global "Falha na requisição" toast — use when the caller
  // wants to handle the error with its own UI instead.
  silent?: boolean;
}

async function refreshToken(): Promise<string | null> {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;

  try {
    let response = await fetch(`${API_HOST}${API_PREFIX}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    localStorage.setItem("access", data.access);
    return data.access;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  method: string = "GET",
  data?: unknown,
  options?: ApiRequestOptions
): Promise<T> {
  let access = getAccessToken();

  const isFormData = data instanceof FormData;

  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (access) {
    headers["Authorization"] = `Bearer ${access}`;
  }

  const makeRequest = async (token?: string) => {
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return fetch(`${API_HOST}${API_PREFIX}${endpoint}`, {
      method,
      headers,
      body: data
        ? isFormData
          ? (data as FormData)
          : JSON.stringify(data)
        : undefined,
    });
  };

  let response = await makeRequest(access || undefined);

  // 401 from the auth endpoints themselves means bad credentials/refresh
  // token, not an expired access token — don't try to "refresh" those.
  const isAuthEndpoint = endpoint === "/auth/login/" || endpoint === "/auth/refresh/";

  // If access expired → try refresh
  if (response.status === 401 && !isAuthEndpoint) {
    const newAccess = await refreshToken();

    if (!newAccess) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/signin";
      throw new ApiRequestError("Sessão expirada", 401);
    }

    response = await makeRequest(newAccess);
  }

  if (!response.ok) {
    let message = "Erro inesperado";

    try {
      const data = await response.json();
      message = normalizeApiError(data);
    } catch {}

    if (!options?.silent) {
      triggerToast("error", "Falha na requisição", message);
    }

    throw new ApiRequestError(message, response.status);
  }

  // Se não houver conteúdo (ex: 204)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
