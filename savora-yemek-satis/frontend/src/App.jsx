import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MainPage from "./pages/MainPage";
import HomePage from "./pages/HomePage";
import PaymentPage from "./pages/PaymentPage";
import ProfilePage from "./pages/ProfilePage";
import SellerPage from "./pages/SellerPage";
import SellerLogin from "./pages/SellerLogin"; 
import SellerHome from "./pages/SellerHome";   
import SellerShow from "./pages/SellerShow"; // 1. ADIM: Import edildi

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

function App() {
  // Not: isLoggedIn ve userRole gerçek senaryoda bir AuthContext'ten gelmelidir.
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userRole, setUserRole] = useState("seller"); // "user" veya "seller"

  return (
      <div className="app-wrapper">
        <Navbar isLoggedIn={isLoggedIn} userRole={userRole} />
        
        <Routes>
          {/* Ana Sayfa: Login ise role göre yönlendirir */}
          <Route 
            path="/" 
            element={
              isLoggedIn 
                ? (userRole === "seller" ? <Navigate to="/seller-home" /> : <Navigate to="/home" />) 
                : <MainPage />
            } 
          />
          
          {/* Satıcı Giriş Sayfası */}
          <Route path="/seller-login" element={<SellerLogin />} />

          {/* Kullanıcı Routes */}
          <Route path="/home" element={isLoggedIn && userRole === "user" ? <HomePage/> : <Navigate to="/" />} />
          
          {/* 2. ADIM: Restoran Detay Sayfası Rotası Eklendi */}
          <Route 
            path="/seller-show/:id" 
            element={isLoggedIn && userRole === "user" ? <SellerShow/> : <Navigate to="/" />} 
          />
          
          <Route path="/payment" element={isLoggedIn && userRole === "user" ? <PaymentPage/> : <Navigate to="/" />} />
          <Route path="/profile" element={isLoggedIn && userRole === "user" ? <ProfilePage/> : <Navigate to="/" />} />

          {/* Satıcı Routes */}
          <Route path="/seller-home" element={isLoggedIn && userRole === "seller" ? <SellerHome/> : <Navigate to="/seller-login" />} />
          <Route path="/seller-profile" element={isLoggedIn && userRole === "seller" ? <SellerPage/> : <Navigate to="/seller-login" />} />
          
          {/* Yanlış URL girilirse ana sayfaya at */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <Footer />
      </div>
  );
}

export default App;