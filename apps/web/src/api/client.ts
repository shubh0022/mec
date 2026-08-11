import axios, { AxiosError } from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor: attach token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("vanta_auth_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 and extract error messages
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect if already on login page
      if (!window.location.pathname.includes("/login")) {
        localStorage.removeItem("vanta_auth_token");
        localStorage.removeItem("vanta_user");
        window.location.href = "/login";
      }
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred. Please check your connection.";
    return Promise.reject({
      ...error,
      message,
      code: error.response?.data?.code,
      errors: error.response?.data?.errors
    });
  }
);
