import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import api from '@/services/api';

type Product = { _id: string; name: string; price: number; category: string; portion: number; sellerId: string };
type Offer = { _id: string; title: string; description: string; budget: number; category: string; status: string };

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');

  const fetchData = async () => {
    try {
      const [productsRes, offersRes] = await Promise.all([
        api.get('/api/products'),
        api.get('/api/offers/open'),
      ]);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setOffers(Array.isArray(offersRes.data) ? offersRes.data : []);
    } catch (e) {
      // sessiz hata
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    AsyncStorage.getItem('savora_user').then((raw) => {
      if (raw) {
        const u = JSON.parse(raw);
        setUserName(u.name ?? '');
      }
    });
    fetchData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['savora_token', 'savora_user']);
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba{userName ? `, ${userName}` : ''} 👋</Text>
          <Text style={styles.tagline}>Bugün ne yemek istersin?</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Çıkış</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={[]}
        keyExtractor={() => 'dummy'}
        renderItem={() => null}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        ListHeaderComponent={
          <>
            {/* Aktif Menüler */}
            <Text style={styles.sectionTitle}>🍽️ Aktif Menüler</Text>
            {products.length === 0 ? (
              <Text style={styles.empty}>Henüz aktif yemek yok.</Text>
            ) : (
              products.map((p) => (
                <View key={p._id} style={styles.card}>
                  <View style={styles.cardLeft}>
                    <Text style={styles.cardName}>{p.name}</Text>
                    <Text style={styles.cardCategory}>{p.category}</Text>
                    <Text style={styles.cardPortion}>{p.portion} porsiyon kaldı</Text>
                  </View>
                  <View style={styles.cardRight}>
                    <Text style={styles.cardPrice}>₺{p.price}</Text>
                    <TouchableOpacity style={styles.orderBtn}>
                      <Text style={styles.orderBtnText}>Sipariş Ver</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}

            {/* Bölgesel Talepler */}
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>📋 Bölgesel Talepler</Text>
            {offers.length === 0 ? (
              <Text style={styles.empty}>Henüz açık talep yok.</Text>
            ) : (
              offers.map((o) => (
                <View key={o._id} style={[styles.card, styles.offerCard]}>
                  <Text style={styles.cardName}>{o.title}</Text>
                  <Text style={styles.cardCategory}>{o.description}</Text>
                  <View style={styles.offerMeta}>
                    <Text style={styles.offerBudget}>Bütçe: ₺{o.budget}</Text>
                    <Text style={styles.offerCategory}>{o.category}</Text>
                  </View>
                </View>
              ))
            )}
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  greeting: { fontSize: 20, fontWeight: '700', color: '#1a1a2e' },
  tagline: { fontSize: 13, color: '#888', marginTop: 2 },
  logoutBtn: { backgroundColor: '#f0f0f3', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  logoutText: { fontSize: 13, fontWeight: '600', color: '#666' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a2e', marginHorizontal: 20, marginTop: 20, marginBottom: 12 },
  empty: { textAlign: 'center', color: '#aaa', fontSize: 14, marginVertical: 20 },
  card: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 12, borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardLeft: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  cardCategory: { fontSize: 12, color: '#FF6B35', marginTop: 2 },
  cardPortion: { fontSize: 12, color: '#999', marginTop: 4 },
  cardRight: { alignItems: 'flex-end', gap: 8 },
  cardPrice: { fontSize: 18, fontWeight: '800', color: '#10B981' },
  orderBtn: { backgroundColor: '#FF6B35', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  orderBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  offerCard: { flexDirection: 'column', alignItems: 'flex-start' },
  offerMeta: { flexDirection: 'row', gap: 12, marginTop: 8 },
  offerBudget: { fontSize: 13, fontWeight: '700', color: '#10B981' },
  offerCategory: { fontSize: 13, color: '#888' },
});
