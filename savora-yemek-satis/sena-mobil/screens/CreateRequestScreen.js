import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "https://savora-yemek-satis-backend.vercel.app/api";

export default function CreateRequestScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Uyari", "Yemek adi ve aciklama zorunludur.");
      return;
    }
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      console.log("TOKEN:", token);
      const res = await axios.post(BASE_URL + "/offers", { title, description, category }, { headers: { Authorization: "Bearer " + token } });
      console.log("BASARILI:", res.data);
      Alert.alert("Basarili", "Talep olusturuldu!");
    } catch (error) {
      console.log("HATA:", error.response?.status, error.response?.data);
      Alert.alert("Hata", "Bir hata olustu: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ozel Yemek Talebi Olustur</Text>
      <Text style={styles.label}>Yemek Adi</Text>
      <TextInput style={styles.input} placeholder="Ornek: Ev yapimi karni yarik" value={title} onChangeText={setTitle} />
      <Text style={styles.label}>Aciklama</Text>
      <TextInput style={[styles.input, styles.textArea]} placeholder="Detay verin..." value={description} onChangeText={setDescription} multiline={true} />
      <Text style={styles.label}>Kategori</Text>
      <TextInput style={styles.input} placeholder="Ornek: Ana Yemek" value={category} onChangeText={setCategory} />
      <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Talep Olustur</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", color: "#e63946", marginBottom: 24, textAlign: "center" },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: "#f9f9f9" },
  textArea: { height: 100, textAlignVertical: "top" },
  button: { backgroundColor: "#e63946", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 28 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});