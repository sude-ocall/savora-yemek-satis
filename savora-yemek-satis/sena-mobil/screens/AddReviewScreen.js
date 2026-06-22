import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "https://savora-yemek-satis-backend.vercel.app/api";

export default function AddReviewScreen({ route, navigation }) {
  const { sellerId = "69d2d67ac3a537b66ba5b9e0", sellerName = "Satici" } = route.params || {};
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Uyari", "Lutfen puan verin.");
      return;
    }
    if (!text.trim()) {
      Alert.alert("Uyari", "Yorum yazin.");
      return;
    }
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      console.log("YORUM TOKEN:", token);
      console.log("SELLER ID:", sellerId);
      const res = await axios.post(BASE_URL + "/reviews/" + sellerId, { text, rating }, { headers: { Authorization: "Bearer " + token } });
      console.log("YORUM BASARILI:", res.data);
      Alert.alert("Basarili", "Yorumunuz eklendi!", [{ text: "Tamam", onPress: () => navigation.goBack() }]);
    } catch (error) {
      console.log("YORUM HATA:", error.response?.status, error.response?.data);
      Alert.alert("Hata", "Yorum gonderilemedi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{sellerName} icin Yorum Yap</Text>
      <Text style={styles.label}>Puaniniz</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((s) => (
          <TouchableOpacity key={s} onPress={() => setRating(s)}>
            <Text style={[styles.star, s <= rating && styles.starActive]}>{s <= rating ? "★" : "☆"}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Yorumunuz</Text>
      <TextInput style={[styles.input, styles.textArea]} placeholder="Deneyiminizi paylasın..." value={text} onChangeText={setText} multiline={true} />
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Yorum Gonder</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", color: "#e63946", marginBottom: 24, textAlign: "center" },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 6, marginTop: 12 },
  stars: { flexDirection: "row", marginBottom: 8 },
  star: { fontSize: 36, color: "#ddd", marginRight: 8 },
  starActive: { color: "#f4a261" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: "#f9f9f9" },
  textArea: { height: 120, textAlignVertical: "top" },
  button: { backgroundColor: "#e63946", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 28 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});