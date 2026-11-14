// apps/nexus-ats/frontend/src/lib/api/client.js

const API_BASE = "/api/v1";

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Universal fetch client for Nexus ATS Core API
 */
export async function apiClient(endpoint, options = {}) {
  const { body, headers = {}, ...customConfig } = options;

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  const config = {
    method: options.method || (body ? "POST" : "GET"),
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      Accept: "application/json",
      ...headers,
    },
    credentials: "include", // Transmit httpOnly session cookies across domains
    ...customConfig,
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const response = await fetch(`${API_BASE}${cleanEndpoint}`, config);

  let data;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage =
      (typeof data === "object" && data?.message) ||
      (typeof data === "string" && data) ||
      `HTTP Request failed with status ${response.status}`;
    throw new ApiError(errorMessage, response.status, data);
  }

  return data;
}
