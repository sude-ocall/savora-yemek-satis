import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import api from '@/services/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSeller, setIsSeller] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'E-posta ve şifre gerekli!');
      return;
    }
    setLoading(true);
    try {
      const endpoint = isSeller ? '/api/sellers/login' : '/api/users/login';
      const res = await api.post(endpoint, { email, password });
      const token: string = res.data.token;
      const user = res.data.seller ?? res.data.user ?? {};

      await AsyncStorage.setItem('savora_token', token);
      await AsyncStorage.setItem(
        'savora_user',
        JSON.stringify({ ...user, role: isSeller ? 'seller' : 'customer' })
      );
      router.replace('/');
    } catch (error: any) {
      const msg = error.response?.data?.message ?? 'Giriş başarısız. Tekrar deneyin.';
      Alert.alert('Giriş Hatası', msg);
    } finally {
      setLoading(false);
    }
  };

  const accent = isSeller ? '#10B981' : '#FF6B35';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: accent }]}>
      <View style={styles.card}>
        <Text style={styles.logo}>{isSeller ? '🏪' : '🍳'}</Text>
        <Text style={styles.title}>Savora</Text>
        <Text style={styles.subtitle}>
          {isSeller ? 'Satıcı Paneli Girişi' : 'Ev yapımı lezzetler kapınızda'}
        </Text>

        {/* Müşteri / Satıcı Toggle */}
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, !isSeller && { backgroundColor: '#FF6B35' }]}
            onPress={() => setIsSeller(false)}>
            <Text style={[styles.toggleText, !isSeller && styles.toggleTextActive]}>🍽️ Müşteri</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, isSeller && { backgroundColor: '#10B981' }]}
            onPress={() => setIsSeller(true)}>
            <Text style={[styles.toggleText, isSeller && styles.toggleTextActive]}>🏪 Satıcı</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>E-posta</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="ornek@email.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Şifre</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••"
          placeholderTextColor="#999"
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.loginBtn, { backgroundColor: accent }, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginBtnText}>
              {isSeller ? 'Satıcı Girişi Yap' : 'Giriş Yap'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  logo: { fontSize: 48, textAlign: 'center', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', color: '#1a1a2e' },
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 20 },
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f3',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#888' },
  toggleTextActive: { color: '#fff' },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  loginBtn: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  loginBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
