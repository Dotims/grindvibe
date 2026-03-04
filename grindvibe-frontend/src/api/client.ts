const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export type ApiError = {
  status: number;
  message: string;
  detail?: string;
};

export function isApiError(e: unknown): e is ApiError {
  return typeof e === "object" && e !== null && "status" in e;
}

async function api<T>(path: string, config: RequestInit = {}): Promise<T> {
  // 1. KLUCZOWE: Sprawdzamy obie możliwe nazwy tokena
  const token = localStorage.getItem("token") || localStorage.getItem("gv_token");

  const headers = new Headers(config.headers);
  
  // 2. Jeśli token istnieje, dodajemy go do nagłówka
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (!headers.has("Content-Type") && !(config.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const cleanBase = API_URL.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  const url = `${cleanBase}/${cleanPath}`;

  const response = await fetch(url, {
    ...config,
    headers,
  });

  if (!response.ok) {
    let errorMessage = response.statusText;
    let errorDetail = "";
    
    try {
      const text = await response.text();
      if (text) {
        try {
            const json = JSON.parse(text);
            errorMessage = json.message || errorMessage;
            errorDetail = json.detail || "";
        } catch {
            errorMessage = text;
        }
      }
    } catch { /* ignore */ }

    if (response.status === 401) {
        console.warn("[API] 401 Unauthorized - brak dostępu lub token wygasł.");
    }

    throw {
      status: response.status,
      message: errorMessage,
      detail: errorDetail,
    } as ApiError;
  }

  if (response.status === 204) {
    return null as unknown as T;
  }

  return response.json();
}

export default api;


