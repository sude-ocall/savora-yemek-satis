import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BackendDataService from "../services/BackendDataServices";

const STATUS_MAP = {
  new: "Yeni",
  preparing: "Hazırlanıyor",
  on_the_way: "Yolda",
  completed: "Tamamlandı",
  cancelled: "Restoran İptali"
};

const ProfilePage = ({ token, user, onLogout, onUpdateUser }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || "profile");

  const [userInfo, setUserInfo]         = useState({ fullName: user?.name || "", email: user?.email || "", phone: "" });
  const [tempUserInfo, setTempUserInfo] = useState({ fullName: user?.name || "", email: user?.email || "", phone: "" });
  const [isEditing, setIsEditing]       = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [orders, setOrders]             = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [addresses, setAddresses]       = useState([]);
  const [cards, setCards]               = useState([]);

  const [showDeleteModal, setShowDeleteModal]     = useState(false);
  const [showAddressModal, setShowAddressModal]   = useState(false);
  const [showCardModal, setShowCardModal]         = useState(false);
  const [editingAddressIdx, setEditingAddressIdx] = useState(null);

  const [newAddress, setNewAddress] = useState({ title: "", city: "", district: "", detail: "" });
  const [passwords, setPasswords]   = useState({ current: "", new: "", confirm: "" });
  const [newCard, setNewCard]       = useState({ holder: "", number: "", expiry: "", cvc: "" });
  const [notification, setNotification] = useState("");

  // ─── Profil yükle ───
  useEffect(() => {
    if (!token) return;
    BackendDataService.getUserProfile(token)
      .then(res => {
        const u = res.data.user;
        const info = { fullName: u.name, email: u.email, phone: u.phone || "" };
        setUserInfo(info);
        setTempUserInfo(info);
        setAddresses(u.addresses || []);
        setCards((u.creditCards || []).map((c, i) => ({
          id: i,
          brand: "Kart",
          lastFour: c.last4,
          expiry: c.expiryDate
        })));
      })
      .catch(err => {
        console.error("Profil yüklenemedi:", err);
        showNotification("❌ Profil bilgileri yüklenemedi.");
      });
  }, [token]);

  // ─── Siparişleri 15sn'de bir yenile (orders tab aktifken) ───
  const fetchOrders = useCallback(async () => {
    if (activeTab !== "orders") return;
    try {
      const res = await BackendDataService.getUserOrders(token);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  }, [activeTab, token]);

  useEffect(() => {
    if (activeTab !== "orders") return;
    setLoadingOrders(true);
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [activeTab, fetchOrders]);

  // ─── Bildirim otomatik kapat ───
  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(""), 3000);
    return () => clearTimeout(t);
  }, [notification]);

  const showNotification = (msg) => setNotification(msg);

  // ─── Profil kaydet ───
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await BackendDataService.updateUserProfile(
        { name: tempUserInfo.fullName, phone: tempUserInfo.phone },
        token
      );
      const u = res.data.user;
      const info = { fullName: u.name, email: u.email, phone: u.phone || "" };
      setUserInfo(info);
      setTempUserInfo(info);
      setIsEditing(false);
      showNotification("✅ Profil bilgileri güncellendi.");
      if (onUpdateUser) onUpdateUser({ name: u.name, phone: u.phone || "" });
    } catch (err) {
      showNotification("❌ " + (err.response?.data?.message || "Güncelleme başarısız."));
    } finally {
      setSavingProfile(false);
    }
  };

  // ─── Şifre güncelle ───
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      showNotification("❌ Yeni şifreler eşleşmiyor!");
      return;
    }
    if (passwords.new.length < 6) {
      showNotification("❌ Yeni şifre en az 6 karakter olmalı.");
      return;
    }
    try {
      await BackendDataService.updatePassword(
        { currentPassword: passwords.current, newPassword: passwords.new },
        token
      );
      showNotification("✅ Şifre başarıyla güncellendi.");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      showNotification("❌ " + (err.response?.data?.message || "Şifre güncellenemedi."));
    }
  };

  // ─── Hesap sil ───
  const handleDeleteAccount = async () => {
    try {
      await BackendDataService.deleteUser(token);
      onLogout();
      navigate("/");
    } catch (err) {
      showNotification("❌ Hesap silinemedi: " + (err.response?.data?.message || "Hata oluştu."));
      setShowDeleteModal(false);
    }
  };

  // ─── Adres modal aç ───
  const openAddressModal = (address = null, idx = null) => {
    if (address !== null) {
      setEditingAddressIdx(idx);
      setNewAddress({
        title: address.title || "",
        city: address.city || "",
        district: address.district || "",
        detail: address.addressLine || address.detail || ""
      });
    } else {
      setEditingAddressIdx(null);
      setNewAddress({ title: "", city: "", district: "", detail: "" });
    }
    setShowAddressModal(true);
  };

  // ─── Adres kaydet ───
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressIdx !== null) {
        // Eskisini sil, yenisini ekle
        await BackendDataService.deleteAddress(editingAddressIdx, token);
        const res = await BackendDataService.addAddress(
          { title: newAddress.title, addressLine: newAddress.detail, city: newAddress.city, district: newAddress.district },
          token
        );
        setAddresses(res.data.addresses);
        showNotification("✅ Adres güncellendi.");
      } else {
        const res = await BackendDataService.addAddress(
          { title: newAddress.title, addressLine: newAddress.detail, city: newAddress.city, district: newAddress.district },
          token
        );
        setAddresses(res.data.addresses);
        showNotification("✅ Adres eklendi.");
      }
    } catch (err) {
      showNotification("❌ Adres kaydedilemedi: " + (err.response?.data?.message || "Hata oluştu."));
    }
    setShowAddressModal(false);
  };

  // ─── Adres sil ───
  const handleDeleteAddress = async (idx) => {
    try {
      const res = await BackendDataService.deleteAddress(idx, token);
      setAddresses(res.data.addresses);
      showNotification("✅ Adres silindi.");
    } catch (err) {
      showNotification("❌ Adres silinemedi.");
    }
  };

  // ─── Kart numarası formatlama ───
  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, "").substring(0, 16);
    return digits.match(/.{1,4}/g)?.join(" ") || digits;
  };

  // ─── Son kullanma tarihi formatlama ───
  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, "").substring(0, 4);
    return digits.length > 2 ? digits.substring(0, 2) + "/" + digits.substring(2) : digits;
  };

  // ─── Kart ekle ───
  const handleAddCard = async (e) => {
    e.preventDefault();
    const rawNumber = newCard.number.replace(/\s/g, "");
    if (rawNumber.length < 16) {
      showNotification("❌ Geçerli bir kart numarası giriniz.");
      return;
    }
    const last4 = rawNumber.slice(-4);
    try {
      const res = await BackendDataService.addCreditCard(
        { cardHash: rawNumber, last4, expiryDate: newCard.expiry },
        token
      );
      setCards(res.data.creditCards.map((c, i) => ({
        id: i, brand: "Kart", lastFour: c.last4, expiry: c.expiryDate
      })));
      showNotification("✅ Kart eklendi.");
      setShowCardModal(false);
      setNewCard({ holder: "", number: "", expiry: "", cvc: "" });
    } catch (err) {
      showNotification("❌ Kart eklenemedi: " + (err.response?.data?.message || "Hata oluştu."));
    }
  };

  // ─── Kart sil ───
  const handleDeleteCard = async (idx) => {
    try {
      const res = await BackendDataService.deleteCreditCard(idx, token);
      setCards(res.data.creditCards.map((c, i) => ({
        id: i, brand: "Kart", lastFour: c.last4, expiry: c.expiryDate
      })));
      showNotification("✅ Kart silindi.");
    } catch (err) {
      showNotification("❌ Kart silinemedi.");
    }
  };

  const initials = userInfo.fullName
    ? userInfo.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const TABS = [
    ["profile", "👤 Profil"],
    ["orders", "📦 Siparişlerim"],
    ["addresses", "📍 Adreslerim"],
    ["payments", "💳 Ödemeler"],
    ["password", "🔑 Güvenlik"]
  ];

  return (
    <div className="profile-page-container container py-5 min-vh-100">
      {/* Toast Bildirim */}
      {notification && (
        <div className="toast-notification" style={{ position: "fixed", top: 20, right: 20, zIndex: 9999 }}>
          <div className="toast-content">{notification}</div>
        </div>
      )}

      <div className="row">
        {/* ─── Sidebar ─── */}
        <div className="col-md-4 col-lg-3">
          <div className="profile-sidebar shadow-sm bg-white rounded-4 p-4 mb-4">
            <div className="text-center mb-4">
              <div
                className="avatar-circle bg-success text-white mx-auto mb-2 d-flex align-items-center justify-content-center fw-bold"
                style={{ width: 60, height: 60, borderRadius: "50%", fontSize: 20 }}
              >
                {initials}
              </div>
              <h5 className="mb-0 fw-bold">{userInfo.fullName}</h5>
              <small className="text-muted">{userInfo.email}</small>
            </div>
            <div className="d-flex flex-column gap-1 sidebar-menu">
              {TABS.map(([tab, label]) => (
                <button
                  key={tab}
                  className={`btn text-start ${activeTab === tab ? "btn-light text-success fw-bold" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {label}
                </button>
              ))}
              <hr />
              <button className="btn text-start text-danger" onClick={() => setShowDeleteModal(true)}>
                🗑️ Hesabı Sil
              </button>
            </div>
          </div>
        </div>

        {/* ─── İçerik ─── */}
        <div className="col-md-8 col-lg-9">
          <div className="profile-content-card shadow-sm bg-white rounded-4 p-4">

            {/* Profil */}
            {activeTab === "profile" && (
              <div className="fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="m-0 fw-bold">Profil Bilgileri</h4>
                  {!isEditing ? (
                    <button
                      className="btn btn-outline-dark btn-sm rounded-pill px-3"
                      onClick={() => { setTempUserInfo({ ...userInfo }); setIsEditing(true); }}
                    >
                      Düzenle
                    </button>
                  ) : (
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success btn-sm rounded-pill px-3"
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                      >
                        {savingProfile ? "Kaydediliyor..." : "Kaydet"}
                      </button>
                      <button
                        className="btn btn-light btn-sm rounded-pill px-3"
                        onClick={() => setIsEditing(false)}
                      >
                        İptal
                      </button>
                    </div>
                  )}
                </div>
                <div className="row g-3">
                  {[
                    { label: "Ad Soyad", key: "fullName", type: "text" },
                    { label: "E-posta", key: "email", type: "text", disabled: true },
                    { label: "Telefon", key: "phone", type: "text" }
                  ].map(({ label, key, type, disabled }) => (
                    <div className="col-12" key={key}>
                      <label className="small fw-bold text-secondary">{label}</label>
                      <input
                        type={type}
                        className={`form-control ${disabled ? "bg-light" : ""}`}
                        value={isEditing && !disabled ? tempUserInfo[key] : userInfo[key]}
                        onChange={e => setTempUserInfo({ ...tempUserInfo, [key]: e.target.value })}
                        disabled={!isEditing || disabled}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Siparişler */}
            {activeTab === "orders" && (
              <div className="fade-in">
                <h4 className="mb-4 fw-bold">Sipariş Geçmişi</h4>
                {loadingOrders ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-success" />
                  </div>
                ) : (
                  <div className="scrollable-content">
                    {orders.length === 0 && (
                      <p className="text-muted text-center py-4">Henüz siparişiniz yok.</p>
                    )}
                    {orders.map(o => (
                      <div key={o._id} className="border rounded-4 p-3 mb-3 bg-light border-0">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="fw-bold">#{o._id.slice(-6).toUpperCase()}</span>
                          <span className="badge bg-white text-dark shadow-sm">
                            {STATUS_MAP[o.status] || o.status}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between small text-muted">
                          <span>{o.restaurantId?.restaurantName || "Restoran"}</span>
                          <span className="fw-bold text-dark">{o.menu?.length} ürün</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Adresler */}
            {activeTab === "addresses" && (
              <div className="fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="m-0 fw-bold">Adreslerim</h4>
                  <button
                    className="btn btn-warning btn-sm fw-bold rounded-pill px-3 shadow-sm"
                    onClick={() => openAddressModal()}
                  >
                    + Yeni Ekle
                  </button>
                </div>
                <div className="scrollable-content">
                  {addresses.length === 0 && (
                    <p className="text-muted text-center py-4">Kayıtlı adres yok.</p>
                  )}
                  {addresses.map((a, idx) => (
                    <div
                      key={idx}
                      className="border rounded-4 p-3 mb-3 d-flex justify-content-between align-items-center bg-white shadow-sm border-0"
                    >
                      <div>
                        <div className="fw-bold text-dark">{a.title || "Adres " + (idx + 1)}</div>
                        <div className="small text-muted">{a.city}, {a.district}</div>
                        <div className="small text-muted opacity-75">{a.addressLine || a.detail}</div>
                      </div>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-link text-primary btn-sm text-decoration-none fw-bold"
                          onClick={() => openAddressModal(a, idx)}
                        >
                          Düzenle
                        </button>
                        <button
                          className="btn btn-link text-danger btn-sm text-decoration-none"
                          onClick={() => handleDeleteAddress(idx)}
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ödemeler */}
            {activeTab === "payments" && (
              <div className="fade-in">
                <h4 className="mb-4 fw-bold">Ödeme Yöntemleri</h4>
                <div className="scrollable-content">
                  {cards.length === 0 && (
                    <p className="text-muted text-center py-4">Kayıtlı kart yok.</p>
                  )}
                  {cards.map((c, idx) => (
                    <div key={idx} className="payment-card-item bg-white shadow-sm border-0 rounded-4">
                      <div className="d-flex align-items-center gap-3">
                        <span style={{ fontSize: 24 }}>💳</span>
                        <div>
                          <div className="card-masked-no fw-bold text-dark">
                            **** **** **** {c.lastFour}
                          </div>
                          <small className="text-muted">{c.brand} | {c.expiry}</small>
                        </div>
                      </div>
                      <button
                        className="btn btn-sm text-danger fw-bold"
                        onClick={() => handleDeleteCard(idx)}
                      >
                        Kaldır
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn-add-card-dash mt-2"
                    onClick={() => setShowCardModal(true)}
                  >
                    + Yeni Kart Ekle
                  </button>
                </div>
              </div>
            )}

            {/* Güvenlik */}
            {activeTab === "password" && (
              <div className="fade-in">
                <h4 className="mb-4 fw-bold">Şifre Değiştir</h4>
                <form onSubmit={handleUpdatePassword}>
                  {[
                    { label: "Mevcut Şifre", key: "current" },
                    { label: "Yeni Şifre", key: "new" },
                    { label: "Yeni Şifre (Tekrar)", key: "confirm" }
                  ].map(({ label, key }) => (
                    <div className="mb-3" key={key}>
                      <label className="small fw-bold text-secondary">{label}</label>
                      <input
                        type="password"
                        required
                        className="form-control"
                        value={passwords[key]}
                        onChange={e => setPasswords({ ...passwords, [key]: e.target.value })}
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
                    className="btn btn-warning w-100 mt-2 fw-bold rounded-pill py-2 shadow-sm"
                  >
                    Güncelle
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Adres Modalı ─── */}
      {showAddressModal && (
        <div
          className="modal-overlay d-flex align-items-center justify-content-center"
          style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
        >
          <div className="bg-white p-4 rounded-4 shadow-lg fade-in" style={{ width: "100%", maxWidth: 480 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="m-0 fw-bold">
                {editingAddressIdx !== null ? "Adresi Düzenle" : "Yeni Adres Ekle"}
              </h5>
              <button className="btn-close" onClick={() => setShowAddressModal(false)}></button>
            </div>
            <form onSubmit={handleSaveAddress}>
              <div className="mb-3">
                <label className="small fw-bold text-dark mb-1">Adres Başlığı</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="Ev, İş, Okul..."
                  value={newAddress.title}
                  onChange={e => setNewAddress({ ...newAddress, title: e.target.value })}
                />
              </div>
              <div
                className="address-grid"
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}
              >
                <div>
                  <label className="small fw-bold text-dark mb-1">İl</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="Şehir"
                    value={newAddress.city}
                    onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="small fw-bold text-dark mb-1">İlçe</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="İlçe"
                    value={newAddress.district}
                    onChange={e => setNewAddress({ ...newAddress, district: e.target.value })}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="small fw-bold text-dark mb-1">Adres Detayı</label>
                <textarea
                  className="form-control"
                  required
                  rows="3"
                  placeholder="Mahalle, sokak, bina ve daire no..."
                  value={newAddress.detail}
                  onChange={e => setNewAddress({ ...newAddress, detail: e.target.value })}
                ></textarea>
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-light w-50 fw-bold rounded-pill py-2"
                  onClick={() => setShowAddressModal(false)}
                >
                  İptal
                </button>
                <button type="submit" className="btn btn-warning w-50 fw-bold rounded-pill py-2 shadow-sm">
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Kart Modalı ─── */}
      {showCardModal && (
        <div
          className="modal-overlay d-flex align-items-center justify-content-center"
          style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
        >
          <div className="bg-white p-4 rounded-4 shadow-lg fade-in" style={{ width: "100%", maxWidth: 400 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="m-0 fw-bold">Yeni Kart Ekle</h5>
              <button className="btn-close" onClick={() => setShowCardModal(false)}></button>
            </div>
            <form onSubmit={handleAddCard}>
              <div className="mb-3">
                <label className="small fw-bold mb-1">Kart Üzerindeki İsim</label>
                <input
                  type="text"
                  className="form-control text-uppercase"
                  required
                  placeholder="AD SOYAD"
                  value={newCard.holder}
                  onChange={e => setNewCard({ ...newCard, holder: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="small fw-bold mb-1">Kart Numarası</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  value={newCard.number}
                  onChange={e => setNewCard({ ...newCard, number: formatCardNumber(e.target.value) })}
                />
              </div>
              <div className="row g-2">
                <div className="col-6 mb-3">
                  <label className="small fw-bold mb-1">S.K.T (AA/YY)</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="MM/YY"
                    maxLength={5}
                    value={newCard.expiry}
                    onChange={e => setNewCard({ ...newCard, expiry: formatExpiry(e.target.value) })}
                  />
                </div>
                <div className="col-6 mb-3">
                  <label className="small fw-bold mb-1">CVC</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="***"
                    maxLength="3"
                    value={newCard.cvc}
                    onChange={e => setNewCard({ ...newCard, cvc: e.target.value.replace(/\D/g, "") })}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-warning w-100 fw-bold rounded-pill py-2 shadow-sm">
                Kaydet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── Hesap Sil Modalı ─── */}
      {showDeleteModal && (
        <div
          className="modal-overlay d-flex align-items-center justify-content-center"
          style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
        >
          <div className="bg-white p-4 rounded-4 text-center shadow fade-in" style={{ maxWidth: 350 }}>
            <h5 className="text-danger fw-bold">Hesabını Sil?</h5>
            <p className="small text-muted">Bu işlem tüm verilerini kalıcı olarak silecektir.</p>
            <div className="d-grid gap-2 mt-4">
              <button
                className="btn btn-danger fw-bold rounded-pill py-2"
                onClick={handleDeleteAccount}
              >
                Evet, Sil
              </button>
              <button
                className="btn btn-light fw-bold rounded-pill py-2"
                onClick={() => setShowDeleteModal(false)}
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;