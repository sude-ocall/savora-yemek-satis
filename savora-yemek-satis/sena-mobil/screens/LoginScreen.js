import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import axios from "axios";

const BASE_URL = "https://savora-yemek-satis-backend.vercel.app/api";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Hata", "Email ve şifre giriniz.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/users/login`, { email, password });
      const token = res.data.token;
      navigation.replace("Dashboard", { token });
    } catch (err) {
      Alert.alert("Hata", "Giriş başarısız. Email veya şifre hatalı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Savora - Sena Maral</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Giriş yapılıyor..." : "Giriş Yap"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#FF6B35", marginBottom: 40 },
  input: { width: "100%", borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 15, marginBottom: 15, fontSize: 16 },
  button: { width: "100%", backgroundColor: "#FF6B35", padding: 15, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});