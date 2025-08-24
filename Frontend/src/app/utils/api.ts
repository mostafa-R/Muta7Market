"use client";

import axios from "axios";

export const API_BASE = (() => {
  const v = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!v) {
    // Fallback to a default URL if environment variable is not set
    return "http://localhost:3001/api/v1";
  }
  return v.endsWith("/api/v1") ? v : `${v}/api/v1`;
})();

export function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {} as Record<string, string>;
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : ({} as Record<string, string>);
}

// Create a configured axios instance
export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token to all requests
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error details
    if (error.response) {
      console.error("API Error Response:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      console.error("API Request Error (No Response):", error.request);
    } else {
      console.error("API Setup Error:", error.message);
    }

    return Promise.reject(error);
  }
);
