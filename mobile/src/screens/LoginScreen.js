import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser, loginSeller } from "../services/authService";

const LoginScreen = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSeller, setIsSeller] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Hata", "E-posta ve şifre gerekli!");
      return;
    }

    setLoading(true);
    try {
      if (isSeller) {
        // Satıcı Girişi
        const data = await loginSeller(email, password);
        await AsyncStorage.setItem("savora_token", data.token);
        await AsyncStorage.setItem(
          "savora_user",
          JSON.stringify({ ...data.seller, role: "seller" })
        );
        onLoginSuccess(data.token, { ...data.seller, role: "seller" });
      } else {
        // Müşteri Girişi
        const data = await loginUser(email, password);
        await AsyncStorage.setItem("savora_token", data.token);
        await AsyncStorage.setItem(
          "savora_user",
          JSON.stringify({ ...data.user, role: data.user.role || "customer" })
        );
        onLoginSuccess(data.token, { ...data.user, role: data.user.role || "customer" });
      }
    } catch (error) {
      const msg =
        error.response?.data?.message || "Giriş başarısız. Tekrar deneyin.";
      Alert.alert("Giriş Hatası", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, isSeller && styles.containerSeller]}
    >
      <View style={styles.card}>
        {/* Logo */}
        <Text style={styles.logo}>{isSeller ? "🏪" : "🍳"}</Text>
        <Text style={styles.title}>Savora</Text>
        <Text style={styles.subtitle}>
          {isSeller ? "Satıcı Paneli Girişi" : "Ev yapımı lezzetler kapınızda"}
        </Text>

        {/* Müşteri / Satıcı Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, !isSeller && styles.toggleBtnActive]}
            onPress={() => setIsSeller(false)}
          >
            <Text style={[styles.toggleText, !isSeller && styles.toggleTextActive]}>
              🍽️ Müşteri
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, isSeller && styles.toggleBtnActiveSeller]}
            onPress={() => setIsSeller(true)}
          >
            <Text style={[styles.toggleText, isSeller && styles.toggleTextActive]}>
              🏪 Satıcı
            </Text>
          </TouchableOpacity>
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>E-posta</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder={isSeller ? "satici@email.com" : "ornek@email.com"}
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Şifre */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Şifre</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••"
            placeholderTextColor="#999"
            secureTextEntry
          />
        </View>

        {/* Giriş Butonu */}
        <TouchableOpacity
          style={[
            styles.loginButton,
            isSeller && styles.loginButtonSeller,
            loading && styles.loginButtonDisabled,
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>
              {isSeller ? "Satıcı Girişi Yap" : "Giriş Yap"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  containerSeller: {
    backgroundColor: "#10B981",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  logo: {
    fontSize: 48,
    textAlign: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    color: "#1a1a2e",
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#f0f0f3",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  toggleBtnActive: {
    backgroundColor: "#FF6B35",
  },
  toggleBtnActiveSeller: {
    backgroundColor: "#10B981",
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
  },
  toggleTextActive: {
    color: "#fff",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f5f5f7",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#1a1a2e",
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  loginButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonSeller: {
    backgroundColor: "#10B981",
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});

export default LoginScreen;
