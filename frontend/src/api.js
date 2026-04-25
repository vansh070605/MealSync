// api.js — Axios API client
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Users ────────────────────────────────────────────────────────────────────
export const getUsers    = ()         => api.get("/users/");
export const getUser     = (id)       => api.get(`/users/${id}`);
export const updateUser  = (id, data) => api.patch(`/users/${id}`, data);
export const createUser  = (data)     => api.post("/users/", data);

// ── Recommend ────────────────────────────────────────────────────────────────
export const recommend = (kitchen_state) =>
  api.post("/recommend", kitchen_state);

// ── History ──────────────────────────────────────────────────────────────────
export const getHistory    = (limit = 20) => api.get(`/history?limit=${limit}`);
export const selectMeal    = (data)       => api.post("/history", data);
export const getAnalytics  = ()           => api.get("/analytics");

export default api;
