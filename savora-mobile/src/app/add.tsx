import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import { createProduct, loginSeller } from '@/services/api';

const SELLER_EMAIL = 'test@savora.com';
const SELLER_PASSWORD = 'test1234';

const CATEGORIES = ['Ana Yemek', 'Çorba', 'Tatlı', 'İçecek', 'Salata'];

export default function AddScreen() {
  // useState: React'te bir değer değişince ekran yeniden çizilir.
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Ana Yemek');

  // imgBase64: galeriden seçilen görselin base64 verisi.
  // "data:image/jpeg;base64,..." formatında — doğrudan imgURL alanına gider.
  const [imgBase64, setImgBase64] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  // Galeriden fotoğraf seçme — expo-image-picker kullanır.
  async function handlePickImage() {
    // İzin iste (iOS'ta zorunlu).
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showMsg('Galeri izni verilmedi. Ayarlar → Savora → Fotoğraflar.', true);
      return;
    }

    // Galeriyi aç, kullanıcı bir fotoğraf seçsin.
    // base64: true → fotoğrafı string olarak al (sunucuya yüklemeye gerek yok).
    // quality: 0.5 → dosya boyutunu yarıya indir.
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0].base64) {
      // "data:image/jpeg;base64,..." formatına çevir — tarayıcı/RN her ikisini gösterir.
      setImgBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  }

  async function handleSave() {
    if (!name.trim()) return showMsg('Yemek adı boş olamaz.', true);
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) return showMsg('Geçerli bir fiyat girin.', true);

    setLoading(true);
    setMessage('');
    try {
      // 1. Satıcı girişi → token al.
      const token = await loginSeller(SELLER_EMAIL, SELLER_PASSWORD);

      // 2. Token ile ürün ekle. imgBase64 varsa imgURL olarak gönder.
      await createProduct(token, {
        name: name.trim(),
        category,
        price: priceNum,
        description: description.trim(),
        imgURL: imgBase64 ?? '',
      });

      showMsg('Yemek başarıyla eklendi!', false);
      setName('');
      setPrice('');
      setDescription('');
      setCategory('Ana Yemek');
      setImgBase64(null);
    } catch (err: any) {
      showMsg(err.message ?? 'Bir hata oluştu.', true);
    } finally {
      setLoading(false);
    }
  }

  function showMsg(text: string, error: boolean) {
    setMessage(text);
    setIsError(error);
  }

  const bg = dark ? '#121212' : '#f5f5f5';
  const card = dark ? '#1e1e1e' : '#ffffff';
  const text = dark ? '#ffffff' : '#1a1a1a';
  const sub = dark ? '#aaaaaa' : '#666666';
  const border = dark ? '#333333' : '#dddddd';
  const accent = '#e63946';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: bg }]}
      keyboardShouldPersistTaps="handled">
      <Text style={[styles.title, { color: text }]}>Yeni Yemek Ekle</Text>

      {/* Yemek Adı */}
      <Text style={[styles.label, { color: sub }]}>Yemek Adı *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: card, color: text, borderColor: border }]}
        placeholder="örn. Adana Kebap"
        placeholderTextColor={sub}
        value={name}
        onChangeText={setName}
      />

      {/* Fiyat */}
      <Text style={[styles.label, { color: sub }]}>Fiyat (₺) *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: card, color: text, borderColor: border }]}
        placeholder="örn. 120"
        placeholderTextColor={sub}
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
      />

      {/* Açıklama */}
      <Text style={[styles.label, { color: sub }]}>Açıklama</Text>
      <TextInput
        style={[styles.input, styles.multiline, { backgroundColor: card, color: text, borderColor: border }]}
        placeholder="Kısa bir tanıtım yazın…"
        placeholderTextColor={sub}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      {/* Kategori seçici */}
      <Text style={[styles.label, { color: sub }]}>Kategori</Text>
      <View style={styles.chips}>
        {CATEGORIES.map(cat => {
          const selected = cat === category;
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                {
                  borderColor: selected ? accent : border,
                  backgroundColor: selected ? accent : card,
                },
              ]}
              onPress={() => setCategory(cat)}>
              <Text style={{ color: selected ? '#fff' : text, fontSize: 13 }}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Görsel seçici */}
      <Text style={[styles.label, { color: sub }]}>Görsel</Text>
      <TouchableOpacity
        style={[styles.imagePicker, { backgroundColor: card, borderColor: border }]}
        onPress={handlePickImage}>
        {imgBase64 ? (
          // Seçilen görseli önizle.
          <Image source={{ uri: imgBase64 }} style={styles.previewImage} resizeMode="cover" />
        ) : (
          <Text style={[styles.imagePickerText, { color: sub }]}>
            Galeriden fotoğraf seç
          </Text>
        )}
      </TouchableOpacity>

      {/* Seçilen görseli kaldır */}
      {imgBase64 && (
        <TouchableOpacity onPress={() => setImgBase64(null)}>
          <Text style={[styles.removeImage, { color: accent }]}>Görseli kaldır</Text>
        </TouchableOpacity>
      )}

      {/* Geri bildirim mesajı */}
      {message !== '' && (
        <Text style={[styles.msg, { color: isError ? '#e63946' : '#2a9d8f' }]}>
          {message}
        </Text>
      )}

      {/* Kaydet butonu */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: accent, opacity: loading ? 0.6 : 1 }]}
        onPress={handleSave}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Kaydet</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 24, marginTop: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15 },
  multiline: { height: 90, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1 },
  imagePicker: {
    height: 160,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagePickerText: { fontSize: 14 },
  previewImage: { width: '100%', height: '100%' },
  removeImage: { marginTop: 6, fontSize: 13, fontWeight: '600', textAlign: 'right' },
  msg: { marginTop: 16, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  button: {
    marginTop: 28,
    marginBottom: 40,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
