import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── API Base URL ────────────────────────────────────────────────────────────
// ⚡ GELIŞTIRME (yerel ağ): Aynı WiFi'deki bilgisayarın IP'si
const API_BASE_URL = "http://10.138.16.28:3000/api";

// 🚀 PRODUCTION (Vercel):
// const API_BASE_URL = "https://savora-yemek-satis-backend.vercel.app/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Request Interceptor — Token ekle ────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("savora_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log("Token okuma hatası:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — Hata yönetimi ───────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token geçersiz → logout
      await AsyncStorage.multiRemove(["savora_token", "savora_user"]);
    }
    return Promise.reject(error);
  }
);

export default api;
