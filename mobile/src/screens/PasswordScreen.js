// src/screens/PasswordScreen.js
// Gereksinim 3 — Şifre: PUT /users/password { currentPassword, newPassword }
import React, { useState } from "react";
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import api from "../services/api";
import Feedback from "../components/Feedback";

function validatePassword(p) {
  if (p.length < 8) return "Yeni şifre en az 8 karakter olmalı.";
  if (!/[a-z]/.test(p) || !/[A-Z]/.test(p)) return "Yeni şifre büyük ve küçük harf içermeli.";
  return "";
}

const PasswordScreen = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [pwError, setPwError] = useState("");

  const handleUpdate = async () => {
    const e = validatePassword(newPassword);
    setPwError(e);
    if (e) return;
    setResult(null);
    setLoading(true);
    try {
      const res = await api.put("/users/password", { currentPassword, newPassword });
      setResult({ ok: true, status: res.status, message: res.data.message || "Şifre güncellendi.", data: res.data });
      setCurrentPassword(""); setNewPassword("");
    } catch (err) {
      setResult({
        ok: false,
        status: err.response?.status || "Bağlantı",
        message: err.response?.status === 400 ? "Mevcut şifren hatalı." : (err.response?.data?.message || "Şifre güncellenemedi."),
        data: err.response?.data || { error: err.message },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Şifre Değiştir</Text>
      <Text style={styles.sub}>Güvenliğin için güçlü bir şifre seç.</Text>

      <View style={styles.card}>
        <Field label="Mevcut Şifre" value={currentPassword} onChangeText={setCurrentPassword} placeholder="••••••••" secureTextEntry />
        <Field label="Yeni Şifre" value={newPassword}
          onChangeText={(t) => { setNewPassword(t); if (pwError) setPwError(validatePassword(t)); }}
          placeholder="En az 8 karakter, büyük+küçük harf" secureTextEntry />
        {pwError ? <Text style={styles.err}>{pwError}</Text> : null}

        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleUpdate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Şifreyi Güncelle</Text>}
        </TouchableOpacity>
      </View>

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
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#eee" },
  inputContainer: { marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#555", marginBottom: 6 },
  input: { backgroundColor: "#f5f5f7", borderRadius: 12, padding: 14, fontSize: 16, color: "#1a1a2e", borderWidth: 1, borderColor: "#e8e8e8" },
  err: { color: "#D7263D", fontSize: 12, marginTop: -8, marginBottom: 8 },
  btn: { backgroundColor: "#FF6B35", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 6 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});

export default PasswordScreen;
