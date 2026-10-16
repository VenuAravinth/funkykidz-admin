import "server-only";

export class ErpNotConfiguredError extends Error {}

export class ErpApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

interface ErpRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  query?: Record<string, string | number | undefined>;
  body?: unknown;
  actor?: string;
}

export async function erpRequest<T>(path: string, { method = "GET", query, body, actor }: ErpRequestOptions = {}): Promise<T> {
  const baseUrl = process.env.ERP_API_URL?.trim().replace(/\/+$/, "");
  const apiKey = process.env.ERP_API_KEY?.trim();
  if (!baseUrl || !apiKey) {
    throw new ErpNotConfiguredError("The ERP backend isn't configured. Set ERP_API_URL and ERP_API_KEY in .env.");
  }

  const url = new URL(`${baseUrl}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...(body !== undefined && !(body instanceof FormData) && { "Content-Type": "application/json" }),
        ...(actor && { "x-erp-user": actor }),
      },
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ErpApiError(502, "Couldn't reach the ERP backend. Please check that it is running.");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error = (data as { error?: { message?: string; details?: unknown } } | null)?.error;
    if (res.status === 401) throw new ErpApiError(502, "The ERP backend rejected the API key. Check ERP_API_KEY.");
    throw new ErpApiError(res.status, error?.message ?? `The ERP backend returned an error (${res.status}).`, error?.details);
  }
  return data as T;
}
