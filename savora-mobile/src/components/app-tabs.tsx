import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [role, setRole] = useState<'seller' | 'customer'>('customer');

  useEffect(() => {
    AsyncStorage.getItem('savora_user').then((raw) => {
      if (raw) {
        const u = JSON.parse(raw);
        setRole(u.role === 'seller' ? 'seller' : 'customer');
      }
    });
  }, []);

  const isSeller = role === 'seller';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isSeller ? '#10B981' : '#FF6B35',
        tabBarStyle: { backgroundColor: colors.background },
      }}>
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="home" options={{ title: isSeller ? 'Panelim' : 'Ana Sayfa', href: isSeller ? null : '/home' }} />
      <Tabs.Screen name="menu" options={{ title: 'Menüm', href: isSeller ? '/menu' : null }} />
      <Tabs.Screen name="add" options={{ title: 'İlan Ekle', href: isSeller ? '/add' : null }} />
    </Tabs>
  );
}
