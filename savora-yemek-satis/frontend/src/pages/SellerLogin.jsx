import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SellerLogin = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("login");

  const openModal = (tab) => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  return (
    <div className="seller-login-container">
      <section className="hero-banner seller-hero min-vh-100">
        <div className="hero-content">
          <div className="hero-badge seller-badge">💼 SAVORA – SATICI PANELİ</div>
          <h1 className="hero-title">İşletmenizi <br /> <span>Dijitalle Büyütün</span></h1>
          <p className="hero-subtitle">Siparişleri yönetin, menünüzü güncelleyin ve satışlarınızı takip edin.</p>
          
          <div className="hero-actions">
            <button className="btn-hero-yellow" onClick={() => openModal("register")}>Hemen Başvur</button>
            <button className="btn-hero-outline" onClick={() => openModal("login")}>Yönetici Girişi</button>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="auth-modal-overlay" onClick={(e) => e.target.className === "auth-modal-overlay" && setIsModalOpen(false)}>
          <div className="auth-modal-content">
            <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            
            <div className="modal-tabs">
              <button className={`tab-btn ${modalTab === "login" ? "active" : ""}`} onClick={() => setModalTab("login")}>Giriş Yap</button>
              <button className={`tab-btn ${modalTab === "register" ? "active" : ""}`} onClick={() => setModalTab("register")}>Kayıt Ol</button>
            </div>

            <div className="modal-form-container">
              {modalTab === "login" ? (
                <form className="auth-form">
                  <div className="form-group">
                    <label>E-posta Adresi</label>
                    <input type="email" placeholder="ornek@sirket.com" />
                  </div>
                  <div className="form-group">
                    <label>Şifre</label>
                    <input type="password" placeholder="••••••••" />
                  </div>
                  <button type="submit" className="btn-auth-submit">Giriş Yap</button>
                </form>
              ) : (
                <form className="auth-form">
                  <div className="form-group">
                    <label>Şirket / Restoran Adı</label>
                    <input type="text" placeholder="İşletme adını giriniz" />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Vergi Numarası</label>
                      <input type="text" placeholder="1234567890" />
                    </div>
                    <div className="form-group">
                      <label>Telefon</label>
                      <input type="tel" placeholder="05XX XXX XX XX" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>E-posta Adresi</label>
                    <input type="email" placeholder="kurumsal@sirket.com" />
                  </div>
                  <div className="form-group">
                    <label>Şifre</label>
                    <input type="password" placeholder="••••••••" />
                  </div>
                  <button type="submit" className="btn-auth-submit">Başvuruyu Tamamla</button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerLogin;