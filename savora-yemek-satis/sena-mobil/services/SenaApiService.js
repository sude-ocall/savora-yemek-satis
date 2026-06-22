// ============================================================
// mobile/services/SenaApiService.js
// Sena'nın 5 gereksinimi için API çağrıları
// ============================================================

import axios from "axios";

const BASE_URL = "https://savora-yemek-satis-backend.vercel.app/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token'ı header'a ekleyen yardımcı
const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ── GEREKSİNİM 1: Özel Yemek Talebi Oluşturma ──────────────
// POST /api/offers
export const createOfferRequest = (data, token) =>
  api.post("/offers", data, authHeader(token));
// data: { title, description, category }

// ── GEREKSİNİM 2: Bölgesel Talepleri Listeleme ──────────────
// GET /api/offers/regional  (satıcı token'ı gerekir)
export const getRegionalOffers = (token) =>
  api.get("/offers/regional", authHeader(token));

// ── GEREKSİNİM 3: Teklif Güncelleme ────────────────────────
// PUT /api/offers/:offerId/offer  (satıcı token'ı gerekir)
export const updateOffer = (offerId, data, token) =>
  api.put(`/offers/${offerId}/offer`, data, authHeader(token));
// data: { price, message }

// ── GEREKSİNİM 4: Talebi Geri Çekme ────────────────────────
// DELETE /api/offers/:offerId  (kullanıcı token'ı gerekir)
export const deleteOfferRequest = (offerId, token) =>
  api.delete(`/offers/${offerId}`, authHeader(token));

// ── GEREKSİNİM 5: Satıcıya Yorum Yapma ─────────────────────
// POST /api/reviews/:sellerId  (kullanıcı token'ı gerekir)
export const addReview = (sellerId, data, token) =>
  api.post(`/reviews/${sellerId}`, data, authHeader(token));
// data: { text, rating }

// ── GEREKSİNİM 6 (5. gereksinim): Yorumları Listeleme ───────
// GET /api/reviews/:sellerId  (token gerekmez)
export const getReviews = (sellerId) =>
  api.get(`/reviews/${sellerId}`);

// ── Yardımcı: Kullanıcının kendi taleplerini getir ──────────
export const getUserOffers = (token) =>
  api.get("/offers/my", authHeader(token));
