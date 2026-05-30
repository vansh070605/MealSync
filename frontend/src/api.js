// api.js — Firebase + Axios API client
import axios from "axios";
import { ref, get, set, push, update, remove } from "firebase/database";
import { database } from "./firebase";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Users ────────────────────────────────────────────────────────────────────
export const getUsers = async (flatId) => {
  if (!flatId) return { data: [] };
  const snapshot = await get(ref(database, `flats/${flatId}/users`));
  if (snapshot.exists()) {
    const usersObj = snapshot.val();
    const usersArray = Object.keys(usersObj).map(key => ({ id: key, ...usersObj[key] }));
    return { data: usersArray };
  }
  return { data: [] };
};

export const getUser = async (flatId, id) => {
  const snapshot = await get(ref(database, `flats/${flatId}/users/${id}`));
  return { data: snapshot.exists() ? { id, ...snapshot.val() } : null };
};

export const updateUser = async (flatId, id, data) => {
  await update(ref(database, `flats/${flatId}/users/${id}`), data);
  return { data: { id, ...data } };
};

export const deleteUser = async (flatId, id) => {
  await remove(ref(database, `flats/${flatId}/users/${id}`));
  return { data: null };
};

export const createUser = async (flatId, data) => {
  const newUserRef = push(ref(database, `flats/${flatId}/users`));
  await set(newUserRef, { ...data, id: newUserRef.key, flat_id: flatId });
  return { data: { id: newUserRef.key, ...data, flat_id: flatId } };
};

// ── Flats ────────────────────────────────────────────────────────────────────
export const createFlat = async (name) => {
  const newFlatRef = push(ref(database, `flats`));
  await set(newFlatRef, { id: newFlatRef.key, name, created_at: Date.now() });
  return { data: { id: newFlatRef.key, name } };
};

export const deleteFlat = async (id) => {
  await remove(ref(database, `flats/${id}`));
  return { data: null };
};

// ── Recommend ────────────────────────────────────────────────────────────────
export const recommend = (kitchen_state) =>
  api.post("/recommend", kitchen_state);

// ── History ──────────────────────────────────────────────────────────────────
export const getHistory = async (flatId, limit = 20) => {
  if (!flatId) return { data: [] };
  const snapshot = await get(ref(database, `flats/${flatId}/history`));
  if (snapshot.exists()) {
    const historyObj = snapshot.val();
    let arr = Object.keys(historyObj).map(k => ({ id: k, ...historyObj[k] }));
    arr.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return { data: arr.slice(0, limit) };
  }
  return { data: [] };
};

export const selectMeal = async (flatId, data) => {
  const newHistoryRef = push(ref(database, `flats/${flatId}/history`));
  await set(newHistoryRef, { ...data, timestamp: new Date().toISOString() });
  return { data: { id: newHistoryRef.key } };
};

export const clearHistory = async (flatId) => {
  await remove(ref(database, `flats/${flatId}/history`));
  return { data: null };
};

export const getAnalytics = async () => {
  // Mock or skip since analytics is not fully implemented in frontend yet
  return { data: { total_meals_cooked: 0, average_satisfaction: {} } };
};

// ── User Profiles ────────────────────────────────────────────────────────────
export const getUserProfile = async (userId) => {
  const snapshot = await get(ref(database, `users/${userId}`));
  return { data: snapshot.exists() ? snapshot.val() : null };
};

export const saveUserProfile = async (userId, data) => {
  await set(ref(database, `users/${userId}`), data);
  return { data };
};

export const saveUser = async (flatId, userId, data) => {
  await set(ref(database, `flats/${flatId}/users/${userId}`), { ...data, id: userId, flat_id: flatId });
  return { data: { id: userId, ...data, flat_id: flatId } };
};

// ── Grocery Lists ────────────────────────────────────────────────────────────
export const getGroceryList = async (flatId) => {
  if (!flatId) return { data: [] };
  const snapshot = await get(ref(database, `flats/${flatId}/grocery_list`));
  if (snapshot.exists()) {
    const listObj = snapshot.val();
    return { data: Object.keys(listObj).map(key => ({ id: key, ...listObj[key] })) };
  }
  return { data: [] };
};

export const addGroceryItem = async (flatId, data) => {
  const newItemRef = push(ref(database, `flats/${flatId}/grocery_list`));
  await set(newItemRef, { ...data, id: newItemRef.key, checked: false, timestamp: Date.now() });
  return { data: { id: newItemRef.key, ...data, checked: false } };
};

export const updateGroceryItem = async (flatId, itemId, data) => {
  await update(ref(database, `flats/${flatId}/grocery_list/${itemId}`), data);
  return { data };
};

export const deleteGroceryItem = async (flatId, itemId) => {
  await remove(ref(database, `flats/${flatId}/grocery_list/${itemId}`));
  return { data: null };
};

export const clearGroceryList = async (flatId) => {
  await remove(ref(database, `flats/${flatId}/grocery_list`));
  return { data: null };
};

export default api;
