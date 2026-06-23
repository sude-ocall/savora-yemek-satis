import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Animated,
} from "react-native";
import { getOrderById } from "../services/orderService";

const STATUSES = [
  { key: "new", label: "Sipariş Alındı", icon: "📝", color: "#3498db" },
  { key: "preparing", label: "Hazırlanıyor", icon: "👨‍🍳", color: "#f39c12" },
  { key: "on_the_way", label: "Yola Çıktı", icon: "🚗", color: "#9b59b6" },
  { key: "completed", label: "Teslim Edildi", icon: "✅", color: "#27ae60" },
];

const OrderTrackingScreen = ({ route }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ─── Sipariş Detayını Çek ──────────────────────────────────────────────────
  const fetchOrder = async () => {
    try {
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (error) {
      Alert.alert("Hata", "Sipariş detayı yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // ─── Polling: Her 10 saniyede bir durum kontrol ─────────────────────────
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  // ─── Aktif durum animasyonu ────────────────────────────────────────────────
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // ─── Durum İndeksi ────────────────────────────────────────────────────────
  const getCurrentStatusIndex = () => {
    if (!order) return -1;
    if (order.status === "cancelled") return -1;
    return STATUSES.findIndex((s) => s.key === order.status);
  };

  const currentIndex = getCurrentStatusIndex();

  // ─── Tarih Formatlama ──────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Sipariş detayı yükleniyor...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Sipariş bulunamadı.</Text>
      </View>
    );
  }

  // ─── İptal Edilmiş Sipariş ─────────────────────────────────────────────────
  if (order.status === "cancelled") {
    return (
      <View style={styles.centered}>
        <Text style={styles.cancelledIcon}>❌</Text>
        <Text style={styles.cancelledTitle}>Sipariş İptal Edildi</Text>
        <Text style={styles.cancelledDate}>
          {formatDate(order.updatedAt)}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ─── Başlık ─── */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>📍 Sipariş Takibi</Text>
        <Text style={styles.orderId}>#{order._id?.slice(-6).toUpperCase()}</Text>
      </View>

      {/* ─── Progress Bar ─── */}
      <View style={styles.progressContainer}>
        {STATUSES.map((status, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <View key={status.key} style={styles.stepContainer}>
              {/* Bağlantı Çizgisi */}
              {index > 0 && (
                <View
                  style={[
                    styles.connector,
                    isActive && { backgroundColor: status.color },
                  ]}
                />
              )}

              {/* Durum İkonu */}
              <Animated.View
                style={[
                  styles.stepCircle,
                  isActive && { backgroundColor: status.color, borderColor: status.color },
                  isCurrent && { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Text style={[styles.stepIcon, isActive && styles.stepIconActive]}>
                  {status.icon}
                </Text>
              </Animated.View>

              {/* Durum Etiketi */}
              <Text
                style={[
                  styles.stepLabel,
                  isActive && { color: status.color, fontWeight: "700" },
                  isCurrent && { fontWeight: "800" },
                ]}
              >
                {status.label}
              </Text>

              {isCurrent && (
                <View style={[styles.currentBadge, { backgroundColor: status.color + "20" }]}>
                  <Text style={[styles.currentBadgeText, { color: status.color }]}>
                    Şu an burada
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* ─── Sipariş Detayları ─── */}
      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>📦 Sipariş Detayı</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Restoran</Text>
          <Text style={styles.detailValue}>
            {order.restaurantId?.restaurantName || order.restaurantId?.name || "—"}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Sipariş Tarihi</Text>
          <Text style={styles.detailValue}>{formatDate(order.createdAt)}</Text>
        </View>

        <View style={styles.divider} />

        {/* Ürünler */}
        <Text style={styles.itemsTitle}>Ürünler</Text>
        {order.menu?.map((menuItem, index) => (
          <View key={index} style={styles.menuItem}>
            <Text style={styles.menuItemName}>
              {menuItem.quantity || 1}x {menuItem.productId?.name || "Ürün"}
            </Text>
            <Text style={styles.menuItemPrice}>
              {menuItem.productId?.price
                ? `${(menuItem.productId.price * (menuItem.quantity || 1)).toFixed(2)} ₺`
                : "—"}
            </Text>
          </View>
        ))}

        {order.note && (
          <>
            <View style={styles.divider} />
            <Text style={styles.noteLabel}>📝 Not</Text>
            <Text style={styles.noteText}>{order.note}</Text>
          </>
        )}
      </View>

      {/* ─── Otomatik Güncelleme Bilgisi ─── */}
      <View style={styles.pollingInfo}>
        <Text style={styles.pollingText}>
          🔄 Durum her 10 saniyede otomatik güncellenir
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
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
  errorText: {
    fontSize: 16,
    color: "#e74c3c",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a2e",
  },
  orderId: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cancelledIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  cancelledTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#e74c3c",
  },
  cancelledDate: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  progressContainer: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  stepContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  connector: {
    width: 3,
    height: 24,
    backgroundColor: "#e0e0e0",
    marginBottom: 8,
    borderRadius: 2,
  },
  stepCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f0f0f0",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  stepIcon: {
    fontSize: 24,
    opacity: 0.4,
  },
  stepIconActive: {
    opacity: 1,
  },
  stepLabel: {
    fontSize: 14,
    color: "#bbb",
    fontWeight: "500",
  },
  currentBadge: {
    marginTop: 6,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  detailCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#888",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a2e",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 14,
  },
  itemsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#555",
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  menuItemName: {
    fontSize: 14,
    color: "#1a1a2e",
  },
  menuItemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B35",
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
  },
  pollingInfo: {
    alignItems: "center",
    padding: 12,
  },
  pollingText: {
    fontSize: 12,
    color: "#bbb",
  },
});

export default OrderTrackingScreen;
