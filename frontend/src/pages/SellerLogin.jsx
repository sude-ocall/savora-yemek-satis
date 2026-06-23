import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackendDataService from "../services/BackendDataServices";

const SellerLogin = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab]       = useState("login");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  // Login form
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  // Register form
  const [regForm, setRegForm] = useState({
    taxNumber: "",
    restaurantName: "",
    phone: "",
    email: "",
    password: "",
  });

  const openModal = (tab) => {
    setModalTab(tab);
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError("");
  };

  // ---------- LOGIN ----------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await BackendDataService.loginSeller(loginForm);
      const { token, seller } = res.data;
      onLoginSuccess(token, "seller", seller);
      navigate("/seller-home");
    } catch (err) {
      setError(err.response?.data?.message || "Geçersiz e-posta veya şifre.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- REGISTER ----------
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await BackendDataService.registerSeller(regForm);
      // Kayıt sonrası otomatik giriş
      const loginRes = await BackendDataService.loginSeller({
        email: regForm.email,
        password: regForm.password,
      });
      const { token, seller } = loginRes.data;
      onLoginSuccess(token, "seller", seller);
      navigate("/seller-home");
    } catch (err) {
      setError(err.response?.data?.message || "Kayıt sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="seller-login-container">
      <section className="hero-banner seller-hero min-vh-100">
        <div className="hero-content">
          <div className="hero-badge seller-badge">💼 SAVORA – SATICI PANELİ</div>
          <h1 className="hero-title">
            İşletmenizi <br /> <span>Dijitalle Büyütün</span>
          </h1>
          <p className="hero-subtitle">
            Siparişleri yönetin, menünüzü güncelleyin ve satışlarınızı takip edin.
          </p>
          <div className="hero-actions">
            <button className="btn-hero-yellow" onClick={() => openModal("register")}>
              Hemen Başvur
            </button>
            <button className="btn-hero-outline" onClick={() => openModal("login")}>
              Yönetici Girişi
            </button>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div
          className="auth-modal-overlay"
          onClick={(e) => e.target.className === "auth-modal-overlay" && closeModal()}
        >
          <div className="auth-modal-content">
            <button className="modal-close-btn" onClick={closeModal}>✕</button>

            <div className="modal-tabs">
              <button
                className={`tab-btn ${modalTab === "login" ? "active" : ""}`}
                onClick={() => { setModalTab("login"); setError(""); }}
              >
                Giriş Yap
              </button>
              <button
                className={`tab-btn ${modalTab === "register" ? "active" : ""}`}
                onClick={() => { setModalTab("register"); setError(""); }}
              >
                Kayıt Ol
              </button>
            </div>

            {/* Hata mesajı */}
            {error && (
              <div style={{
                margin: "0 1.5rem 12px",
                padding: "10px 14px",
                background: "#fff0f0",
                border: "1px solid #ffcccc",
                borderRadius: "8px",
                color: "#cc0000",
                fontSize: "14px",
                textAlign: "center"
              }}>
                ⚠️ {error}
              </div>
            )}

            <div className="modal-form-container">
              {modalTab === "login" ? (
                <form className="auth-form" onSubmit={handleLogin}>
                  <div className="form-group">
                    <label>E-posta Adresi</label>
                    <input
                      type="email"
                      placeholder="ornek@sirket.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Şifre</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-auth-submit" disabled={loading}>
                    {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                  </button>
                </form>
              ) : (
                <form className="auth-form" onSubmit={handleRegister}>
                  <div className="form-group">
                    <label>Şirket / Restoran Adı</label>
                    <input
                      type="text"
                      placeholder="İşletme adını giriniz"
                      value={regForm.restaurantName}
                      onChange={(e) => setRegForm({ ...regForm, restaurantName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Vergi Numarası</label>
                      <input
                        type="text"
                        placeholder="1234567890"
                        value={regForm.taxNumber}
                        onChange={(e) => setRegForm({ ...regForm, taxNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Telefon</label>
                      <input
                        type="tel"
                        placeholder="05XX XXX XX XX"
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>E-posta Adresi</label>
                    <input
                      type="email"
                      placeholder="kurumsal@sirket.com"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Şifre</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  <button type="submit" className="btn-auth-submit" disabled={loading}>
                    {loading ? "Kayıt yapılıyor..." : "Başvuruyu Tamamla"}
                  </button>
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