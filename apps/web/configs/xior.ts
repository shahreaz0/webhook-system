import Cookies from "js-cookie";
import xior from "xior";

const http = xior.create({
  baseURL: "http://localhost:8088",
});

http.interceptors.request.use((config) => {
  config.headers = config.headers || {};

  const token = typeof window === "undefined" ? null : Cookies.get("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Redirect to login...");
    }
    return Promise.reject(error);
  }
);

export async function xiorFetchAdapter(
  input: RequestInfo | URL,
  init?: RequestInit
) {
  const url =
    input instanceof Request || input instanceof URL ? input.toString() : input;

  const requestHeaders = getPlainHeaders(init?.headers);

  const xiorRes = await http.request({
    url,
    method: init?.method,
    headers: requestHeaders,
    data: init?.body,
    signal: init?.signal,
  });

  return new Response(JSON.stringify(xiorRes.data), {
    status: xiorRes.status,
    statusText: xiorRes.statusText,
    headers: xiorRes.headers,
  });
}

function getPlainHeaders(
  headers: HeadersInit | undefined
): Record<string, string> {
  const plain: Record<string, string> = {};
  if (!headers) {
    return plain;
  }

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      plain[key] = value;
    });
  } else if (Array.isArray(headers)) {
    for (const [key, value] of headers) {
      plain[key] = value;
    }
  } else {
    for (const key of Object.keys(headers)) {
      plain[key] = (headers as Record<string, string>)[key];
    }
  }
  return plain;
}
