import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BackendDataService from "../services/BackendDataServices";

const AuthModal = ({ isOpen, onClose, initialTab, onLoginSuccess }) => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab]   = useState("register");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  // Register form
  const [regForm, setRegForm] = useState({ name: "", email: "", phone: "", password: "" });

  // Login form
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || "register");
      setError("");
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // ---------- REGISTER ----------
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await BackendDataService.registerUser(regForm);
      // Kayıt başarılı → otomatik giriş
      const loginRes = await BackendDataService.loginUser({
        email: regForm.email,
        password: regForm.password,
      });
      const { token, user } = loginRes.data;
      onLoginSuccess(token, "user", user);
      onClose();
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Kayıt sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- LOGIN ----------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await BackendDataService.loginUser(loginForm);
      const { token, user } = res.data;
      onLoginSuccess(token, "user", user);
      onClose();
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Geçersiz e-posta veya şifre.");
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError("");
  };

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
            onClick={() => switchTab("register")}
          >
            Kayıt Ol
          </button>
          <button
            className={`tab-btn ${activeTab === "login" ? "active" : ""}`}
            onClick={() => switchTab("login")}
          >
            Giriş Yap
          </button>
        </div>

        {/* Hata mesajı */}
        {error && (
          <div style={{
            margin: "0 1.5rem",
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

        <div className="modal-body">
          {activeTab === "register" ? (
            <form className="form-fade" onSubmit={handleRegister}>
              <div className="input-group">
                <label>Ad Soyad</label>
                <input
                  type="text"
                  placeholder="İrem Nur"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Telefon <span style={{ fontWeight: 400, color: "#999" }}>(opsiyonel)</span></label>
                <input
                  type="tel"
                  placeholder="05XX XXX XX XX"
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>E-posta</label>
                <input
                  type="email"
                  placeholder="ornek@mail.com"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Şifre</label>
                <input
                  type="password"
                  placeholder="En az 6 karakter"
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <button className="btn-submit" type="submit" disabled={loading}>
                {loading ? "Oluşturuluyor..." : "Hesap Oluştur"}
              </button>
            </form>
          ) : (
            <form className="form-fade" onSubmit={handleLogin}>
              <div className="input-group">
                <label>E-posta</label>
                <input
                  type="email"
                  placeholder="ornek@mail.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Şifre</label>
                <input
                  type="password"
                  placeholder="Şifrenizi giriniz"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
              <div className="info-box">
                💡 Giriş yapmak için kayıtlı e-posta adresinizi kullanın.
              </div>
              <button className="btn-submit" type="submit" disabled={loading}>
                {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;