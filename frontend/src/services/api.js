import axios from "axios";

const api = axios.create({ baseURL: "http://127.0.0.1:5000/api" });

export const getPageMap = (path) => api.post("/document/pagemap", { path });
 = (path) => api.post("/document/understand", { path });

// Sandbox / Safe Preview
export const sandboxPreview = (path, profile_id, scope, answers) =>
  api.post("/sandbox/preview", { path, profile_id, scope, answers });
export const sandboxCommit  = (path) => api.post("/sandbox/commit",  { path });
export const sandboxDiscard = (path) => api.post("/sandbox/discard", { path });

// Document
export const analyzeDocument = (path) => api.post("/document/analyze", { path });
export const correctDocument = (path, profile_id, stabilize = true) =>
  api.post("/document/correct", { path, profile_id, stabilize });
export const exportDocument = (path, format) => api.post("/document/export", { path, format });
export const getHealthScore = (path) => api.post("/document/health", { path });
export const getStructure = (path) => api.post("/document/structure", { path });
export const getOverlay = (path, profile_id) => api.post("/document/overlay", { path, profile_id });
export const getHistory = (path) => api.post("/document/history", { path });

// Profiles
export const getProfiles = () => api.get("/profiles");
export const createProfile = (data) => api.post("/profiles", data);
export const updateProfile = (id, data) => api.put(`/profiles/${id}`, data);
export const deleteProfile = (id) => api.delete(`/profiles/${id}`);

// Rules
export const getRules = (profileId) => api.get(`/rules/${profileId}`);
export const updateRules = (profileId, rules) => api.put(`/rules/${profileId}`, rules);

// Monitor
export const startMonitor = (path, profile_id) => api.post("/monitor/start", { path, profile_id });
export const stopMonitor = (path) => api.post("/monitor/stop", { path });
export const getMonitorStatus = () => api.get("/monitor/status");

// Integrity Lock
export const enableLock = (path, profile_id) => api.post("/lock/enable", { path, profile_id });
export const disableLock = (path) => api.post("/lock/disable", { path });
export const getLockStatus = (path) => api.post("/lock/status", { path });

// Word COM
export const getWordDocuments = () => api.get("/word/documents");
export const attachWordMonitor = (path, profile_id) => api.post("/word/attach", { path, profile_id });
export const detachWordMonitor = (path) => api.post("/word/detach", { path });

// Batch
export const runBatch = (paths, profile_id, export_format = "") =>
  api.post("/batch/run", { paths, profile_id, export_format });
