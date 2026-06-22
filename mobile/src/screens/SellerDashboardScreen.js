import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSellerOrders, updateOrderStatus } from "../services/orderService";

const statusMap = {
  new: { label: "Yeni", color: "#e74c3c", icon: "🆕" },
  preparing: { label: "Hazırlanıyor", color: "#f39c12", icon: "👨‍🍳" },
  on_the_way: { label: "Yola Çıktı", color: "#9b59b6", icon: "🚗" },
  completed: { label: "Teslim Edildi", color: "#27ae60", icon: "✅" },
  cancelled: { label: "İptal Edildi", color: "#7f8c8d", icon: "❌" },
};

const SellerDashboardScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const data = await getSellerOrders();
      const sorted = (Array.isArray(data) ? data : []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sorted);
    } catch (error) {
      Alert.alert("Hata", "Siparişler yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const handleUpdateStatus = (orderId, newStatus) => {
    Alert.alert("Durum Güncelleme", "Sipariş durumunu güncellemek istiyor musunuz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Güncelle",
        onPress: async () => {
          try {
            await updateOrderStatus(orderId, newStatus);
            Alert.alert("Başarılı", "Sipariş durumu güncellendi!");
            fetchOrders();
          } catch (error) {
            Alert.alert("Hata", "Durum güncellenemedi.");
          }
        },
      },
    ]);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  };

  const renderOrder = ({ item }) => {
    const status = statusMap[item.status] || statusMap.new;

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderIdText}>Sipariş #{item._id.slice(-6)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color + "20" }]}>
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.icon} {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <Text style={styles.customerInfo}>👤 Müşteri: {item.userId?.name || "Bilinmiyor"}</Text>
          <Text style={styles.timeInfo}>🕒 Zaman: {formatDate(item.createdAt)}</Text>
          <View style={styles.menuItems}>
            {item.menu?.map((m, idx) => (
              <Text key={idx} style={styles.menuItemText}>
                • {m.quantity}x {m.productId?.name}
              </Text>
            ))}
          </View>
        </View>

        {/* Aksiyon Butonları Sadece Yeni veya Hazırlanıyor ise görünsün */}
        <View style={styles.actionButtons}>
          {item.status === "new" && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: "#f39c12" }]}
              onPress={() => handleUpdateStatus(item._id, "preparing")}
            >
              <Text style={styles.actionBtnText}>👨‍🍳 Hazırlanıyor Yap</Text>
            </TouchableOpacity>
          )}
          {item.status === "preparing" && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: "#9b59b6" }]}
              onPress={() => handleUpdateStatus(item._id, "on_the_way")}
            >
              <Text style={styles.actionBtnText}>🚗 Yola Çıktı Yap</Text>
            </TouchableOpacity>
          )}
          {item.status === "on_the_way" && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: "#27ae60" }]}
              onPress={() => handleUpdateStatus(item._id, "completed")}
            >
              <Text style={styles.actionBtnText}>✅ Teslim Edildi Yap</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={{ marginTop: 10 }}>Siparişler Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={styles.headerTitle}>🏪 Satıcı Paneli</Text>
          <TouchableOpacity
            onPress={() => {
              Alert.alert("Çıkış Yap", "Emin misiniz?", [
                { text: "İptal", style: "cancel" },
                { text: "Çıkış Yap", style: "destructive", onPress: async () => {
                  await AsyncStorage.multiRemove(["savora_token", "savora_user"]);
                  // Uygulamayı yeniden başlat
                  const RCTDevSettings = require("react-native").NativeModules.DevSettings;
                  if (RCTDevSettings?.reload) RCTDevSettings.reload();
                }}
              ]);
            }}
            style={{ backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Gelen Siparişleri Yönetin</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={renderOrder}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} />}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 50, fontSize: 16 }}>Şu an bekleyen siparişiniz yok.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#10B981",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#fff" },
  headerSubtitle: { fontSize: 14, color: "#e0f2fe", marginTop: 4 },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  orderIdText: { fontSize: 16, fontWeight: "700" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: "700" },
  orderDetails: { marginBottom: 16 },
  customerInfo: { fontSize: 14, color: "#333", marginBottom: 4 },
  timeInfo: { fontSize: 14, color: "#666", marginBottom: 8 },
  menuItems: { backgroundColor: "#f1f5f9", padding: 10, borderRadius: 8 },
  menuItemText: { fontSize: 13, color: "#333" },
  actionButtons: { flexDirection: "row", justifyContent: "flex-end" },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, marginLeft: 10 },
  actionBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});

export default SellerDashboardScreen;
