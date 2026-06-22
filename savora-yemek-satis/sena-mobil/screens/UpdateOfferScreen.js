import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "https://savora-yemek-satis-backend.vercel.app/api";

export default function UpdateOfferScreen({ route, navigation }) {
  const params = route.params || {};
  const offer = params.offer || { _id: "", menuRequest: { title: "Talep secin", description: "Bolgesel talepler ekranindan secin" } };
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!price || isNaN(price)) {
      Alert.alert("Uyari", "Gecerli bir fiyat girin.");
      return;
    }
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("sellerToken");
      await axios.put(BASE_URL + "/offers/" + offer._id + "/offer", { price: Number(price), message }, { headers: { Authorization: "Bearer " + token } });
      Alert.alert("Basarili", "Teklif guncellendi!", [{ text: "Tamam", onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert("Hata", "Guncelleme basarisiz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Teklif Guncelle</Text>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>{offer.menuRequest?.title}</Text>
        <Text style={styles.summaryDesc}>{offer.menuRequest?.description}</Text>
      </View>
      <Text style={styles.label}>Yeni Fiyat (TL)</Text>
      <TextInput style={styles.input} placeholder="Ornek: 150" value={price} onChangeText={setPrice} keyboardType="numeric" />
      <Text style={styles.label}>Mesaj</Text>
      <TextInput style={[styles.input, styles.textArea]} placeholder="Not ekleyin..." value={message} onChangeText={setMessage} multiline={true} />
      <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Teklifi Guncelle</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", color: "#e63946", marginBottom: 20, textAlign: "center" },
  summaryBox: { backgroundColor: "#fff8f8", borderLeftWidth: 4, borderLeftColor: "#e63946", borderRadius: 8, padding: 14, marginBottom: 20 },
  summaryText: { fontSize: 16, fontWeight: "bold", color: "#222" },
  summaryDesc: { fontSize: 13, color: "#666", marginTop: 4 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: "#f9f9f9" },
  textArea: { height: 90, textAlignVertical: "top" },
  button: { backgroundColor: "#e63946", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 28 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});