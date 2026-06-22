// src/screens/ReviewsScreen.js
// Gereksinim 6 — Satıcı Yorumları:
//   GET /sellers           → satıcı listesi
//   GET /reviews/:sellerId → o satıcının yorumları
import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import api from "../services/api";
import Feedback from "../components/Feedback";

const stars = (n) => {
  const r = Math.max(0, Math.min(5, Math.round(Number(n) || 0)));
  return "★".repeat(r) + "☆".repeat(5 - r);
};
const fmt = (d) => { try { return new Date(d).toLocaleDateString("tr-TR"); } catch { return ""; } };
const sName = (s) => s.vendorName || s.name || s.shopName || s.title || "Satıcı";

const ReviewsScreen = () => {
  const [sellers, setSellers] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => { fetchSellers(); }, []);

  const fetchSellers = async () => {
    setLoadingSellers(true);
    try {
      const res = await api.get("/sellers");
      setSellers(Array.isArray(res.data) ? res.data : res.data.sellers || []);
    } catch (err) {
      setResult({ ok: false, status: err.response?.status || "Bağlantı", message: err.response?.data?.message || "Satıcılar getirilemedi.", data: err.response?.data || { error: err.message } });
    } finally { setLoadingSellers(false); }
  };

  const openReviews = async (seller) => {
    const id = seller._id || seller.id;
    setSelected(seller); setReviews([]); setResult(null); setLoadingReviews(true);
    try {
      const res = await api.get(`/reviews/${id}`);
      const list = Array.isArray(res.data) ? res.data : [];
      setReviews(list);
      setResult({ ok: true, status: res.status, message: `${sName(seller)} — ${list.length} yorum.`, data: res.data });
    } catch (err) {
      setResult({ ok: false, status: err.response?.status || "Bağlantı", message: err.response?.data?.message || "Yorumlar getirilemedi.", data: err.response?.data || { error: err.message } });
    } finally { setLoadingReviews(false); }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Satıcılar</Text>
      <Text style={styles.sub}>Bir satıcıya dokun, yorumlarını gör.</Text>

      {loadingSellers ? <ActivityIndicator color="#FF6B35" style={{ marginTop: 20 }} />
        : sellers.length === 0 ? <Text style={styles.empty}>Henüz satıcı yok.</Text>
        : sellers.map((s, i) => {
            const id = s._id || s.id;
            const sel = selected && (selected._id || selected.id) === id;
            return (
              <TouchableOpacity key={id || i} style={[styles.seller, sel && styles.sellerActive]} onPress={() => openReviews(s)} activeOpacity={0.85}>
                <Text style={styles.sellerIcon}>🏪</Text>
                <Text style={styles.sellerName}>{sName(s)}</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            );
          })}

      {selected && (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.title}>{sName(selected)} · Yorumlar</Text>
          {loadingReviews ? <ActivityIndicator color="#FF6B35" style={{ marginTop: 14 }} />
            : reviews.length === 0 ? <Text style={styles.empty}>Bu satıcıya henüz yorum yapılmamış.</Text>
            : reviews.map((r, i) => (
                <View key={r._id || i} style={styles.review}>
                  <View style={styles.reviewHead}>
                    <Text style={styles.starsTxt}>{stars(r.rating)}</Text>
                    <Text style={styles.date}>{fmt(r.createdAt)}</Text>
                  </View>
                  <Text style={styles.reviewText}>{r.text}</Text>
                  <Text style={styles.reviewUser}>👤 {r.user || "Anonim"}</Text>
                </View>
              ))}
        </View>
      )}

      <Feedback result={result} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8F7F3" },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: "800", color: "#1a1a2e" },
  sub: { color: "#888", marginBottom: 16, marginTop: 4 },
  empty: { color: "#888", marginTop: 16, textAlign: "center" },
  seller: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "#eee" },
  sellerActive: { borderColor: "#FF6B35", backgroundColor: "#fff5f0" },
  sellerIcon: { fontSize: 22, marginRight: 12 },
  sellerName: { flex: 1, fontSize: 16, fontWeight: "700", color: "#1a1a2e" },
  chevron: { fontSize: 24, color: "#FF6B35" },
  review: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginTop: 10, borderWidth: 1, borderColor: "#eee" },
  reviewHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  starsTxt: { color: "#F5A623", fontSize: 16 },
  date: { fontSize: 12, color: "#888" },
  reviewText: { fontSize: 14, color: "#1a1a2e", lineHeight: 20 },
  reviewUser: { fontSize: 12, color: "#888", marginTop: 8 },
});

export default ReviewsScreen;
