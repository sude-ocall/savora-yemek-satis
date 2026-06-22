// src/screens/ProfileScreen.js
// Gereksinim 2 — Profil: GET /users/profile (token)
// Gereksinim 4 — Hesap Silme: DELETE /users/account (alttaki kırmızı buton)
import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet, RefreshControl, Alert, ActivityIndicator,
} from "react-native";
import api from "../services/api";
import Feedback from "../components/Feedback";

const ProfileScreen = ({ navigation, handleLogout }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [result, setResult] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/users/profile");
      setProfile(res.data.user);
    } catch (err) {
      setResult({ ok: false, status: err.response?.status || "Bağlantı", message: err.response?.data?.message || "Profil getirilemedi.", data: err.response?.data || { error: err.message } });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const onRefresh = () => { setRefreshing(true); fetchProfile(); };

  const confirmDelete = () => {
    Alert.alert("Hesabı Sil", "Emin misiniz? Bu işlem geri alınamaz.", [
      { text: "Vazgeç", style: "cancel" },
      { text: "Evet, Sil", style: "destructive", onPress: doDelete },
    ]);
  };

  const doDelete = async () => {
    try {
      const res = await api.delete("/users/account");
      setResult({ ok: true, status: res.status, message: "Hesabın silindi. Çıkış yapılıyor...", data: res.data });
      setTimeout(() => handleLogout && handleLogout(), 1300);
    } catch (err) {
      setResult({ ok: false, status: err.response?.status || "Bağlantı", message: err.response?.data?.message || "Hesap silinemedi.", data: err.response?.data || { error: err.message } });
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#FF6B35" /></View>;
  }

  const p = profile || {};
  const addresses = p.addresses || [];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B35" />}>
      <View style={styles.head}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(p.name || "?").charAt(0).toUpperCase()}</Text></View>
        <Text style={styles.name}>{p.name}</Text>
        <Text style={styles.email}>{p.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Telefon</Text>
        <Text style={styles.value}>{p.phone ? p.phone : "—"}</Text>
        <View style={styles.divider} />
        <Text style={styles.label}>Adreslerim ({addresses.length})</Text>
        {addresses.length === 0 ? (
          <Text style={styles.value}>Henüz adres eklenmedi.</Text>
        ) : addresses.map((a, i) => (
          <Text key={i} style={styles.addr}>📍 {a.title ? a.title + " — " : ""}{a.addressLine}, {a.district}/{a.city}</Text>
        ))}
      </View>

      <MenuButton icon="📍" text="Adres Ekle" onPress={() => navigation.navigate("Adreslerim")} />
      <MenuButton icon="🔒" text="Şifre Değiştir" onPress={() => navigation.navigate("SifreDegistir")} />
      <MenuButton icon="⭐" text="Satıcı Yorumları" onPress={() => navigation.navigate("SaticiYorumlari")} />

      <Feedback result={result} />

      <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
        <Text style={styles.deleteText}>Hesabımı Sil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const MenuButton = ({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.menuBtn} onPress={onPress} activeOpacity={0.8}>
    <Text style={styles.menuIcon}>{icon}</Text>
    <Text style={styles.menuText}>{text}</Text>
    <Text style={styles.menuChevron}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8F7F3" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8F7F3" },
  content: { padding: 20, paddingBottom: 50 },
  head: { alignItems: "center", marginBottom: 20, marginTop: 8 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#FF6B35", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { color: "#fff", fontSize: 38, fontWeight: "800" },
  name: { fontSize: 22, fontWeight: "800", color: "#1a1a2e" },
  email: { fontSize: 14, color: "#888", marginTop: 2 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#eee" },
  label: { fontSize: 12, color: "#888", fontWeight: "700" },
  value: { fontSize: 15, color: "#1a1a2e", marginTop: 4 },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 14 },
  addr: { fontSize: 14, color: "#1a1a2e", marginTop: 6 },
  menuBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "#eee" },
  menuIcon: { fontSize: 22, marginRight: 14 },
  menuText: { flex: 1, fontSize: 16, fontWeight: "600", color: "#1a1a2e" },
  menuChevron: { fontSize: 24, color: "#FF6B35" },
  deleteBtn: { backgroundColor: "#D7263D", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 24 },
  deleteText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

export default ProfileScreen;
