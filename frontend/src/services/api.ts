import axios from "axios";

export const api = axios.create({
  // baseURL: "http://localhost:5000/api",
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://34.229.85.98/api",
});
