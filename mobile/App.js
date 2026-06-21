import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

// Screens
import LoginScreen from "./src/screens/LoginScreen";
import OrderConfirmScreen from "./src/screens/OrderConfirmScreen";
import OrderHistoryScreen from "./src/screens/OrderHistoryScreen";
import PaymentScreen from "./src/screens/PaymentScreen";
import OrderTrackingScreen from "./src/screens/OrderTrackingScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─── Tab İkonları ────────────────────────────────────────────────────────────
const TAB_ICONS = {
  "Sipariş Ver": "🍽️",
  "Siparişlerim": "📋",
  "Ödeme": "💳",
};

// ─── Tab Navigator ──────────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: focused ? 26 : 22 }}>
            {TAB_ICONS[route.name] || "📱"}
          </Text>
        ),
        tabBarActiveTintColor: "#FF6B35",
        tabBarInactiveTintColor: "#888",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginBottom: 4,
        },
        tabBarStyle: {
          height: 65,
          paddingTop: 6,
          backgroundColor: "#fff",
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 10,
        },
        headerStyle: {
          backgroundColor: "#FF6B35",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "700",
        },
      })}
    >
      <Tab.Screen
        name="Sipariş Ver"
        component={OrderConfirmScreen}
        options={{ title: "Sipariş Ver" }}
      />
      <Tab.Screen
        name="Siparişlerim"
        component={OrderHistoryScreen}
        options={{ title: "Siparişlerim" }}
      />
      <Tab.Screen
        name="Ödeme"
        component={PaymentScreen}
        options={{ title: "Ödeme" }}
      />
    </Tab.Navigator>
  );
}

// ─── Ana Uygulama ───────────────────────────────────────────────────────────
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Uygulama açılışında token kontrolü
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("savora_token");
      setIsLoggedIn(!!token);
    } catch (error) {
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (token, user) => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(["savora_token", "savora_user"]);
    setIsLoggedIn(false);
  };

  // ─── Splash / Loading ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <Text style={styles.splashLogo}>🍳</Text>
        <Text style={styles.splashTitle}>Savora</Text>
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
        <StatusBar style="light" />
      </View>
    );
  }

  // ─── Login olmamış kullanıcı ──────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <>
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
        <StatusBar style="light" />
      </>
    );
  }

  // ─── Ana uygulama ────────────────────────────────────────────────────────
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Ana Sayfa"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SiparişTakip"
          component={OrderTrackingScreen}
          options={{
            title: "Sipariş Takibi",
            headerStyle: { backgroundColor: "#FF6B35" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "700" },
          }}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
  },
  splashLogo: {
    fontSize: 72,
  },
  splashTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    marginTop: 8,
  },
});
