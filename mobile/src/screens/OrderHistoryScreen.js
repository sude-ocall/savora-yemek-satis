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
import { useFocusEffect } from "@react-navigation/native";
import { getUserOrders, cancelOrder } from "../services/orderService";

const statusMap = {
  new: { label: "Yeni", color: "#3498db", icon: "🆕" },
  preparing: { label: "Hazırlanıyor", color: "#f39c12", icon: "👨‍🍳" },
  on_the_way: { label: "Yola Çıktı", color: "#9b59b6", icon: "🚗" },
  completed: { label: "Teslim Edildi", color: "#27ae60", icon: "✅" },
  cancelled: { label: "İptal Edildi", color: "#e74c3c", icon: "❌" },
};

const OrderHistoryScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ─── Siparişleri Çek ───────────────────────────────────────────────────────
  const fetchOrders = async () => {
    try {
      const data = await getUserOrders();
      // En yeni sipariş üstte
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

  // Sayfa odaklandığında güncelle
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  // ─── Sipariş İptal ─────────────────────────────────────────────────────────
  const handleCancel = (orderId) => {
    Alert.alert("Sipariş İptali", "Bu siparişi iptal etmek istiyor musunuz?", [
      { text: "Hayır", style: "cancel" },
      {
        text: "Evet, İptal Et",
        style: "destructive",
        onPress: async () => {
          try {
            await cancelOrder(orderId);
            Alert.alert("Başarılı", "Sipariş iptal edildi.");
            fetchOrders();
          } catch (error) {
            const msg =
              error.response?.data?.message || "Sipariş iptal edilemedi.";
            Alert.alert("Hata", msg);
          }
        },
      },
    ]);
  };

  // ─── Tarih Formatlama ──────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ─── Sipariş Kartı ─────────────────────────────────────────────────────────
  const renderOrder = ({ item }) => {
    const status = statusMap[item.status] || statusMap.new;
    const itemCount = item.menu?.reduce((s, m) => s + (m.quantity || 1), 0) || 0;
    const restaurantName =
      item.restaurantId?.restaurantName || item.restaurantId?.name || "Restoran";

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate("SiparişTakip", { orderId: item._id })}
        activeOpacity={0.7}
      >
        {/* Üst Kısım */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.restaurantName}>{restaurantName}</Text>
            <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color + "20" }]}>
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.icon} {status.label}
            </Text>
          </View>
        </View>

        {/* Ürün Listesi */}
        <View style={styles.orderItems}>
          {item.menu?.slice(0, 3).map((menuItem, idx) => (
            <Text key={idx} style={styles.menuItem}>
              {menuItem.quantity || 1}x{" "}
              {menuItem.productId?.name || "Ürün"}
            </Text>
          ))}
          {(item.menu?.length || 0) > 3 && (
            <Text style={styles.moreItems}>
              +{item.menu.length - 3} ürün daha
            </Text>
          )}
        </View>

        {/* Alt Kısım */}
        <View style={styles.orderFooter}>
          <Text style={styles.itemCount}>{itemCount} ürün</Text>

          {item.status === "new" && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancel(item._id)}
            >
              <Text style={styles.cancelButtonText}>İptal Et</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => navigation.navigate("SiparişTakip", { orderId: item._id })}
          >
            <Text style={styles.detailButtonText}>Detay →</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Siparişler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchOrders();
            }}
            colors={["#FF6B35"]}
          />
        }
        ListHeaderComponent={
          <Text style={styles.screenTitle}>📋 Sipariş Geçmişi</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>Henüz sipariş yok</Text>
            <Text style={styles.emptySubtitle}>
              İlk siparişinizi verin, burada görünecek!
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#888",
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  orderDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  orderItems: {
    marginBottom: 12,
  },
  menuItem: {
    fontSize: 14,
    color: "#555",
    marginBottom: 2,
  },
  moreItems: {
    fontSize: 13,
    color: "#888",
    fontStyle: "italic",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  itemCount: {
    fontSize: 13,
    color: "#888",
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#fee",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelButtonText: {
    fontSize: 13,
    color: "#e74c3c",
    fontWeight: "600",
  },
  detailButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  detailButtonText: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
});

export default OrderHistoryScreen;
