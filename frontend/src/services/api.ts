import axios from "axios";

export const api = axios.create({
  // baseURL: "http://localhost:3000/api",
  // baseURL: import.meta.env.VITE_API_BASE_URL || "https://baleryon-admin.onrender.com/api",
  // baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api",
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://api.admin.baleryon.in/api",


});