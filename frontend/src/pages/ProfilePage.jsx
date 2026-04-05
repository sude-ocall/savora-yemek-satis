import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BackendDataService from "../services/BackendDataServices";

const STATUS_MAP = {
  new: "Yeni",
  preparing: "Hazırlanıyor",
  on_the_way: "Yolda",
  completed: "Tamamlandı"
};

const ProfilePage = ({ token, user, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  const [userInfo, setUserInfo] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: ""
  });
  const [tempUserInfo, setTempUserInfo] = useState({ ...userInfo });
  const [isEditing, setIsEditing] = useState(false);

  const [orders, setOrders]           = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [addresses, setAddresses]     = useState([]);
  const [cards, setCards]             = useState([]);

  const [showDeleteModal, setShowDeleteModal]   = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showCardModal, setShowCardModal]       = useState(false);
  const [editingAddress, setEditingAddress]     = useState(null);
  const [newAddress, setNewAddress] = useState({ title: "", city: "", district: "", detail: "" });
  const [passwords, setPasswords]   = useState({ current: "", new: "", confirm: "" });
  const [newCard, setNewCard]       = useState({ holder: "", number: "", expiry: "", cvc: "" });
  const [notification, setNotification] = useState("");

  // Fetch profile on mount
  useEffect(() => {
    BackendDataService.getUserProfile(token)
      .then(res => {
        const u = res.data.user;
        const info = { fullName: u.name, email: u.email, phone: u.phone || "" };
        setUserInfo(info);
        setTempUserInfo(info);
        if (u.addresses?.length) setAddresses(u.addresses);
        if (u.creditCards?.length) {
          setCards(u.creditCards.map((c, i) => ({
            id: i, brand: "Kart", lastFour: c.last4, expiry: c.expiryDate
          })));
        }
      })
      .catch(err => console.error("Profil yüklenemedi:", err));
  }, [token]);

  // Fetch orders when tab selected
  useEffect(() => {
    if (activeTab !== "orders") return;
    setLoadingOrders(true);
    BackendDataService.getUserOrders(token)
      .then(res => setOrders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoadingOrders(false));
  }, [activeTab, token]);

  // Notification auto-dismiss
  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(""), 3000);
    return () => clearTimeout(t);
  }, [notification]);

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setNotification("Yeni şifreler eşleşmiyor!");
      return;
    }
    setNotification("Şifre değiştirme API'si henüz eklenmedi.");
    setPasswords({ current: "", new: "", confirm: "" });
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    const lastFour = newCard.number.slice(-4);
    setCards([...cards, { id: Date.now(), brand: "Mastercard", lastFour, expiry: newCard.expiry }]);
    setShowCardModal(false);
    setNewCard({ holder: "", number: "", expiry: "", cvc: "" });
  };

  const openAddressModal = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setNewAddress({
        title: address.title || "",
        city: address.city || "",
        district: address.district || "",
        detail: address.addressLine || address.detail || ""
      });
    } else {
      setEditingAddress(null);
      setNewAddress({ title: "", city: "", district: "", detail: "" });
    }
    setShowAddressModal(true);
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (editingAddress) {
      setAddresses(addresses.map(a => a === editingAddress ? { ...newAddress } : a));
    } else {
      setAddresses([...addresses, { ...newAddress }]);
    }
    setShowAddressModal(false);
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
      {notification && (
        <div className="toast-notification" style={{ position: "fixed", top: 20, right: 20, zIndex: 9999 }}>
          <div className="toast-content">⚠️ {notification}</div>
        </div>
      )}

      <div className="row">
        {/* ─── Sidebar ─── */}
        <div className="col-md-4 col-lg-3">
          <div className="profile-sidebar shadow-sm bg-white rounded-4 p-4 mb-4">
            <div className="text-center mb-4">
              <div className="avatar-circle bg-success text-white mx-auto mb-2 d-flex align-items-center justify-content-center fw-bold"
                style={{ width: 60, height: 60, borderRadius: "50%", fontSize: 20 }}>
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

        {/* ─── Content ─── */}
        <div className="col-md-8 col-lg-9">
          <div className="profile-content-card shadow-sm bg-white rounded-4 p-4">

            {/* Profil */}
            {activeTab === "profile" && (
              <div className="fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="m-0 fw-bold">Profil Bilgileri</h4>
                  {!isEditing ? (
                    <button className="btn btn-outline-dark btn-sm rounded-pill px-3"
                      onClick={() => { setTempUserInfo({ ...userInfo }); setIsEditing(true); }}>
                      Düzenle
                    </button>
                  ) : (
                    <div className="d-flex gap-2">
                      <button className="btn btn-success btn-sm rounded-pill px-3"
                        onClick={() => { setUserInfo(tempUserInfo); setIsEditing(false); }}>
                        Kaydet
                      </button>
                      <button className="btn btn-light btn-sm rounded-pill px-3" onClick={() => setIsEditing(false)}>
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
                  <div className="text-center py-4"><div className="spinner-border text-success" /></div>
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
                  <button className="btn btn-warning btn-sm fw-bold rounded-pill px-3 shadow-sm" onClick={() => openAddressModal()}>
                    + Yeni Ekle
                  </button>
                </div>
                <div className="scrollable-content">
                  {addresses.length === 0 && <p className="text-muted text-center py-4">Kayıtlı adres yok.</p>}
                  {addresses.map((a, idx) => (
                    <div key={idx} className="border rounded-4 p-3 mb-3 d-flex justify-content-between align-items-center bg-white shadow-sm border-0">
                      <div>
                        <div className="fw-bold text-dark">{a.title || "Adres"}</div>
                        <div className="small text-muted">{a.city}, {a.district}</div>
                        <div className="small text-muted opacity-75">{a.detail || a.addressLine}</div>
                      </div>
                      <div className="d-flex gap-1">
                        <button className="btn btn-link text-primary btn-sm text-decoration-none fw-bold" onClick={() => openAddressModal(a)}>Düzenle</button>
                        <button className="btn btn-link text-danger btn-sm text-decoration-none" onClick={() => setAddresses(addresses.filter((_, i) => i !== idx))}>Sil</button>
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
                  {cards.map((c, idx) => (
                    <div key={idx} className="payment-card-item bg-white shadow-sm border-0 rounded-4">
                      <div className="d-flex align-items-center gap-3">
                        <span style={{ fontSize: 24 }}>💳</span>
                        <div>
                          <div className="card-masked-no fw-bold text-dark">**** **** **** {c.lastFour}</div>
                          <small className="text-muted">{c.brand} | {c.expiry}</small>
                        </div>
                      </div>
                      <button className="btn btn-sm text-danger fw-bold" onClick={() => setCards(cards.filter((_, i) => i !== idx))}>Kaldır</button>
                    </div>
                  ))}
                  <button className="btn-add-card-dash mt-2" onClick={() => setShowCardModal(true)}>+ Yeni Kart Ekle</button>
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
                      <input type="password" required className="form-control"
                        value={passwords[key]}
                        onChange={e => setPasswords({ ...passwords, [key]: e.target.value })} />
                    </div>
                  ))}
                  <button type="submit" className="btn btn-warning w-100 mt-2 fw-bold rounded-pill py-2 shadow-sm">Güncelle</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Address Modal ─── */}
      {showAddressModal && (
        <div className="modal-overlay d-flex align-items-center justify-content-center"
          style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}>
          <div className="bg-white p-4 rounded-4 shadow-lg fade-in" style={{ width: "100%", maxWidth: 480 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="m-0 fw-bold">{editingAddress ? "Adresi Düzenle" : "Yeni Adres Ekle"}</h5>
              <button className="btn-close" onClick={() => setShowAddressModal(false)}></button>
            </div>
            <form onSubmit={handleSaveAddress}>
              <div className="mb-3">
                <label className="small fw-bold text-dark mb-1">Adres Başlığı</label>
                <input type="text" className="form-control" required placeholder="Ev, İş, Okul..." value={newAddress.title} onChange={e => setNewAddress({ ...newAddress, title: e.target.value })} />
              </div>
              <div className="address-grid">
                <div>
                  <label className="small fw-bold text-dark mb-1">İl</label>
                  <input type="text" className="form-control" required placeholder="Şehir" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                </div>
                <div>
                  <label className="small fw-bold text-dark mb-1">İlçe</label>
                  <input type="text" className="form-control" required placeholder="İlçe" value={newAddress.district} onChange={e => setNewAddress({ ...newAddress, district: e.target.value })} />
                </div>
              </div>
              <div className="mb-4">
                <label className="small fw-bold text-dark mb-1">Adres Detayı</label>
                <textarea className="form-control" required rows="3" placeholder="Mahalle, sokak, bina ve daire no..." value={newAddress.detail} onChange={e => setNewAddress({ ...newAddress, detail: e.target.value })}></textarea>
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-light w-50 fw-bold rounded-pill py-2" onClick={() => setShowAddressModal(false)}>İptal</button>
                <button type="submit" className="btn btn-warning w-50 fw-bold rounded-pill py-2 shadow-sm">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Card Modal ─── */}
      {showCardModal && (
        <div className="modal-overlay d-flex align-items-center justify-content-center"
          style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}>
          <div className="bg-white p-4 rounded-4 shadow-lg fade-in" style={{ width: "100%", maxWidth: 400 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="m-0 fw-bold">Yeni Kart Ekle</h5>
              <button className="btn-close" onClick={() => setShowCardModal(false)}></button>
            </div>
            <form onSubmit={handleAddCard}>
              <div className="mb-3">
                <label className="small fw-bold mb-1">Kart Üzerindeki İsim</label>
                <input type="text" className="form-control text-uppercase" required placeholder="AD SOYAD" value={newCard.holder} onChange={e => setNewCard({ ...newCard, holder: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="small fw-bold mb-1">Kart Numarası</label>
                <input type="text" className="form-control" required placeholder="0000 0000 0000 0000" maxLength="16" value={newCard.number} onChange={e => setNewCard({ ...newCard, number: e.target.value })} />
              </div>
              <div className="row g-2">
                <div className="col-6 mb-3">
                  <label className="small fw-bold mb-1">S.K.T (AA/YY)</label>
                  <input type="text" className="form-control" required placeholder="MM/YY" value={newCard.expiry} onChange={e => setNewCard({ ...newCard, expiry: e.target.value })} />
                </div>
                <div className="col-6 mb-3">
                  <label className="small fw-bold mb-1">CVC</label>
                  <input type="text" className="form-control" required placeholder="***" maxLength="3" value={newCard.cvc} onChange={e => setNewCard({ ...newCard, cvc: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn btn-warning w-100 fw-bold rounded-pill py-2 shadow-sm">Kaydet</button>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Modal ─── */}
      {showDeleteModal && (
        <div className="modal-overlay d-flex align-items-center justify-content-center"
          style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}>
          <div className="bg-white p-4 rounded-4 text-center shadow fade-in" style={{ maxWidth: 350 }}>
            <h5 className="text-danger fw-bold">Hesabını Sil?</h5>
            <p className="small text-muted">Bu işlem tüm verilerini kalıcı olarak silecektir.</p>
            <div className="d-grid gap-2 mt-4">
              <button className="btn btn-danger fw-bold rounded-pill py-2" onClick={() => { onLogout(); navigate("/"); }}>Evet, Sil</button>
              <button className="btn btn-light fw-bold rounded-pill py-2" onClick={() => setShowDeleteModal(false)}>Vazgeç</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;