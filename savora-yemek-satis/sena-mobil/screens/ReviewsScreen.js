import React, { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput } from "react-native";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";

const BASE_URL = "https://savora-yemek-satis-backend.vercel.app/api";
const ORANGE = "#FF6B35";

const DUMMY_REVIEWS = [
  { _id: "1", user: "Ahmet K.", rating: 5, text: "Cok lezzetliydi, tavsiye ederim!" },
  { _id: "2", user: "Ayse M.", rating: 4, text: "Guzel yemekler, biraz gec geldi." },
];

export default function ReviewsScreen({ route, navigation }) {
  const { sellerId = "", sellerName = "Yorumlar" } = route.params || {};
  const [reviews, setReviews] = useState(DUMMY_REVIEWS);
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const fetchReviews = async () => {
    if (!sellerId) return;
    try {
      setLoading(true);
      const res = await axios.get(BASE_URL + "/reviews/" + sellerId);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setReviews(res.data);
      }
    } catch (error) {
      console.log("Yorumlar yuklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchReviews(); }, []));

  const handleDelete = (reviewId) => {
    Alert.alert("Sil", "Bu yorumu silmek istediğine emin misin?", [
      { text: "Iptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: () => {
        setReviews(reviews.filter(r => r._id !== reviewId));
      }}
    ]);
  };

  const handleReply = (reviewId) => {
    if (!replyText.trim()) return;
    setReviews(reviews.map(r => r._id === reviewId ? { ...r, reply: replyText } : r));
    setReplyText("");
    setReplyingTo(null);
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text style={styles.empty}>Henuz yorum yok.</Text>}
        renderItem={({ item }) => (
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View>
                <Text style={styles.userName}>{item.user || "Kullanici"}</Text>
                <Text style={styles.stars}>{"★".repeat(item.rating)}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item._id)}>
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.reviewText}>{item.text}</Text>
            {item.reply ? (
              <View style={styles.replyBox}>
                <Text style={styles.replyTitle}>Satici Yaniti:</Text>
                <Text style={styles.replyText}>{item.reply}</Text>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setReplyingTo(item._id)}>
                <Text style={styles.replyBtn}>↩️ Yanitla</Text>
              </TouchableOpacity>
            )}
            {replyingTo === item._id && (
              <View style={styles.replyInputContainer}>
                <TextInput style={styles.input} value={replyText} onChangeText={setReplyText} placeholder="Yanitin..." />
                <TouchableOpacity onPress={() => handleReply(item._id)} style={styles.sendBtn}>
                  <Text style={{ color: "#fff" }}>Gonder</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddReview", { sellerId, sellerName })}>
        <Text style={styles.addButtonText}>+ Yorum Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { textAlign: "center", color: "#999", marginTop: 40 },
  reviewCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  userName: { fontWeight: "700" },
  stars: { color: "#f39c12" },
  reviewText: { fontSize: 14, color: "#555" },
  deleteIcon: { fontSize: 16, backgroundColor: "#FFF0F5", padding: 6, borderRadius: 8 },
  replyBox: { marginTop: 10, padding: 10, backgroundColor: "#FFF5EE", borderRadius: 8, borderLeftWidth: 3, borderLeftColor: ORANGE },
  replyTitle: { fontSize: 11, fontWeight: "bold", color: ORANGE },
  replyText: { fontSize: 13, fontStyle: "italic", color: "#444" },
  replyBtn: { color: ORANGE, fontSize: 12, fontWeight: "700", marginTop: 8 },
  replyInputContainer: { flexDirection: "row", marginTop: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 8 },
  sendBtn: { backgroundColor: ORANGE, padding: 8, borderRadius: 8, marginLeft: 8, justifyContent: "center" },
  addButton: { backgroundColor: "#e63946", padding: 15, borderRadius: 12, alignItems: "center", marginTop: 8 },
  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});