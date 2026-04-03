import { useState } from "react";
import { Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MainPage from "./pages/MainPage";

import './App.css';
import './css/navbar.css';
import './css/footer.css';
import './css/mainPage.css';
import './css/authModal.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
      <div className="app-wrapper">
        <Navbar isLoggedIn={isLoggedIn} />
        
        <Routes>
          <Route 
            path="/" 
            element={isLoggedIn ? <Navigate to="/home" /> : <MainPage />} 
          />
          
          <Route path="/home" element={<div>Home Sayfası (Giriş Yapıldı)</div>} />
          <Route path="/profile" element={<div>Profil Sayfası</div>} />
        </Routes>

        <Footer />
      </div>
  );
}

export default App;