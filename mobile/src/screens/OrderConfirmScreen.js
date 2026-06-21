import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { createOrder } from "../services/orderService";
import api from "../services/api";

const OrderConfirmScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  // ─── Ürünleri Çek ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (error) {
      Alert.alert("Hata", "Ürünler yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Sepete Ekle ───────────────────────────────────────────────────────────
  const addToCart = (product) => {
    const exists = cart.find((item) => item._id === product._id);
    if (exists) {
      setCart(
        cart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // ─── Sepetten Çıkar ────────────────────────────────────────────────────────
  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item._id !== productId));
  };

  // ─── Toplam Tutar ──────────────────────────────────────────────────────────
  const totalAmount = cart.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  );

  // ─── Sipariş Oluştur ──────────────────────────────────────────────────────
  const handleCreateOrder = async () => {
    if (cart.length === 0) {
      Alert.alert("Uyarı", "Sepetiniz boş!");
      return;
    }

    setSubmitting(true);
    try {
      const menu = cart.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
      }));

      await createOrder(menu);

      Alert.alert("Başarılı ✅", "Siparişiniz oluşturuldu!", [
        {
          text: "Tamam",
          onPress: () => {
            setCart([]);
            navigation.navigate("Siparişlerim");
          },
        },
      ]);
    } catch (error) {
      const msg =
        error.response?.data?.message || "Sipariş oluşturulamadı.";
      Alert.alert("Hata", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Ürün Kartı ────────────────────────────────────────────────────────────
  const renderProduct = ({ item }) => {
    const inCart = cart.find((c) => c._id === item._id);
    return (
      <View style={styles.productCard}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>{item.price} ₺</Text>
          {item.description && (
            <Text style={styles.productDesc} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
        <View style={styles.productActions}>
          {inCart ? (
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => {
                  if (inCart.quantity === 1) {
                    removeFromCart(item._id);
                  } else {
                    setCart(
                      cart.map((c) =>
                        c._id === item._id
                          ? { ...c, quantity: c.quantity - 1 }
                          : c
                      )
                    );
                  }
                }}
              >
                <Text style={styles.qtyButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{inCart.quantity}</Text>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => addToCart(item)}
              >
                <Text style={styles.qtyButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addToCart(item)}
            >
              <Text style={styles.addButtonText}>+ Ekle</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Menü yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ─── Ürün Listesi ─── */}
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>🍽️ Menü</Text>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Henüz ürün bulunmuyor.</Text>
        }
      />

      {/* ─── Sepet Özeti ─── */}
      {cart.length > 0 && (
        <View style={styles.cartSummary}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>🛒 Sepetiniz</Text>
            <Text style={styles.cartItemCount}>
              {cart.reduce((s, i) => s + i.quantity, 0)} ürün
            </Text>
          </View>

          {cart.map((item) => (
            <View key={item._id} style={styles.cartItem}>
              <Text style={styles.cartItemName}>
                {item.quantity}x {item.name}
              </Text>
              <Text style={styles.cartItemPrice}>
                {(item.price * item.quantity).toFixed(2)} ₺
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          {/* Teslimat Adresi */}
          <TextInput
            style={styles.addressInput}
            placeholder="Teslimat adresi (opsiyonel)"
            placeholderTextColor="#999"
            value={address}
            onChangeText={setAddress}
          />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Toplam</Text>
            <Text style={styles.totalAmount}>
              {totalAmount.toFixed(2)} ₺
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              submitting && styles.confirmButtonDisabled,
            ]}
            onPress={handleCreateOrder}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmButtonText}>
                Siparişi Onayla ({totalAmount.toFixed(2)} ₺)
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
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
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 15,
    marginTop: 40,
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FF6B35",
    marginTop: 2,
  },
  productDesc: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  productActions: {
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    overflow: "hidden",
  },
  qtyButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#FF6B35",
  },
  qtyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  qtyText: {
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  cartSummary: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a2e",
  },
  cartItemCount: {
    fontSize: 13,
    color: "#888",
    fontWeight: "600",
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  cartItemName: {
    fontSize: 14,
    color: "#555",
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a2e",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  addressInput: {
    backgroundColor: "#f5f5f7",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FF6B35",
  },
  confirmButton: {
    backgroundColor: "#27ae60",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default OrderConfirmScreen;
