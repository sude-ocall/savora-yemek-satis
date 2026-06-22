// src/components/Feedback.js
// Temiz başarı/hata bildirimi. (Teknik JSON kutusu kaldırıldı — backend kanıtı
// terminal loglarından kontrol ediliyor.)
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Feedback({ result }) {
  if (!result) return null;
  const ok = result.ok;

  return (
    <View style={styles.wrap}>
      <View style={[styles.banner, { backgroundColor: ok ? "#E8F8EE" : "#FDECEA" }]}>
        <Text style={[styles.icon, { color: ok ? "#10B981" : "#D7263D" }]}>{ok ? "✓" : "✗"}</Text>
        <Text style={[styles.msg, { color: ok ? "#0c7a4d" : "#b3261e" }]}>{result.message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 18 },
  banner: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12 },
  icon: { fontSize: 18, fontWeight: "800", marginRight: 10 },
  msg: { fontSize: 14, fontWeight: "600", flex: 1 },
});
