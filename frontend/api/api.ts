import axios, { AxiosInstance } from "axios";

// Base URLs for the services
const USER_BASE_URL = import.meta.env.VITE_USER_API_BASE_URL || "http://localhost:8081";
const PLACE_BASE_URL = import.meta.env.VITE_PLACE_API_BASE_URL || "http://localhost:8082";
const REVIEW_BASE_URL = import.meta.env.VITE_REVIEW_API_BASE_URL || "http://localhost:8083";

export const userApi = axios.create({
  baseURL: USER_BASE_URL,
});

export const placeApi = axios.create({
  baseURL: PLACE_BASE_URL,
});

export const reviewApi = axios.create({
  baseURL: REVIEW_BASE_URL,
});

// Configure interceptors for an AxiosInstance
const setupInterceptors = (instance: AxiosInstance, name: string) => {
  // Request log
  instance.interceptors.request.use((config) => {
    console.debug(`[api:${name}] request`, {
      method: config.method,
      url: config.baseURL ? `${config.baseURL}${config.url ?? ""}` : config.url,
    });
    return config;
  });

  // JWT Token Attachment
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response log / error log
  instance.interceptors.response.use(
    (response) => {
      console.debug(`[api:${name}] response`, {
        status: response.status,
        url: response.config.baseURL ? `${response.config.baseURL}${response.config.url ?? ""}` : response.config.url,
      });
      return response;
    },
    (error) => {
      console.debug(`[api:${name}] error`, {
        status: error.response?.status,
        url: error.config?.baseURL ? `${error.config.baseURL}${error.config.url ?? ""}` : error.config?.url,
        data: error.response?.data,
      });
      return Promise.reject(error);
    }
  );
};

// Setup interceptors for all API clients
setupInterceptors(userApi, "user");
setupInterceptors(placeApi, "place");
setupInterceptors(reviewApi, "review");

// Default export maps to userApi for backward compatibility
const api = userApi;
export default api;