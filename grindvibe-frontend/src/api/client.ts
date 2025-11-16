const API_URL = import.meta.env.VITE_API_URL ?? "https://localhost:7093";

export type ApiError = {
  status: number;
  message: string;
  detail?: string;
  signal?: AbortSignal;
};

function getString(obj: unknown, key: string): string | undefined {
  if (obj && typeof obj === "object" && key in (obj as Record<string, unknown>)) {
    const v = (obj as Record<string, unknown>)[key];
    return typeof v === "string" ? v : undefined;
  }
  return undefined;
}

export function isApiError(e: unknown): e is ApiError {
  if (e && typeof e === "object") {
    const o = e as Record<string, unknown>;
    return typeof o.status === "number" && typeof o.message === "string";
  }
  return false;
}

export default async function api(path: string, options?: RequestInit): Promise<void>;
export default async function api<T>(path: string, options?: RequestInit): Promise<T>;

export default async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T | void> {
  const token = localStorage.getItem("token"); 

  const baseHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const headers = new Headers(baseHeaders);
  if (options.headers) {
    const extra = new Headers(options.headers as HeadersInit);
    extra.forEach((v, k) => headers.set(k, v));
  }

  const base = (API_URL || "").replace(/\/+$/, "");
  const pathWithSlash = path.startsWith("/") ? path : `/${path}`;
  const url = `${base}${pathWithSlash}`;
  console.info("[API] =>", url);

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let data: Record<string, unknown> | null = null;
    try {
      data = (await res.json()) as Record<string, unknown>;
    } catch {
      data = null;
    }

    const err: ApiError = {
      status: res.status,
      message: getString(data, "message") ?? res.statusText ?? "Wystąpił błąd",
      detail: getString(data, "detail"),
    };
    throw err;
  }

  const isNoContent = res.status === 204;
  const contentLength = res.headers.get("content-length");
  const hasBody =
    !isNoContent &&
    contentLength !== "0" &&
    !!res.headers.get("content-type")?.includes("application/json");

  if (!hasBody) {
    return;
  }

  return (await res.json()) as T;
}


