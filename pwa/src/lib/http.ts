export type HttpOptions = RequestInit & { token?: string };

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = (data?.message ?? message) as string;
    } catch {}
    throw new Error(message);
  }
  // Try JSON, otherwise return as any
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export async function http<T>(url: string, opts: HttpOptions = {}) {
  const { token, headers, ...rest } = opts;
  const res = await fetch(url, {
    ...rest,
    headers: {
      "content-type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
  });
  return handle<T>(res);
}

export const get = <T>(url: string, opts?: HttpOptions) => http<T>(url, { ...opts, method: "GET" });
export const post = <T>(url: string, body?: unknown, opts?: HttpOptions) =>
  http<T>(url, { ...opts, method: "POST", body: body ? JSON.stringify(body) : undefined });
export const del = <T>(url: string, opts?: HttpOptions) => http<T>(url, { ...opts, method: "DELETE" });
export const patch = <T>(url: string, body?: unknown, opts?: HttpOptions) =>
  http<T>(url, { ...opts, method: "PATCH", body: body ? JSON.stringify(body) : undefined });

