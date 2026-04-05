import React, { useState, useMemo, useEffect } from "react";
import BackendDataService from "../services/BackendDataServices";

const CATEGORIES = ["Tümü", "Burger", "Pizza", "Tatlı", "İçecek", "Yan Ürün"];

const SellerPage = ({ token, seller }) => {
  const [menu, setMenu]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState("Tümü");
  const [isFormOpen, setIsFormOpen]   = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null });
  const [formData, setFormData] = useState({ name: "", category: "Burger", price: "", description: "", imgURL: "", previewImage: "" });
  const [imageTab, setImageTab]       = useState("url");
  const [saving, setSaving]           = useState(false);
  const [notification, setNotification] = useState(null);

  // ── Profil düzenleme ─────────────────────────────────────────────────────
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    email: seller?.email || "",
    phone: seller?.phone || ""
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Fetch seller's own products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await BackendDataService.getProducts();
        const sellerId = seller?.id || seller?._id;
        const mine = res.data.filter(p =>
          p.sellerId?._id === sellerId || p.sellerId === sellerId
        );
        setMenu(mine);
      } catch (err) {
        console.error("Ürünler yüklenemedi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [seller]);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(t);
  }, [notification]);

  const filteredMenu = useMemo(() =>
    activeTab === "Tümü" ? menu : menu.filter(item => item.category === activeTab),
    [menu, activeTab]
  );

  const resetForm = () => {
    setFormData({ name: "", category: "Burger", price: "", description: "", imgURL: "", previewImage: "" });
    setImageTab("url");
    setEditingItem(null);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await BackendDataService.updateSellerProfile(profileForm, token);
      setNotification("Profil bilgileri güncellendi.");
      setShowProfileModal(false);
    } catch (err) {
      setNotification("Güncelleme başarısız: " + (err.response?.data?.message || "Hata"));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        description: formData.description,
        imgURL: formData.previewImage || formData.imgURL || ""
      };
      if (editingItem) {
        const res = await BackendDataService.updateProduct(editingItem._id, payload, token);
        setMenu(prev => prev.map(item => item._id === editingItem._id ? res.data : item));
        setNotification("Ürün güncellendi.");
      } else {
        const res = await BackendDataService.createProduct(payload, token);
        setMenu(prev => [res.data, ...prev]);
        setNotification("Ürün eklendi.");
      }
      setIsFormOpen(false);
      resetForm();
    } catch (err) {
      setNotification("Hata: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await BackendDataService.deleteProduct(id, token);
      setMenu(prev => prev.filter(m => m._id !== id));
      setNotification("Ürün silindi.");
    } catch {
      setNotification("Ürün silinemedi.");
    }
    setConfirmModal({ open: false, id: null });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-success" role="status" />
      </div>
    );
  }

  return (
    <div className="sl-page">
      {notification && (
        <div className="seller-toast-container">
          <div className="seller-toast-content">✅ {notification}</div>
        </div>
      )}

      <header className="sl-header">
        <div className="sl-header-inner">
          <div className="sl-header-profile">
            <div className="sl-avatar">{seller?.restaurantName?.charAt(0) || "S"}</div>
            <div className="sl-info">
              <h1>{seller?.restaurantName || "Restoran"}</h1>
              <div className="sl-meta">
                <span><i className="fa-solid fa-utensils"></i> {menu.length} İlan</span>
                {seller?.email && <span style={{marginLeft:8}}>✉️ {seller.email}</span>}
                {seller?.phone && <span style={{marginLeft:8}}>📞 {seller.phone}</span>}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="sl-add-btn" style={{ background: "#6c757d" }}
              onClick={() => { setProfileForm({ email: seller?.email || "", phone: seller?.phone || "" }); setShowProfileModal(true); }}>
              ✏️ Bilgileri Düzenle
            </button>
            <button className="sl-add-btn" onClick={() => { resetForm(); setIsFormOpen(true); }}>
              + Yeni Ürün Ekle
            </button>
          </div>
        </div>
      </header>

      <div className="sl-container">
        <nav className="sl-tabs">
          {CATEGORIES.map(cat => (
            <button key={cat} className={`sl-tab ${activeTab === cat ? "active" : ""}`} onClick={() => setActiveTab(cat)}>{cat}</button>
          ))}
        </nav>

        <div className="sl-menu-grid">
          {filteredMenu.map(item => (
            <div key={item._id} className="sl-menu-card">
              <div className="sl-card-img-wrap">
                {item.imgURL
                  ? <img src={item.imgURL} alt={item.name} />
                  : <div className="sl-no-img"><i className="fa-solid fa-image"></i></div>
                }
              </div>
              <div className="sl-card-content">
                <div className="sl-card-top-info">
                  <span className="sl-item-cat-label">{item.category}</span>
                </div>
                <h4 className="sl-item-title">{item.name}</h4>
                <p className="sl-item-desc">{item.description}</p>
                <div className="sl-card-action-row">
                  <div className="sl-item-price">{item.price} ₺</div>
                  <div className="sl-admin-btns">
                    <button className="sl-mini-btn" onClick={() => {
                      setEditingItem(item);
                      setFormData({ name: item.name, category: item.category, price: item.price, description: item.description, imgURL: item.imgURL || "", previewImage: item.imgURL || "" });
                      setImageTab("url");
                      setIsFormOpen(true);
                    }}>
                      <i className="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button className="sl-mini-btn sl-btn-del" onClick={() => setConfirmModal({ open: true, id: item._id })}>
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredMenu.length === 0 && (
            <p className="text-muted text-center py-5 w-100">Bu kategoride ürün yok.</p>
          )}
        </div>
      </div>

      {/* ─── Add/Edit Modal ─── */}
      {isFormOpen && (
        <div className="sl-custom-modal">
          <div className="sl-modal-backdrop" onClick={() => setIsFormOpen(false)} />
          <div className="sl-modal-content" style={{ maxHeight: "80vh", overflowY: "auto", padding: "20px" }}>
            <div className="sl-modal-header">
              <h3>{editingItem ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</h3>
              <button className="close-x" onClick={() => setIsFormOpen(false)}>&times;</button>
            </div>
            <div className="sl-image-tabs" style={{ display: "flex", gap: "4px", marginBottom: "10px" }}>
              <button className={`tab-btn ${imageTab === "url" ? "active" : ""}`} onClick={() => setImageTab("url")}>URL</button>
              <button className={`tab-btn ${imageTab === "file" ? "active" : ""}`} onClick={() => setImageTab("file")}>Dosya</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="sl-form-group">
                {formData.previewImage && (
                  <img src={formData.previewImage} alt="Önizleme" style={{ width: "100%", borderRadius: "6px", marginBottom: "10px" }} />
                )}
                {imageTab === "url" && (
                  <input type="text" placeholder="https://..." value={formData.imgURL}
                    onChange={e => setFormData({ ...formData, imgURL: e.target.value, previewImage: e.target.value })}
                    className="sl-input" />
                )}
                {imageTab === "file" && (
                  <input type="file" accept="image/*" className="sl-input"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setFormData({ ...formData, previewImage: reader.result, imgURL: "" });
                        reader.readAsDataURL(file);
                      }
                    }} />
                )}
              </div>
              <div className="sl-form-group">
                <label>Ürün Adı</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="sl-input" />
              </div>
              <div className="sl-form-row">
                <div className="sl-form-group">
                  <label>Kategori</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="sl-input">
                    {CATEGORIES.filter(c => c !== "Tümü").map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="sl-form-group">
                  <label>Fiyat</label>
                  <input type="number" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="sl-input" />
                </div>
              </div>
              <div className="sl-form-group">
                <label>Açıklama</label>
                <textarea rows="2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="sl-input" />
              </div>
              <div className="sl-modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" }}>
                <button type="button" className="sl-btn-secondary" style={{ padding: "8px 16px", borderRadius: "6px" }} onClick={() => setIsFormOpen(false)}>İptal</button>
                <button type="submit" className="sl-btn-primary" style={{ padding: "8px 16px", borderRadius: "6px" }} disabled={saving}>
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ─── Profil Düzenleme Modalı ─── */}
      {showProfileModal && (
        <div className="sl-custom-modal">
          <div className="sl-modal-backdrop" onClick={() => setShowProfileModal(false)} />
          <div className="sl-modal-content" style={{ maxWidth: 420 }}>
            <div className="sl-modal-header">
              <h3>Bilgileri Düzenle</h3>
              <button className="close-x" onClick={() => setShowProfileModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveProfile}>
              <div className="sl-form-group">
                <label>E-posta</label>
                <input type="email" required className="sl-input"
                  value={profileForm.email}
                  onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} />
              </div>
              <div className="sl-form-group">
                <label>Telefon</label>
                <input type="tel" className="sl-input" placeholder="05XX XXX XX XX"
                  value={profileForm.phone}
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
              </div>
              <div className="sl-modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" }}>
                <button type="button" className="sl-btn-secondary" style={{ padding: "8px 16px", borderRadius: "6px" }}
                  onClick={() => setShowProfileModal(false)}>İptal</button>
                <button type="submit" className="sl-btn-primary" style={{ padding: "8px 16px", borderRadius: "6px" }}
                  disabled={savingProfile}>
                  {savingProfile ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm ─── */}
      {confirmModal.open && (
        <div className="sl-custom-modal">
          <div className="sl-modal-backdrop" onClick={() => setConfirmModal({ open: false, id: null })} />
          <div className="sl-confirm-card">
            <div className="sl-confirm-icon-wrap"><i className="fa-solid fa-trash-can"></i></div>
            <h3>Ürünü Silmek İstiyor Musunuz?</h3>
            <p>Bu işlem geri alınamaz. Ürün menünüzden kalıcı olarak kaldırılacaktır.</p>
            <div className="sl-confirm-actions">
              <button className="sl-btn-cancel" onClick={() => setConfirmModal({ open: false, id: null })}>Vazgeç</button>
              <button className="sl-btn-delete" onClick={() => handleDelete(confirmModal.id)}>Evet, Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerPage;