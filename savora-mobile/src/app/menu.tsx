import { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import {
  deleteProduct,
  getProducts,
  loginSeller,
  updateProduct,
  createProduct,
  type Product,
} from '@/services/api';

const SELLER_EMAIL = 'test@savora.com';
const SELLER_PASSWORD = 'test1234';
const CATEGORIES = ['Tümü', 'Ana Yemek', 'Çorba', 'Tatlı', 'İçecek', 'Salata'];
const FORM_CATS = ['Ana Yemek', 'Çorba', 'Tatlı', 'İçecek', 'Salata'];

export default function MenuScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');

  // Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('Ana Yemek');

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err: any) {
      Alert.alert('Hata', 'Ürünler yüklenemedi: ' + (err.message ?? ''));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchProducts(); }, []));

  const filtered =
    selectedCategory === 'Tümü'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const openAdd = () => {
    setEditingItem(null);
    setFormName(''); setFormPrice(''); setFormDesc(''); setFormCategory('Ana Yemek');
    setIsFormOpen(true);
  };

  const openEdit = (item: Product) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormPrice(String(item.price));
    setFormDesc(item.description ?? '');
    setFormCategory(item.category ?? 'Ana Yemek');
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) { Alert.alert('Hata', 'Ürün adı boş olamaz.'); return; }
    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) { Alert.alert('Hata', 'Geçerli bir fiyat girin.'); return; }
    setSaving(true);
    try {
      const token = await loginSeller(SELLER_EMAIL, SELLER_PASSWORD);
      const payload = { name: formName.trim(), category: formCategory, price: priceNum, description: formDesc.trim() };
      if (editingItem) {
        await updateProduct(token, editingItem._id, payload);
        Alert.alert('Başarılı', 'Ürün güncellendi.');
      } else {
        await createProduct(token, payload);
        Alert.alert('Başarılı', 'Ürün eklendi.');
      }
      setIsFormOpen(false);
      fetchProducts();
    } catch (err: any) {
      Alert.alert('Hata', err.response?.data?.message ?? err.message ?? 'İşlem başarısız.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Ürünü Sil', 'Bu ürünü silmek istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive', onPress: async () => {
          try {
            const token = await loginSeller(SELLER_EMAIL, SELLER_PASSWORD);
            await deleteProduct(token, id);
            fetchProducts();
          } catch {
            Alert.alert('Hata', 'Ürün silinemedi.');
          }
        },
      },
    ]);
  };

  const handlePortionUpdate = async (item: Product, portion: number) => {
    try {
      const token = await loginSeller(SELLER_EMAIL, SELLER_PASSWORD);
      const updated = await updateProduct(token, item._id, { portion });
      setProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    } catch {
      Alert.alert('Hata', 'Porsiyon güncellenemedi.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Menü yükleniyor…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Menü Yönetimi</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Yeni Ürün</Text>
        </TouchableOpacity>
      </View>

      {/* Kategori filtresi */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={styles.catBar}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
            onPress={() => setSelectedCategory(cat)}>
            <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Ürün listesi */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProducts(); }} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>Bu kategoride ürün yok.</Text>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onEdit={() => openEdit(item)}
            onDelete={() => handleDelete(item._id)}
            onPortionUpdate={handlePortionUpdate}
          />
        )}
      />

      {/* Ekle/Düzenle Modalı */}
      <Modal visible={isFormOpen} animationType="slide" transparent={false}>
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: '#F4F6F8' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsFormOpen(false)}>
              <Text style={{ fontSize: 24, color: '#1A1A2E' }}>←</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingItem ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</Text>
            <View style={{ width: 30 }} />
          </View>

          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={styles.formLabel}>Ürün Adı</Text>
            <TextInput style={styles.formInput} value={formName} onChangeText={setFormName} placeholder="Örn: Karnıyarık" />

            <Text style={styles.formLabel}>Kategori</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {FORM_CATS.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, formCategory === cat && styles.catChipActive]}
                  onPress={() => setFormCategory(cat)}>
                  <Text style={[styles.catText, formCategory === cat && styles.catTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.formLabel}>Fiyat (₺)</Text>
            <TextInput style={styles.formInput} value={formPrice} onChangeText={setFormPrice} placeholder="0" keyboardType="numeric" />

            <Text style={styles.formLabel}>Açıklama</Text>
            <TextInput
              style={[styles.formInput, { minHeight: 80, textAlignVertical: 'top' }]}
              value={formDesc}
              onChangeText={setFormDesc}
              placeholder="Ürün açıklaması…"
              multiline
            />

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}>
              <Text style={styles.saveBtnText}>
                {saving ? 'Kaydediliyor…' : editingItem ? 'Güncelle' : 'Ürünü Ekle'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

type CardProps = {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onPortionUpdate: (item: Product, portion: number) => void;
};

function ProductCard({ product, onEdit, onDelete, onPortionUpdate }: CardProps) {
  const [portion, setPortion] = useState(product.portion ?? 0);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
          <Text style={styles.productCat} numberOfLines={1}>{product.category}</Text>
          {product.description ? <Text style={styles.productDesc} numberOfLines={2}>{product.description}</Text> : null}
          <Text style={styles.productPrice} numberOfLines={1}>{product.price.toFixed(2)} ₺</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
            <Text style={{ fontSize: 18 }}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
            <Text style={{ fontSize: 18 }}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Porsiyon */}
      <View style={styles.portionRow}>
        <Text style={styles.portionLabel}>Porsiyon:</Text>
        <TouchableOpacity style={styles.portionBtn} onPress={() => setPortion((v) => Math.max(0, v - 1))}>
          <Text style={styles.portionBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.portionNum}>{portion}</Text>
        <TouchableOpacity style={styles.portionBtn} onPress={() => setPortion((v) => v + 1)}>
          <Text style={styles.portionBtnText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.updateBtn} onPress={() => onPortionUpdate(product, portion)}>
          <Text style={styles.updateBtnText}>Güncelle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#888' },
  empty: { textAlign: 'center', marginTop: 50, color: '#888' },

  header: {
    backgroundColor: '#10B981',
    paddingTop: Platform.OS === 'ios' ? 10 : 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  addBtn: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#10B981', fontWeight: '700', fontSize: 13 },

  catScroll: { flexGrow: 0, flexShrink: 0 },
  catBar: { paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center' },
  catChip: {
    backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#E5E7EB',
  },
  catChipActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  catText: { fontSize: 13, fontWeight: '600', color: '#555' },
  catTextActive: { color: '#fff' },

  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    marginBottom: 12, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  productName: { fontSize: 16, fontWeight: '700', color: '#1A1A2E' },
  productCat: { fontSize: 12, color: '#0284C7', marginTop: 2, fontWeight: '600' },
  productDesc: { fontSize: 13, color: '#888', marginTop: 4 },
  productPrice: { fontSize: 16, fontWeight: '800', color: '#10B981', marginTop: 6 },

  cardActions: { flexDirection: 'column', marginLeft: 8 },
  editBtn: { padding: 6 },
  deleteBtn: { padding: 6, marginTop: 4 },

  portionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 6 },
  portionLabel: { fontSize: 13, color: '#666' },
  portionBtn: {
    width: 30, height: 30, borderRadius: 15, borderWidth: 1,
    borderColor: '#888', alignItems: 'center', justifyContent: 'center',
  },
  portionBtnText: { fontSize: 16, fontWeight: '700', color: '#333' },
  portionNum: { minWidth: 24, textAlign: 'center', fontWeight: '700', fontSize: 15, color: '#1A1A2E' },
  updateBtn: { marginLeft: 8, backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  updateBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', paddingTop: Platform.OS === 'ios' ? 55 : 25,
    paddingBottom: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: '#E5E7EB',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  formLabel: { fontSize: 14, fontWeight: '700', color: '#4B5563', marginBottom: 8 },
  formInput: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 12, padding: 14, fontSize: 15, color: '#1A1A2E', marginBottom: 16,
  },
  saveBtn: { backgroundColor: '#10B981', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
