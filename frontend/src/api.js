import axios from "axios";
const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
export const fetchMetrics = () => axios.get(`${BASE}/metrics`).then(r => r.data);
