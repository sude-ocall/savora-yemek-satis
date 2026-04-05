import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MainPage from "./pages/MainPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import SellerHome from "./pages/SellerHome";
import SellerLogin from "./pages/SellerLogin";
import SellerPage from "./pages/SellerPage";
import SellerShow from "./pages/SellerShow";
import PaymentPage from "./pages/PaymentPage";

import './App.css';
import './css/navbar.css';
import './css/footer.css';
import './css/mainPage.css';
import './css/authModal.css';
import './css/homePage.css'
import './css/paymentPage.css'
import './css/profilePage.css'
import './css/sellerPage.css'
import './css/sellerLogin.css'
import './css/sellerHome.css'
import './css/sellerShow.css'

const getInitialAuth = () => {
  try {
    const token = localStorage.getItem("savora_token");
    const role  = localStorage.getItem("savora_role");
    const user  = JSON.parse(localStorage.getItem("savora_user") || "null");
    if (token && role) return { token, role, user };
  } catch {}
  return { token: null, role: null, user: null };
};

function App() {
  const [auth, setAuth] = useState(getInitialAuth);

  // ─── Sepet (tüm sayfalar arası paylaşımlı) ───────────────────────────────
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem("savora_cart");
      if (!raw) return [];
      const { cart: c, expiresAt } = JSON.parse(raw);
      if (Date.now() > expiresAt) { localStorage.removeItem("savora_cart"); return []; }
      return Array.isArray(c) ? c : [];
    } catch { return []; }
  });

  useEffect(() => {
    try {
      localStorage.setItem("savora_cart", JSON.stringify({
        cart,
        expiresAt: Date.now() + 30 * 60 * 1000   // 30 dakika
      }));
    } catch {}
  }, [cart]);

  const addToCart      = (item)  => setCart(prev => [...prev, item]);
  const removeFromCart = (index) => setCart(prev => prev.filter((_, i) => i !== index));
  const clearCart      = ()      => setCart([]);

  const handleLogin = (token, role, user) => {
    localStorage.setItem("savora_token", token);
    localStorage.setItem("savora_role", role);
    localStorage.setItem("savora_user", JSON.stringify(user));
    setAuth({ token, role, user });
  };

  const handleLogout = () => {
    localStorage.removeItem("savora_token");
    localStorage.removeItem("savora_role");
    localStorage.removeItem("savora_user");
    localStorage.removeItem("savora_cart");
    setCart([]);
    setAuth({ token: null, role: null, user: null });
  };

  const isLoggedIn = !!auth.token;

  return (
    <>
      <Navbar
        isLoggedIn={isLoggedIn}
        userRole={auth.role}
        user={auth.user}
        onLogout={handleLogout}
        onLoginSuccess={handleLogin}
      />
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn
              ? <Navigate to={auth.role === "seller" ? "/seller-home" : "/home"} replace />
              : <MainPage onLoginSuccess={handleLogin} />
          }
        />
        <Route
          path="/seller-login"
          element={
            isLoggedIn
              ? <Navigate to="/seller-home" replace />
              : <SellerLogin onLoginSuccess={handleLogin} />
          }
        />
        <Route
          path="/home"
          element={
            isLoggedIn && auth.role === "user"
              ? <HomePage token={auth.token} user={auth.user} cart={cart} onAddToCart={addToCart} onRemoveFromCart={removeFromCart} onClearCart={clearCart} />
              : <Navigate to="/" replace />
          }
        />
        <Route
          path="/profile"
          element={
            isLoggedIn && auth.role === "user"
              ? <ProfilePage token={auth.token} user={auth.user} onLogout={handleLogout} />
              : <Navigate to="/" replace />
          }
        />
        <Route
          path="/payment"
          element={
            isLoggedIn
              ? <PaymentPage token={auth.token} onClearCart={clearCart} />
              : <Navigate to="/" replace />
          }
        />
        <Route
          path="/seller-home"
          element={
            isLoggedIn && auth.role === "seller"
              ? <SellerHome token={auth.token} seller={auth.user} />
              : <Navigate to="/seller-login" replace />
          }
        />
        <Route
          path="/seller-page"
          element={
            isLoggedIn && auth.role === "seller"
              ? <SellerPage token={auth.token} seller={auth.user} />
              : <Navigate to="/seller-login" replace />
          }
        />

        {/* token geçildi — kullanıcı adı JWT'den okunacak */}
        <Route path="/sellers/:id" element={<SellerShow token={auth.token} cart={cart} onAddToCart={addToCart} onRemoveFromCart={removeFromCart} onClearCart={clearCart} />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer/>
    </>
  );
}

export default App;