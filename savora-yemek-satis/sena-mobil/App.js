import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View } from "react-native";

import LoginScreen from "./screens/LoginScreen";
import CreateRequestScreen from "./screens/CreateRequestScreen";
import MyRequestsScreen from "./screens/MyRequestsScreen";
import RegionalRequestsScreen from "./screens/RegionalRequestsScreen";
import UpdateOfferScreen from "./screens/UpdateOfferScreen";
import AddReviewScreen from "./screens/AddReviewScreen";
import ReviewsScreen from "./screens/ReviewsScreen";

const DummyDeleteScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text style={{ fontSize: 18, fontWeight: "bold" }}>🗑️ Talebi Geri Cek</Text>
  </View>
);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const SELLER_ID = "69d2d67ac3a537b66ba5b9e0";

function BottomMenu() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#FF6B35" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "800" },
        tabBarActiveTintColor: "#FF6B35",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { height: 65, paddingBottom: 5 },
        tabBarLabelStyle: { fontSize: 8 },
      }}
    >
      <Tab.Screen name="Oluştur" component={CreateRequestScreen} options={{ tabBarIcon: () => <Text>📝</Text> }} />
      <Tab.Screen name="Taleplerim" component={MyRequestsScreen} options={{ tabBarIcon: () => <Text>🔄</Text> }} />
      <Tab.Screen name="Bölgesel" component={RegionalRequestsScreen} options={{ tabBarIcon: () => <Text>📍</Text> }} />
      <Tab.Screen name="Güncelle" component={UpdateOfferScreen} initialParams={{ offer: { _id: "", menuRequest: { title: "Talep secin", description: "Bolgesel talepler ekranindan secin" } } }} options={{ tabBarIcon: () => <Text>✏️</Text> }} />
      <Tab.Screen name="YorumYap" component={AddReviewScreen} initialParams={{ sellerId: SELLER_ID, sellerName: "Satici" }} options={{ tabBarIcon: () => <Text>✍️</Text> }} />
      <Tab.Screen name="Yorumlar" component={ReviewsScreen} initialParams={{ sellerId: SELLER_ID, sellerName: "Yorumlar" }} options={{ tabBarIcon: () => <Text>💬</Text> }} />
      <Tab.Screen name="Sil" component={DummyDeleteScreen} options={{ tabBarIcon: () => <Text>🗑️</Text> }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={BottomMenu} />
        <Stack.Screen name="AddReview" component={AddReviewScreen} options={{ headerShown: true, headerStyle: { backgroundColor: "#FF6B35" }, headerTintColor: "#fff", title: "Yorum Yap" }} />
        <Stack.Screen name="Reviews" component={ReviewsScreen} options={{ headerShown: true, headerStyle: { backgroundColor: "#FF6B35" }, headerTintColor: "#fff", title: "Yorumlar" }} />
        <Stack.Screen name="UpdateOffer" component={UpdateOfferScreen} options={{ headerShown: true, headerStyle: { backgroundColor: "#FF6B35" }, headerTintColor: "#fff", title: "Teklif Guncelle" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}