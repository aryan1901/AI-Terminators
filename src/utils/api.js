// src/utils/api.js
export const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5001/api";

export const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

export const authHeaders = (isJson = true) => {
  const headers = {};
  const token = getToken();

  if (isJson) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return headers;
};

export const getUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
    );
  } catch {
    return null;
  }
};