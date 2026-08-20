import axios from "axios";

export const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:5001/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});