import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let csrfToken = "";

export const refreshCsrfToken = async () => {
  try {
    const rootUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, "");
    const response = await axios.get(`${rootUrl}/api/v1/csrf-token`, {
      withCredentials: true,
    });

    csrfToken = response?.data?.csrfToken || "";
    return csrfToken;
  } catch (error) {
    csrfToken = "";
    return "";
  }
};

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("stocksense_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const method = (config.method || "get").toLowerCase();
  if (["post", "put", "patch", "delete"].includes(method)) {
    if (!csrfToken) {
      await refreshCsrfToken();
    }

    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If request failed with 403 CSRF error and hasn't been retried yet, refresh and retry once
    if (
      error?.response?.status === 403 &&
      error?.response?.data?.message?.toLowerCase().includes("csrf") &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const newToken = await refreshCsrfToken();
      if (newToken) {
        originalRequest.headers["X-CSRF-Token"] = newToken;
        return api(originalRequest);
      }
    }

    if (error?.response?.status === 401) {
      localStorage.removeItem("stocksense_token");
      localStorage.removeItem("stocksense_user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
