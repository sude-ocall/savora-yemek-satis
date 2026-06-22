import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";

const DUMMY_OFFERS = [
  { _id: "1", menuRequest: { title: "4 kislik vejetaryen iftar menusu", description: "Et urunu icermeyen, ev yapimi tatlar tercih edilir.", category: "Vejetaryen" }, createdAt: "2026-04-05T21:53:29.727Z" },
  { _id: "2", menuRequest: { title: "Ev yapimi manti", description: "Yogurtlu, sarmisak soslu manti istiyorum.", category: "Ana Yemek" }, createdAt: "2026-06-22T10:54:34.322Z" },
  { _id: "3", menuRequest: { title: "Kofte tabagi", description: "Cok olsun, yaninda pilav olsun.", category: "Ana Yemek" }, createdAt: "2026-06-22T16:52:21.365Z" },
];

export default function RegionalRequestsScreen({ navigation }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setOffers(DUMMY_OFFERS);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Bolgesel Talepler</Text>
      <FlatList
        data={offers}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text style={styles.empty}>Hic talep yok.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("UpdateOffer", { offer: item })}>
            <Text style={styles.cardTitle}>{item.menuRequest?.title || "Talep"}</Text>
            <Text style={styles.cardDesc}>{item.menuRequest?.description}</Text>
            <Text style={styles.cardCategory}>{item.menuRequest?.category || "Genel"}</Text>
            <Text style={styles.cardDate}>{new Date(item.createdAt).toLocaleDateString("tr-TR")}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 20, fontWeight: "bold", color: "#e63946", marginBottom: 16, textAlign: "center" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#222", marginBottom: 4 },
  cardDesc: { fontSize: 13, color: "#666", marginBottom: 6 },
  cardCategory: { fontSize: 12, color: "#e63946" },
  cardDate: { fontSize: 11, color: "#999" },
  empty: { textAlign: "center", color: "#999", marginTop: 40, fontSize: 15 },
});