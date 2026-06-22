import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from "react-native";

// Screens
import LoginScreen from "./src/screens/LoginScreen";
import OrderConfirmScreen from "./src/screens/OrderConfirmScreen";
import OrderHistoryScreen from "./src/screens/OrderHistoryScreen";
import PaymentScreen from "./src/screens/PaymentScreen";
import OrderTrackingScreen from "./src/screens/OrderTrackingScreen";
import SellerDashboardScreen from "./src/screens/SellerDashboardScreen";
import SellerMenuScreen from "./src/screens/SellerMenuScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─── Tab İkonları ────────────────────────────────────────────────────────────
const TAB_ICONS = {
  "Sipariş Ver": "🍽️",
  "Siparişlerim": "📋",
  "Ödeme": "💳",
};

// ─── Tab Navigator ──────────────────────────────────────────────────────────
function MainTabs({ handleLogout }) {
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
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => {
              Alert.alert("Çıkış Yap", "Hesabınızdan çıkış yapmak istediğinize emin misiniz?", [
                { text: "İptal", style: "cancel" },
                { text: "Çıkış Yap", style: "destructive", onPress: handleLogout }
              ]);
            }} 
            style={{ marginRight: 16, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Çıkış Yap</Text>
          </TouchableOpacity>
        ),
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

// ─── Satıcı Tab Navigator ───────────────────────────────────────────────────
function SellerTabs({ handleLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          const icons = { "Gelen Siparişler": "📦", "Menü Yönetimi": "📋" };
          return <Text style={{ fontSize: focused ? 26 : 22 }}>{icons[route.name] || "🏪"}</Text>;
        },
        tabBarActiveTintColor: "#10B981",
        tabBarInactiveTintColor: "#888",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginBottom: 4 },
        tabBarStyle: {
          height: 65,
          paddingTop: 6,
          backgroundColor: "#fff",
          borderTopWidth: 0,
          elevation: 10,
        },
        headerStyle: { backgroundColor: "#10B981" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" },
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => {
              Alert.alert("Çıkış Yap", "Emin misiniz?", [
                { text: "İptal", style: "cancel" },
                { text: "Çıkış Yap", style: "destructive", onPress: handleLogout }
              ]);
            }} 
            style={{ marginRight: 16, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Çıkış Yap</Text>
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen
        name="Gelen Siparişler"
        component={SellerDashboardScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Menü Yönetimi"
        component={SellerMenuScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

// ─── Ana Uygulama ───────────────────────────────────────────────────────────
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("customer");
  const [isLoading, setIsLoading] = useState(true);

  // Uygulama açılışında token kontrolü
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("savora_token");
      const userStr = await AsyncStorage.getItem("savora_user");
      
      if (token && userStr) {
        const userObj = JSON.parse(userStr);
        setUserRole(userObj.role || "customer");
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (token, user) => {
    setUserRole(user.role || "customer");
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(["savora_token", "savora_user"]);
    setUserRole("customer");
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
        {userRole === "seller" ? (
          <Stack.Screen name="Satıcı Ana Sayfa" options={{ headerShown: false }}>
            {(props) => <SellerTabs {...props} handleLogout={handleLogout} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Ana Sayfa" options={{ headerShown: false }}>
            {(props) => <MainTabs {...props} handleLogout={handleLogout} />}
          </Stack.Screen>
        )}
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
