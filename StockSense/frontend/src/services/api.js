import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

let csrfToken = "";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshCsrfToken = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL.replace(/\/api\/v1$/, "")}/api/v1/csrf-token`,
      {
        withCredentials: true,
      },
    );

    csrfToken = response?.data?.csrfToken || "";
  } catch (error) {
    csrfToken = "";
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
  (error) => {
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
