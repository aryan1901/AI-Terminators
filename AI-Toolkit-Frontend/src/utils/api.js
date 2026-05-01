export const API_BASE = "http://localhost:5000/api";

export const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

export const authHeaders = (isJson = true) => {
  const headers = {};
  const token = getToken();

  if (isJson) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return headers;
};