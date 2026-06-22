// src/screens/AddressScreen.js
// Gereksinim 5 — Adres: POST /users/addresses { title, addressLine, city, district }
import React, { useState } from "react";
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import api from "../services/api";
import Feedback from "../components/Feedback";

const AddressScreen = () => {
  const [title, setTitle] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [addresses, setAddresses] = useState([]);

  const handleSave = async () => {
    if (!addressLine.trim() || !city.trim() || !district.trim()) {
      setResult({ ok: false, status: "—", message: "Açık adres, ilçe ve şehir zorunlu.", data: null });
      return;
    }
    setResult(null);
    setLoading(true);
    try {
      const res = await api.post("/users/addresses", { title, addressLine, city, district });
      setAddresses(res.data.addresses || []);
      setResult({ ok: true, status: res.status, message: res.data.message || "Adres eklendi.", data: res.data });
      setTitle(""); setAddressLine(""); setDistrict(""); setCity("");
    } catch (err) {
      setResult({ ok: false, status: err.response?.status || "Bağlantı", message: err.response?.data?.message || "Adres eklenemedi.", data: err.response?.data || { error: err.message } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Yeni Adres</Text>
      <Text style={styles.sub}>Siparişlerin buraya gelsin.</Text>

      <View style={styles.card}>
        <Field label="Başlık" value={title} onChangeText={setTitle} placeholder='örn: "Ev" / "İş"' autoCapitalize="words" />
        <Field label="Açık Adres" value={addressLine} onChangeText={setAddressLine} placeholder="Mahalle, sokak, no, daire" autoCapitalize="sentences" />
        <Field label="İlçe" value={district} onChangeText={setDistrict} placeholder="İlçe" autoCapitalize="words" />
        <Field label="Şehir" value={city} onChangeText={setCity} placeholder="Şehir" autoCapitalize="words" />

        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Adresi Kaydet</Text>}
        </TouchableOpacity>
      </View>

      {addresses.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.listTitle}>Kayıtlı Adresler ({addresses.length})</Text>
          {addresses.map((a, i) => (
            <Text key={i} style={styles.addr}>📍 {a.title ? a.title + " — " : ""}{a.addressLine}, {a.district}/{a.city}</Text>
          ))}
        </View>
      )}

      <Feedback result={result} />
    </ScrollView>
  );
};

const Field = ({ label, ...props }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput style={styles.input} placeholderTextColor="#999" {...props} />
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8F7F3" },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "800", color: "#1a1a2e", marginTop: 4 },
  sub: { color: "#888", marginBottom: 16, marginTop: 4 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#eee" },
  inputContainer: { marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#555", marginBottom: 6 },
  input: { backgroundColor: "#f5f5f7", borderRadius: 12, padding: 14, fontSize: 16, color: "#1a1a2e", borderWidth: 1, borderColor: "#e8e8e8" },
  btn: { backgroundColor: "#FF6B35", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 6 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  listTitle: { fontWeight: "700", color: "#FF6B35", marginBottom: 8 },
  addr: { fontSize: 14, color: "#1a1a2e", marginBottom: 6 },
});

export default AddressScreen;
