import React, { useState, useEffect } from "react";

const AuthModal = ({ isOpen, onClose, initialTab }) => {
  const [activeTab, setActiveTab] = useState("register");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <div className="modal-header d-flex flex-column">
          <div className="modal-logo">🌿 Sav<span>ora</span></div>
          <p>Hesabınıza giriş yapın veya yeni hesap oluşturun.</p>
        </div>

        <div className="tab-container">
          <button 
            className={`tab-btn ${activeTab === "register" ? "active" : ""}`}
            onClick={() => setActiveTab("register")}
          >
            Kayıt Ol
          </button>
          <button 
            className={`tab-btn ${activeTab === "login" ? "active" : ""}`}
            onClick={() => setActiveTab("login")}
          >
            Giriş Yap
          </button>
        </div>

        <div className="modal-body">
          {activeTab === "register" ? (
            <div className="form-fade">
              <div className="input-group">
                <label>Ad Soyad</label>
                <input type="text" placeholder="İrem Nur" />
              </div>
              <div className="input-group">
                <label>E-posta</label>
                <input type="email" placeholder="ornek@mail.com" />
              </div>
              <div className="input-group">
                <label>Şifre</label>
                <input type="password" placeholder="En az 3 karakter" />
              </div>
              <button className="btn-submit">Hesap Oluştur</button>
            </div>
          ) : (
            <div className="form-fade">
              <div className="input-group">
                <label>E-posta</label>
                <input type="email" placeholder="ornek@mail.com" />
              </div>
              <div className="input-group">
                <label>Şifre</label>
                <input type="password" placeholder="Şifrenizi giriniz" />
              </div>
              <div className="info-box">
                💡 Giriş yapmak için kayıtlı e-posta adresinizi kullanın.
              </div>
              <button className="btn-submit">Giriş Yap</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;