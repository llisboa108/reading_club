import { triggerToast } from "../utils/toast";
import { normalizeApiError } from "../utils/apiErrors";

import { API_HOST, API_PREFIX, getAccessToken } from "./config";

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
  data?: unknown
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

  // If access expired → try refresh
  if (response.status === 401) {
    const newAccess = await refreshToken();

    if (!newAccess) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/signin";
      throw new Error("Session expired");
    }

    response = await makeRequest(newAccess);
  }

  if (!response.ok) {
    let message = "Unexpected error";

    try {
      const data = await response.json();
      message = normalizeApiError(data);
    } catch {}

    triggerToast("error", "Request failed", message);

    throw new Error(message);
  }

  // Se não houver conteúdo (ex: 204)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
