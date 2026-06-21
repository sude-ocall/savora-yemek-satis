import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Switch,
} from "react-native";
import { savePaymentMethod, getPaymentMethods } from "../services/paymentService";

const PaymentScreen = () => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [saveCard, setSaveCard] = useState(true);
  const [loading, setLoading] = useState(false);
  const [savedCards, setSavedCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);

  // ─── Kayıtlı Kartları Çek ─────────────────────────────────────────────────
  useEffect(() => {
    fetchSavedCards();
  }, []);

  const fetchSavedCards = async () => {
    try {
      const data = await getPaymentMethods();
      setSavedCards(data.cards || []);
    } catch (error) {
      // Sessiz hata - kayıtlı kart yoksa sorun değil
    } finally {
      setLoadingCards(false);
    }
  };

  // ─── Kart Numarası Formatlama ──────────────────────────────────────────────
  const handleCardNumberChange = (text) => {
    const cleaned = text.replace(/\D/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || "";
    if (formatted.length <= 19) setCardNumber(formatted);
  };

  // ─── Son Kullanma Tarihi Formatlama ────────────────────────────────────────
  const handleExpiryChange = (text) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length > 4) return;
    const formatted =
      cleaned.length > 2
        ? cleaned.substring(0, 2) + "/" + cleaned.substring(2)
        : cleaned;
    setExpiryDate(formatted);
  };

  // ─── Kart Tipi Algılama ────────────────────────────────────────────────────
  const getCardType = () => {
    const num = cardNumber.replace(/\s/g, "");
    if (num.startsWith("4")) return { name: "Visa", icon: "💳", color: "#1a1f71" };
    if (num.startsWith("5")) return { name: "Mastercard", icon: "💳", color: "#eb001b" };
    if (num.startsWith("3")) return { name: "Amex", icon: "💳", color: "#2e77bc" };
    return { name: "", icon: "💳", color: "#888" };
  };

  // ─── Form Doğrulama ────────────────────────────────────────────────────────
  const validateForm = () => {
    const rawNumber = cardNumber.replace(/\s/g, "");
    if (rawNumber.length < 16) {
      Alert.alert("Hata", "Geçerli bir kart numarası giriniz.");
      return false;
    }
    if (expiryDate.length !== 5) {
      Alert.alert("Hata", "Son kullanma tarihi AA/YY formatında olmalı.");
      return false;
    }
    const [month, year] = expiryDate.split("/").map(Number);
    if (month < 1 || month > 12) {
      Alert.alert("Hata", "Geçersiz ay.");
      return false;
    }
    if (cvv.length < 3) {
      Alert.alert("Hata", "CVV en az 3 haneli olmalı.");
      return false;
    }
    if (!cardName.trim()) {
      Alert.alert("Hata", "Kart üzerindeki ismi giriniz.");
      return false;
    }
    return true;
  };

  // ─── Kart Kaydet ───────────────────────────────────────────────────────────
  const handleSaveCard = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await savePaymentMethod({
        cardNumber: cardNumber.replace(/\s/g, ""),
        expiryDate,
        cardHolderName: cardName,
      });

      Alert.alert("Başarılı ✅", "Ödeme yöntemi kaydedildi!");

      // Formu temizle
      setCardNumber("");
      setExpiryDate("");
      setCvv("");
      setCardName("");

      // Listeyi güncelle
      fetchSavedCards();
    } catch (error) {
      const msg =
        error.response?.data?.message || "Kart kaydedilemedi.";
      Alert.alert("Hata", msg);
    } finally {
      setLoading(false);
    }
  };

  const cardType = getCardType();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>💳 Ödeme Yöntemi</Text>

      {/* ─── Kayıtlı Kartlar ─── */}
      {savedCards.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kayıtlı Kartlarım</Text>
          {savedCards.map((card, index) => (
            <View key={index} style={styles.savedCard}>
              <Text style={styles.savedCardIcon}>💳</Text>
              <View>
                <Text style={styles.savedCardNumber}>
                  •••• •••• •••• {card.last4}
                </Text>
                <Text style={styles.savedCardExpiry}>
                  SKT: {card.expiryDate}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* ─── Kart Önizleme ─── */}
      <View style={[styles.cardPreview, { backgroundColor: cardType.color || "#1a1a2e" }]}>
        <Text style={styles.cardPreviewType}>{cardType.name || "Kart"}</Text>
        <Text style={styles.cardPreviewNumber}>
          {cardNumber || "•••• •••• •••• ••••"}
        </Text>
        <View style={styles.cardPreviewBottom}>
          <View>
            <Text style={styles.cardPreviewLabel}>KART SAHİBİ</Text>
            <Text style={styles.cardPreviewValue}>
              {cardName.toUpperCase() || "AD SOYAD"}
            </Text>
          </View>
          <View>
            <Text style={styles.cardPreviewLabel}>SKT</Text>
            <Text style={styles.cardPreviewValue}>
              {expiryDate || "AA/YY"}
            </Text>
          </View>
        </View>
      </View>

      {/* ─── Form ─── */}
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Kart Üzerindeki İsim</Text>
          <TextInput
            style={styles.input}
            value={cardName}
            onChangeText={setCardName}
            placeholder="Ad Soyad"
            placeholderTextColor="#bbb"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Kart Numarası {cardType.name ? `(${cardType.name})` : ""}
          </Text>
          <TextInput
            style={styles.input}
            value={cardNumber}
            onChangeText={handleCardNumberChange}
            placeholder="0000 0000 0000 0000"
            placeholderTextColor="#bbb"
            keyboardType="numeric"
            maxLength={19}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>Son Kullanma</Text>
            <TextInput
              style={styles.input}
              value={expiryDate}
              onChangeText={handleExpiryChange}
              placeholder="AA/YY"
              placeholderTextColor="#bbb"
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>CVV</Text>
            <TextInput
              style={styles.input}
              value={cvv}
              onChangeText={(t) => setCvv(t.replace(/\D/g, ""))}
              placeholder="•••"
              placeholderTextColor="#bbb"
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
          </View>
        </View>

        {/* Kaydet toggle */}
        <View style={styles.saveToggle}>
          <Text style={styles.saveToggleText}>
            Bu kartı sonraki alışverişler için kaydet
          </Text>
          <Switch
            value={saveCard}
            onValueChange={setSaveCard}
            trackColor={{ false: "#ddd", true: "#FF6B35" }}
            thumbColor="#fff"
          />
        </View>

        {/* Kaydet Butonu */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSaveCard}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Kartı Kaydet</Text>
          )}
        </TouchableOpacity>
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
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#555",
    marginBottom: 10,
  },
  savedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  savedCardIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  savedCardNumber: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a2e",
  },
  savedCardExpiry: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  cardPreview: {
    borderRadius: 18,
    padding: 24,
    marginBottom: 24,
    height: 200,
    justifyContent: "space-between",
  },
  cardPreviewType: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "right",
    opacity: 0.9,
  },
  cardPreviewNumber: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: 2,
  },
  cardPreviewBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardPreviewLabel: {
    color: "#ffffff80",
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 2,
  },
  cardPreviewValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
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
  row: {
    flexDirection: "row",
  },
  saveToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 8,
  },
  saveToggleText: {
    fontSize: 14,
    color: "#555",
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default PaymentScreen;
