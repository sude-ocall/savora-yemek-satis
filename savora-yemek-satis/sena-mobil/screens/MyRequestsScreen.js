import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, RefreshControl } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "https://savora-yemek-satis-backend.vercel.app/api";

export default function MyRequestsScreen() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyOffers = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      console.log("TALEPLERIM TOKEN:", token);
      const res = await axios.get(BASE_URL + "/offers/my", { headers: { Authorization: "Bearer " + token } });
      console.log("TALEPLERIM DATA:", res.data);
      setOffers(res.data);
    } catch (error) {
      console.log("TALEPLERIM HATA:", error.response?.status, error.response?.data);
      Alert.alert("Hata", "Talepler yuklenemedi.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchMyOffers(); }, []);

  const handleDelete = (offerId) => {
    Alert.alert("Talebi Geri Cek", "Emin misiniz?", [
      { text: "Vazgec", style: "cancel" },
      { text: "Evet", style: "destructive", onPress: () => {
        setOffers(prev => prev.filter(o => o._id !== offerId));
        Alert.alert("Basarili", "Talep geri cekildi.");
      }},
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Taleplerim</Text>
      <FlatList
        data={offers}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMyOffers(); }} />}
        ListEmptyComponent={<Text style={styles.empty}>Henuz talep olusturmadiniz.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.menuRequest?.title || "Talep"}</Text>
            <Text style={styles.cardDesc}>{item.menuRequest?.description}</Text>
            <Text style={styles.cardStatus}>{item.status === "open" ? "Acik" : "Kapali"}</Text>
            {item.status === "open" && (
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item._id)}>
                <Text style={styles.deleteButtonText}>Talebi Geri Cek</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 20, fontWeight: "bold", color: "#e63946", marginBottom: 16, textAlign: "center" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#222", marginBottom: 4 },
  cardDesc: { fontSize: 13, color: "#666", marginBottom: 6 },
  cardStatus: { fontSize: 12, color: "#2a9d8f", marginBottom: 8 },
  deleteButton: { backgroundColor: "#fff0f0", borderWidth: 1, borderColor: "#e63946", borderRadius: 8, padding: 10, alignItems: "center" },
  deleteButtonText: { color: "#e63946", fontWeight: "bold", fontSize: 13 },
  empty: { textAlign: "center", color: "#999", marginTop: 40, fontSize: 15 },
});