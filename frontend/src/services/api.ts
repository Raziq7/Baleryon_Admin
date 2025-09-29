import axios from "axios";

export const api = axios.create({
  // baseURL: "http://localhost:3000/api",
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://http://18.209.22.131/api",
});