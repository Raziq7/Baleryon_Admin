import axios from "axios";

export const api = axios.create({
  // baseURL: "http://localhost:3000/api",
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
});