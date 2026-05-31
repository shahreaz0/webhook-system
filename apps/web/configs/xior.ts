import xior from "xior";

const http = xior.create({
  baseURL: "http://localhost:8088",
});

http.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  config.headers.Authorization = "Bearer jwt_token";
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

  const xiorRes = await http.request({
    url,
    method: init?.method,
    headers: init?.headers,
    data: init?.body,
    signal: init?.signal,
  });

  return new Response(JSON.stringify(xiorRes.data), {
    status: xiorRes.status,
    statusText: xiorRes.statusText,
    headers: xiorRes.headers,
  });
}
