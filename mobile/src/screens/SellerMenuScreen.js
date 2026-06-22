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
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../services/api";

const CATEGORIES = ["Tümü", "Ana Yemek", "Çorba", "Salata", "Tatlı", "İçecek", "Diğer"];

const SellerMenuScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Tümü");

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Ana Yemek",
    price: "",
    description: "",
  });

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      Alert.alert("Hata", "Ürünler yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const filteredProducts =
    selectedCategory === "Tümü"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const openAddForm = () => {
    setEditingItem(null);
    setFormData({ name: "", category: "Ana Yemek", price: "", description: "" });
    setIsFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category || "Ana Yemek",
      price: String(item.price),
      description: item.description || "",
    });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      Alert.alert("Hata", "Ürün adı ve fiyat zorunludur.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        description: formData.description,
      };
      if (editingItem) {
        await api.put(`/products/${editingItem._id}`, payload);
        Alert.alert("Başarılı", "Ürün güncellendi.");
      } else {
        await api.post("/products", payload);
        Alert.alert("Başarılı", "Yeni ürün eklendi.");
      }
      setIsFormOpen(false);
      fetchProducts();
    } catch (error) {
      Alert.alert("Hata", error.response?.data?.message || "İşlem başarısız.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Ürünü Sil", "Bu ürünü kalıcı olarak silmek istiyor musunuz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/products/${id}`);
            Alert.alert("Başarılı", "Ürün silindi.");
            fetchProducts();
          } catch (error) {
            Alert.alert("Hata", "Ürün silinemedi.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Menü Yönetimi</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddForm}>
          <Text style={styles.addBtnText}>+ Yeni Ürün</Text>
        </TouchableOpacity>
      </View>

      {/* Kategori Filtresi */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryBar}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.catChipText, selectedCategory === cat && styles.catChipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Ürün Listesi */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProducts(); }} />
        }
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 50, color: "#888" }}>
            Bu kategoride ürün yok.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View style={styles.productInfo}>
              <View style={styles.productTop}>
                <Text style={styles.productName}>{item.name}</Text>
                <View style={styles.catBadge}>
                  <Text style={styles.catBadgeText}>{item.category || "Diğer"}</Text>
                </View>
              </View>
              {item.description ? (
                <Text style={styles.productDesc} numberOfLines={2}>{item.description}</Text>
              ) : null}
              <Text style={styles.productPrice}>{item.price} ₺</Text>
            </View>
            <View style={styles.productActions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEditForm(item)}>
                <Text style={styles.editBtnText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
                <Text style={styles.deleteBtnText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Ekleme/Düzenleme Modalı */}
      <Modal visible={isFormOpen} animationType="slide" transparent={false}>
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: "#F4F6F8" }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsFormOpen(false)}>
              <Text style={{ fontSize: 24, color: "#1A1A2E" }}>←</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingItem ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
            </Text>
            <View style={{ width: 30 }} />
          </View>

          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={styles.formLabel}>Ürün Adı</Text>
            <TextInput
              style={styles.formInput}
              value={formData.name}
              onChangeText={(t) => setFormData({ ...formData, name: t })}
              placeholder="Örn: Karnıyarık"
            />

            <Text style={styles.formLabel}>Kategori</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {CATEGORIES.filter((c) => c !== "Tümü").map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, formData.category === cat && styles.catChipActive]}
                  onPress={() => setFormData({ ...formData, category: cat })}
                >
                  <Text style={[styles.catChipText, formData.category === cat && styles.catChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.formLabel}>Fiyat (₺)</Text>
            <TextInput
              style={styles.formInput}
              value={formData.price}
              onChangeText={(t) => setFormData({ ...formData, price: t })}
              placeholder="0"
              keyboardType="numeric"
            />

            <Text style={styles.formLabel}>Açıklama</Text>
            <TextInput
              style={[styles.formInput, { minHeight: 80, textAlignVertical: "top" }]}
              value={formData.description}
              onChangeText={(t) => setFormData({ ...formData, description: t })}
              placeholder="Ürün açıklaması..."
              multiline
            />

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>
                {saving ? "Kaydediliyor..." : editingItem ? "Güncelle" : "Ürünü Ekle"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#10B981",
    paddingTop: Platform.OS === "ios" ? 55 : 40,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  addBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: { color: "#10B981", fontWeight: "700", fontSize: 13 },
  categoryBar: { paddingHorizontal: 16, paddingVertical: 12 },
  catChip: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  catChipActive: { backgroundColor: "#10B981", borderColor: "#10B981" },
  catChipText: { fontSize: 13, fontWeight: "600", color: "#555" },
  catChipTextActive: { color: "#fff" },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  productInfo: { flex: 1 },
  productTop: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  productName: { fontSize: 16, fontWeight: "700", color: "#1A1A2E", flex: 1 },
  catBadge: { backgroundColor: "#E0F2FE", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  catBadgeText: { fontSize: 11, color: "#0284C7", fontWeight: "600" },
  productDesc: { fontSize: 13, color: "#888", marginBottom: 4 },
  productPrice: { fontSize: 16, fontWeight: "800", color: "#10B981" },
  productActions: { flexDirection: "column", marginLeft: 10 },
  editBtn: { padding: 8 },
  editBtnText: { fontSize: 18 },
  deleteBtn: { padding: 8 },
  deleteBtnText: { fontSize: 18 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 55 : 25,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A2E" },
  formLabel: { fontSize: 14, fontWeight: "700", color: "#4B5563", marginBottom: 8 },
  formInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#1A1A2E",
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

export default SellerMenuScreen;
