import { useState } from "react";
import { Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MainPage from "./pages/MainPage";
import HomePage from "./pages/HomePage";
import PaymentPage from "./pages/PaymentPage";


import './App.css';
import './css/navbar.css';
import './css/footer.css';
import './css/mainPage.css';
import './css/authModal.css';
import './css/homePage.css'
import './css/paymentPage.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  return (
      <div className="app-wrapper">
        <Navbar isLoggedIn={isLoggedIn} />
        
        <Routes>
          <Route 
            path="/" 
            element={isLoggedIn ? <Navigate to="/home" /> : <MainPage />} 
          />
          
          <Route path="/home" element={ <HomePage/> } />
          <Route path="/payment" element={ <PaymentPage/> } />

          <Route path="/profile" element={<div>Profil Sayfası</div>} />
        </Routes>

        <Footer />
      </div>
  );
}

export default App;