export const API_URL = import.meta.env.VITE_API_URL || "/api";
export const TOKEN_KEY = "dynamic_form_builder_token";
export const USER_KEY = "dynamic_form_builder_user";

type ApiOptions = RequestInit & {
  auth?: boolean;
};

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers
    });
  } catch {
    throw new Error("Cannot reach the local backend. Make sure the API server is running on port 5000.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof data === "string" ? data : data.message || "Request failed.";
    const error = new Error(message) as Error & { details?: unknown; errors?: Record<string, string> };
    error.details = typeof data === "object" ? data.details : undefined;
    error.errors = typeof data === "object" ? data.errors : undefined;
    throw error;
  }

  return data as T;
}
