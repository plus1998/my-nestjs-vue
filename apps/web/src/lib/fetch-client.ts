const DEFAULT_API_BASE_URL = "http://localhost:3000";

interface RequestOptions {
  body?: unknown;
  headers?: HeadersInit;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  signal?: AbortSignal;
}

export class ApiError extends Error {
  body: unknown;
  status: number;

  constructor(status: number, body: unknown, fallbackMessage: string) {
    super(getErrorMessageFromBody(body) ?? fallbackMessage);
    this.name = "ApiError";
    this.body = body;
    this.status = status;
  }
}

export async function fetchJson<T>(
  path: string,
  { body, headers, method = "GET", signal }: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
    signal,
  });
  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      responseBody,
      `请求失败（${response.status}）`,
    );
  }

  return responseBody as T;
}

function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (!configuredBaseUrl) {
    return DEFAULT_API_BASE_URL;
  }

  return configuredBaseUrl.replace(/\/+$/, "");
}

async function parseResponseBody(response: Response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();

  return text.length > 0 ? text : null;
}

function getErrorMessageFromBody(body: unknown) {
  if (typeof body === "string" && body.length > 0) {
    return body;
  }

  if (
    typeof body === "object" &&
    body !== null &&
    "message" in body
  ) {
    const { message } = body as { message?: unknown };

    if (typeof message === "string" && message.length > 0) {
      return message;
    }

    if (Array.isArray(message)) {
      const firstMessage = message.find(
        (item): item is string => typeof item === "string" && item.length > 0,
      );

      if (firstMessage) {
        return firstMessage;
      }
    }
  }

  return null;
}
