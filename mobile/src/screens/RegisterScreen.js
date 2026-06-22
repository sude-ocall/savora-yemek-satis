// src/screens/RegisterScreen.js
// Gereksinim 1 — Üye Kaydı: POST /users/register { name, email, phone, password }
// Başarı (201) → otomatik giriş (POST /users/login) → uygulamaya girer.
import React, { useState } from "react";
import {
  ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerUser, loginUser } from "../services/authService";
import Feedback from "../components/Feedback";

function validatePassword(p) {
  if (p.length < 8) return "Şifre en az 8 karakter olmalı.";
  if (!/[a-z]/.test(p) || !/[A-Z]/.test(p)) return "Şifre büyük ve küçük harf içermeli.";
  return "";
}

const RegisterScreen = ({ navigation, onLoginSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [pwError, setPwError] = useState("");

  const handleRegister = async () => {
    const e = validatePassword(password);
    setPwError(e);
    if (e) return;
    if (!name.trim() || !email.trim()) {
      setResult({ ok: false, status: "—", message: "Ad ve e-posta zorunlu.", data: null });
      return;
    }
    setResult(null);
    setLoading(true);
    try {
      const reg = await registerUser({ name, email, phone, password });
      setResult({ ok: true, status: 201, message: "Kayıt başarılı! Giriş yapılıyor...", data: reg });
      // Otomatik giriş
      const data = await loginUser(email.trim(), password);
      await AsyncStorage.setItem("savora_token", data.token);
      const userObj = { ...data.user, role: data.user.role || "customer" };
      await AsyncStorage.setItem("savora_user", JSON.stringify(userObj));
      setTimeout(() => onLoginSuccess(data.token, userObj), 600);
    } catch (err) {
      setResult({
        ok: false,
        status: err.response?.status || "Bağlantı",
        message: err.response?.data?.message || "Kayıt başarısız.",
        data: err.response?.data || { error: err.message },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.logo}>🍳</Text>
      <Text style={styles.title}>Aramıza Katıl</Text>
      <Text style={styles.subtitle}>Birkaç saniyede hesabını oluştur.</Text>

      <View style={styles.card}>
        <Field label="Ad Soyad" value={name} onChangeText={setName} placeholder="Adınız Soyadınız" autoCapitalize="words" />
        <Field label="E-posta" value={email} onChangeText={setEmail} placeholder="ornek@email.com" keyboardType="email-address" autoCapitalize="none" />
        <Field label="Telefon" value={phone} onChangeText={setPhone} placeholder="05XX XXX XX XX" keyboardType="phone-pad" />
        <Field
          label="Şifre" value={password}
          onChangeText={(t) => { setPassword(t); if (pwError) setPwError(validatePassword(t)); }}
          placeholder="En az 8 karakter, büyük+küçük harf" secureTextEntry
        />
        {pwError ? <Text style={styles.err}>{pwError}</Text> : <Text style={styles.hint}>Şifre: en az 8 karakter, 1 büyük + 1 küçük harf.</Text>}

        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Üye Ol</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={styles.link}>Zaten hesabın var mı? <Text style={{ fontWeight: "800" }}>Giriş Yap</Text></Text>
        </TouchableOpacity>

        <Feedback result={result} />
      </View>
    </ScrollView>
  );
};

// Etiketli input
const Field = ({ label, ...props }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput style={styles.input} placeholderTextColor="#999" {...props} />
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FF6B35" },
  content: { padding: 20, paddingTop: 70, paddingBottom: 40 },
  logo: { fontSize: 44, textAlign: "center" },
  title: { fontSize: 26, fontWeight: "800", color: "#fff", textAlign: "center", marginTop: 4 },
  subtitle: { fontSize: 14, color: "#ffe3d6", textAlign: "center", marginBottom: 20 },
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 24 },
  inputContainer: { marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#555", marginBottom: 6 },
  input: { backgroundColor: "#f5f5f7", borderRadius: 12, padding: 14, fontSize: 16, color: "#1a1a2e", borderWidth: 1, borderColor: "#e8e8e8" },
  err: { color: "#D7263D", fontSize: 12, marginTop: -8, marginBottom: 8 },
  hint: { color: "#888", fontSize: 12, marginTop: -8, marginBottom: 8 },
  btn: { backgroundColor: "#FF6B35", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 6 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  link: { color: "#FF6B35", textAlign: "center", fontSize: 14 },
});

export default RegisterScreen;
