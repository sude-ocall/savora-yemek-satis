import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "../components/AuthModal";

const MainPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [modalTab, setModalTab]               = useState("register");

  const openModal = (tab) => {
    setModalTab(tab);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <main className="main-container">
        <section className="hero-banner min-vh-100">
          <div className="hero-content">
            <div className="hero-badge">🌿 SAVORA – KULLANICI PANELİ</div>
            <h1 className="hero-title">
              Lezzetin Adresi <br /> <span>Seni Bekliyor</span>
            </h1>
            <p className="hero-subtitle">
              Hesabını oluştur, profil bilgilerini yönet, satıcıları puanla.
            </p>

            <div className="hero-actions">
              <button className="btn-hero-yellow" onClick={() => openModal("register")}>
                Kayıt Ol
              </button>
              <button className="btn-hero-outline" onClick={() => openModal("login")}>
                Giriş Yap
              </button>
            </div>

            <div className="merchant-redirect">
              <p>İşletme sahibi misiniz?</p>
              <button
                className="btn-merchant-link"
                onClick={() => navigate("/seller-login")}
              >
                Savora Satıcı Paneline Git →
              </button>
            </div>
          </div>
          <div className="hero-bg-icon"></div>
        </section>
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={modalTab}
        onLoginSuccess={onLoginSuccess}
      />
    </>
  );
};

export default MainPage;