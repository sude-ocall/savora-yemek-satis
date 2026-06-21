import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { createOrder } from "../services/orderService";
import { getPaymentMethods } from "../services/paymentService";
import api from "../services/api";

const OrderConfirmScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState("Barbaros Mah. Atatürk Cad. No: 12 Daire: 4 Beşiktaş/İstanbul");
  const [tempAddress, setTempAddress] = useState("");
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [savedCards, setSavedCards] = useState([]);
  const [addresses, setAddresses] = useState([
    { id: "1", title: "Ev", address: "Barbaros Mah. Atatürk Cad. No: 12 Daire: 4 Beşiktaş/İstanbul" },
    { id: "2", title: "İş", address: "Levent Mah. Büyükdere Cad. Plaza No: 15 Kat: 3 Şişli/İstanbul" },
    { id: "3", title: "Okul", address: "Yıldız Teknik Üniversitesi, Davutpaşa Kampüsü, Esenler/İstanbul" }
  ]);
  const [selectedCard, setSelectedCard] = useState(null);
  
  // Yeni adres ekleme state'leri
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddressTitle, setNewAddressTitle] = useState("");
  const [newAddressText, setNewAddressText] = useState("");

  // ─── Ürünleri Çek (Sadece 1 Kere) ──────────────────────────────────────────
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

  // ─── Kartları Çek (Ekrana Her Geldiğinde) ──────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchCards = async () => {
        try {
          const data = await getPaymentMethods();
          if (isActive) {
            if (data.cards && data.cards.length > 0) {
              setSavedCards(data.cards);
              setSelectedCard(data.cards[0]); // İlk kartı seç
            } else {
              setSavedCards([]);
              setSelectedCard(null);
            }
          }
        } catch (error) {
          // sessiz
        }
      };

      fetchCards();

      return () => {
        isActive = false;
      };
    }, [])
  );

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

    if (!address.trim()) {
      Alert.alert("Eksik Bilgi", "Lütfen teslimat adresinizi girin!");
      return;
    }

    if (!selectedCard) {
      Alert.alert(
        "Ödeme Yöntemi Yok",
        "Lütfen profil sekmesinden (Ödeme Yöntemleri) bir kredi kartı kaydedin!"
      );
      return;
    }

    setSubmitting(true);
    try {
      const menu = cart.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
      }));

      await createOrder(menu);

      Alert.alert("Başarılı 🎉", "Siparişiniz alındı ve ödemeniz onaylandı!", [
        {
          text: "Tamam",
          onPress: () => {
            setCart([]);
            navigation.navigate("Siparişlerim");
          },
        },
      ]);
    } catch (error) {
      const msg = error.response?.data?.message || "Sipariş oluşturulamadı.";
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
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Ne yemek istersin?</Text>
            <Text style={styles.headerSubtitle}>Bugün favori lezzetlerini keşfet</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Menüde şu an ürün yok.</Text>
        }
      />

      {cart.length > 0 && (
        <View style={styles.checkoutPanel}>
          <View style={styles.checkoutPanelInner}>
            <Text style={styles.sectionTitle}>Sipariş Özeti</Text>

            {/* Teslimat Adresi (Trendyol / Getir Tarzı) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>📍 Teslimat Adresi</Text>
              <View style={styles.addressCard}>
                <View style={styles.addressIconBox}>
                  <Text style={styles.addressIcon}>🏠</Text>
                </View>
                <View style={styles.addressDetails}>
                  <Text style={styles.addressTitle}>Ev Adresi</Text>
                  <Text style={styles.addressText} numberOfLines={1}>
                    {address}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.changeAddressBtn}
                  onPress={() => {
                    setTempAddress(address);
                    setAddressModalVisible(true);
                  }}
                >
                  <Text style={styles.changeAddressBtnText}>Değiştir</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Ödeme Yöntemi */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>💳 Ödeme Yöntemi</Text>
              {savedCards.length > 0 ? (
                <View style={styles.cardItem}>
                  <View style={styles.cardIconBox}>
                    <Text style={styles.cardIcon}>🏦</Text>
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>Kayıtlı Kredi Kartı</Text>
                    <Text style={styles.cardNumber}>
                      **** **** **** {selectedCard?.last4}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.noCardAlert}>
                  <Text style={styles.noCardAlertText}>
                    ⚠️ Henüz kayıtlı kartınız yok. Lütfen ödeme sayfasından bir kart ekleyin.
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Toplam Tutar</Text>
              <Text style={styles.totalAmount}>{totalAmount.toFixed(2)} ₺</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                (submitting || savedCards.length === 0) && styles.confirmButtonDisabled,
              ]}
              onPress={handleCreateOrder}
              disabled={submitting || savedCards.length === 0}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>
                  {savedCards.length > 0 ? `Ödemeyi Tamamla (${totalAmount.toFixed(2)} ₺)` : "Kart Eklenmeli"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ─── Adres Değiştirme Modalı (Trendyol/Getir Tarzı) ─── */}
      <Modal
        visible={addressModalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => {
          setAddressModalVisible(false);
          setIsAddingAddress(false);
        }}
      >
        <KeyboardAvoidingView 
          style={styles.fullModalContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.fullModalHeader}>
            <TouchableOpacity 
              onPress={() => {
                if (isAddingAddress) {
                  setIsAddingAddress(false);
                } else {
                  setAddressModalVisible(false);
                }
              }} 
              style={styles.backButton}
            >
              <Text style={styles.backButtonIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.fullModalTitle}>
              {isAddingAddress ? "Yeni Adres Ekle" : "Teslimat Adresi"}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {isAddingAddress ? (
            <View style={{ padding: 16 }}>
              <Text style={styles.inputLabel}>Adres Başlığı (Ev, İş vb.)</Text>
              <TextInput
                style={[styles.modalInput, { minHeight: 50, marginBottom: 15 }]}
                value={newAddressTitle}
                onChangeText={setNewAddressTitle}
                placeholder="Örn: Evim"
              />
              
              <Text style={styles.inputLabel}>Açık Adres</Text>
              <TextInput
                style={styles.modalInput}
                value={newAddressText}
                onChangeText={setNewAddressText}
                multiline
                placeholder="Mahalle, sokak, bina no..."
              />

              <TouchableOpacity 
                style={styles.modalSaveBtn}
                onPress={() => {
                  if (newAddressTitle.trim() && newAddressText.trim()) {
                    const newAddr = {
                      id: Date.now().toString(),
                      title: newAddressTitle,
                      address: newAddressText
                    };
                    setAddresses([newAddr, ...addresses]);
                    setAddress(newAddressText);
                    setNewAddressTitle("");
                    setNewAddressText("");
                    setIsAddingAddress(false);
                    setAddressModalVisible(false);
                  } else {
                    Alert.alert("Hata", "Lütfen başlık ve adres alanlarını doldurun.");
                  }
                }}
              >
                <Text style={styles.modalSaveBtnText}>Kaydet ve Seç</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.modalInfoBox}>
                <Text style={styles.modalInfoText}>
                  Düzenle butonuna basarak konumunu ve adres bilgilerini düzenleyebilir veya adresini silebilirsin.
                </Text>
              </View>

              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                    Alert.alert("Konum Bulunuyor...", "Mevcut konumunuz algılandı ve adresiniz güncellendi.");
                    setAddress("Yeni Konum: Şehitler Cad. No:1 Beşiktaş/İstanbul");
                    setAddressModalVisible(false);
                  }}
                >
                  <Text style={styles.actionButtonIcon}>📍</Text>
                  <Text style={styles.actionButtonText}>Mevcut Konumumu Kullan</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => setIsAddingAddress(true)}
                >
                  <Text style={styles.actionButtonIcon}>➕</Text>
                  <Text style={styles.actionButtonText}>Yeni Adres Ekle</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={addresses}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.addressList}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[
                      styles.addressListItem, 
                      address === item.address && styles.addressListItemSelected
                    ]}
                    onPress={() => {
                      setAddress(item.address);
                      setAddressModalVisible(false);
                    }}
                  >
                    <View style={styles.radioContainer}>
                      <View style={[
                        styles.outerCircle, 
                        address === item.address && styles.outerCircleSelected
                      ]}>
                        {address === item.address && <View style={styles.innerCircle} />}
                      </View>
                    </View>
                    
                    <View style={styles.addressItemDetails}>
                      <View style={styles.addressItemHeader}>
                        <Text style={styles.addressItemTitle}>{item.title}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <TouchableOpacity style={styles.editButton}>
                            <Text style={styles.editButtonText}>✏️ Düzenle</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={{ marginLeft: 12 }}
                            onPress={() => {
                              Alert.alert("Adresi Sil", "Bu adresi silmek istediğinize emin misiniz?", [
                                { text: "İptal", style: "cancel" },
                                { text: "Sil", style: "destructive", onPress: () => {
                                  setAddresses(addresses.filter(a => a.id !== item.id));
                                  if (address === item.address) setAddress("");
                                }}
                              ]);
                            }}
                          >
                            <Text style={{ fontSize: 16 }}>🗑️</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text style={styles.addressItemText} numberOfLines={3}>{item.address}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </>
          )}
        </KeyboardAvoidingView>
      </Modal>

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 15,
  },
  headerContainer: {
    marginBottom: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A1A2E",
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#888",
    marginTop: 4,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 400, // Checkout paneli için yer bırak
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 40,
    fontSize: 16,
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  productInfo: {
    flex: 1,
    marginRight: 10,
    justifyContent: "center",
  },
  productName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FF6B35",
    marginTop: 6,
  },
  productDesc: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
    lineHeight: 18,
  },
  productActions: {
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#1A1A2E",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F6F8",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  qtyButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  qtyButtonText: {
    color: "#1A1A2E",
    fontSize: 18,
    fontWeight: "700",
  },
  qtyText: {
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A2E",
  },
  checkoutPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  checkoutPanelInner: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A2E",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4B5563",
    marginBottom: 8,
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 14,
  },
  addressIconBox: {
    backgroundColor: "#FFEDD5",
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  addressIcon: {
    fontSize: 18,
  },
  addressDetails: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  addressText: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  changeAddressBtn: {
    paddingLeft: 10,
  },
  changeAddressBtnText: {
    color: "#FF6B35",
    fontSize: 13,
    fontWeight: "700",
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 14,
  },
  cardIconBox: {
    backgroundColor: "#E0E7FF",
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardIcon: {
    fontSize: 20,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  cardNumber: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
    letterSpacing: 1,
  },
  noCardAlert: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    padding: 12,
  },
  noCardAlertText: {
    color: "#B91C1C",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1A1A2E",
  },
  confirmButton: {
    backgroundColor: "#10B981",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  modalSaveBtn: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  modalSaveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  modalInput: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: "#1A1A2E",
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  fullModalContainer: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  fullModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  backButtonIcon: {
    fontSize: 24,
    color: "#1A1A2E",
    fontWeight: "bold",
  },
  fullModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A2E",
  },
  modalInfoBox: {
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalInfoText: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
  },
  actionButtonsContainer: {
    padding: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A2E",
  },
  addressList: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  addressListItem: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  addressListItemSelected: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  radioContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  outerCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
  },
  outerCircleSelected: {
    borderColor: "#10B981",
  },
  innerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
  },
  addressItemDetails: {
    flex: 1,
  },
  addressItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  addressItemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4B5563",
  },
  addressItemText: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
});

export default OrderConfirmScreen;
