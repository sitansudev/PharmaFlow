import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:5001/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("accessToken")
      : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});