import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL || "";
const cleanBaseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
export const API_BASE_URL = cleanBaseUrl ? `${cleanBaseUrl}/api` : "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("convera_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const loginApi = (email, password) =>
  api.post("/auth/login", { email, password }).then((r) => r.data);

export const registerApi = (email, password, full_name) =>
  api.post("/auth/register", { email, password, full_name }).then((r) => r.data);

export const getMeApi = () => api.get("/auth/me").then((r) => r.data);
export const logoutApi = () => api.post("/auth/logout").then((r) => r.data);
export const updateProfileApi = (full_name, email) =>
  api.put("/auth/profile", { full_name, email }).then((r) => r.data);
export const changePasswordApi = (current_password, new_password) =>
  api.put("/auth/password", { current_password, new_password }).then((r) => r.data);
export const deleteAccountApi = () => api.delete("/auth/account").then((r) => r.data);


// Analysis
export const analyzeText = (payload) => api.post("/analyze/text", payload).then((r) => r.data);

export const analyzeFiles = (fileA, fileB, save = true, nameA = null, nameB = null) => {
  const form = new FormData();
  form.append("file_a", fileA);
  form.append("file_b", fileB);
  form.append("save", save);
  if (nameA) form.append("name_a", nameA);
  if (nameB) form.append("name_b", nameB);
  return api.post("/analyze/files", form, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);
};

export const analyzeMulti = (documents, save = true, title = null) =>
  api.post("/analyze/multi", { documents, save, title }).then((r) => r.data);

// History
export const getHistory = () => api.get("/history").then((r) => r.data);
export const getAnalysis = (id) => api.get(`/history/${id}`).then((r) => r.data);
export const deleteAnalysis = (id) => api.delete(`/history/${id}`).then((r) => r.data);
export const clearHistory = () => api.delete("/history").then((r) => r.data);

export const getComparisonHistory = () => api.get("/history/comparisons").then((r) => r.data);
export const getComparison = (id) => api.get(`/history/comparisons/${id}`).then((r) => r.data);
export const deleteComparison = (id) => api.delete(`/history/comparisons/${id}`).then((r) => r.data);
export const clearComparisonHistory = () => api.delete("/history/comparisons").then((r) => r.data);

export const getQuickStats = () => api.get("/history/stats/summary").then((r) => r.data);

// Documents
export const listDocuments = () => api.get("/documents").then((r) => r.data);
export const uploadDocument = (file) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/documents", form, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);
};
export const getDocument = (id) => api.get(`/documents/${id}`).then((r) => r.data);
export const deleteDocument = (id) => api.delete(`/documents/${id}`).then((r) => r.data);
export const deleteAllDocuments = () => api.delete("/documents").then((r) => r.data);


export const exportCsvUrl = (id) => `${API_BASE_URL}/export/${id}/csv`;
export const exportPdfUrl = (id) => `${API_BASE_URL}/export/${id}/pdf`;

export default api;

