import React, { useState } from "react";
import AuthModal from "../components/AuthModal";

const MainPage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("register"); // Hangi tabın açılacağını tutar

  const openModal = (tabName) => {
    setModalTab(tabName);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <main className="main-container">
        <section className="hero-banner min-vh-100">
          <div className="hero-content">
            <div className="hero-badge">🌿 SAVORA – KULLANICI PANELİ</div>
            <h1 className="hero-title"> Lezzetin Adresi <br /> <span>Seni Bekliyor</span> </h1>
            <p className="hero-subtitle">Hesabını oluştur, profil bilgilerini yönet, satıcıları puanla.</p>
            
            <div className="hero-actions">
              {/* Butonlara tıklandığında ilgili tab ismini gönderiyoruz */}
              <button className="btn-hero-yellow" onClick={() => openModal("register")}> Kayıt Ol </button>
              <button className="btn-hero-outline" onClick={() => openModal("login")}> Giriş Yap </button>
            </div>
          </div>
          <div className="hero-bg-icon"></div>
        </section>
      </main>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialTab={modalTab} // Seçilen tabı modal'a gönderiyoruz
      />
    </>
  );
};

export default MainPage;