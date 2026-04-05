import React, { useState, useEffect, useCallback } from "react";
import BackendDataService from "../services/BackendDataServices";

const STATUS_MAP = {
  new:        "Yeni",
  preparing:  "Hazırlanıyor",
  on_the_way: "Yolda",
  completed:  "Tamamlandı",
  cancelled:  "İptal Edildi"
};

const SellerHome = ({ token, seller }) => {
  const sellerId = seller?.id || seller?._id || "";

  const [notification, setNotification] = useState(null);

  // ── Müşteri talepleri ──────────────────────────────────────────────────────
  const [customerRequests, setCustomerRequests] = useState([]);
  const [selectedRequest,  setSelectedRequest]  = useState(null);
  const [offerPrice,       setOfferPrice]        = useState("");
  const [offerMessage,     setOfferMessage]      = useState("");

  // Verilmiş teklifler (sayfa yenilemede kalıcı) localStorage
  const [submittedOffers, setSubmittedOffers] = useState(() => {
    try { return JSON.parse(localStorage.getItem("savora_submitted_" + sellerId) || "[]"); }
    catch { return []; }
  });

  // ── Siparişler ────────────────────────────────────────────────────────────
  const [activeOrders,  setActiveOrders]  = useState([]);
  const [orderHistory,  setOrderHistory]  = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState("Hepsi");

  // ── Veri çekme ────────────────────────────────────────────────────────────
  const fetchOffers = useCallback(async () => {
    try {
      const res = await BackendDataService.getOpenOffers(token);
      setCustomerRequests(res.data);
    } catch {}
  }, [token]);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await BackendDataService.getSellerOrders(token);
      const all = res.data;
      setActiveOrders(all.filter(o => o.status !== "completed" && o.status !== "cancelled"));
      setOrderHistory(all.filter(o => o.status === "completed"  || o.status === "cancelled"));
    } catch {}
  }, [token]);

  useEffect(() => {
    fetchOffers();
    fetchOrders();
    const offerInterval = setInterval(fetchOffers, 15000);
    const orderInterval = setInterval(fetchOrders, 15000);
    return () => { clearInterval(offerInterval); clearInterval(orderInterval); };
  }, [fetchOffers, fetchOrders]);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(t);
  }, [notification]);

  // ── Teklif gönder ─────────────────────────────────────────────────────────
  const sendOffer = async () => {
    if (!offerPrice) { setNotification("Lütfen bir fiyat giriniz!"); return; }
    try {
      await BackendDataService.addRestaurantOffer(
        selectedRequest._id,
        { price: Number(offerPrice), message: offerMessage },
        token
      );
      const updated = [...submittedOffers, selectedRequest._id];
      setSubmittedOffers(updated);
      localStorage.setItem("savora_submitted_" + sellerId, JSON.stringify(updated));
      setNotification(`"${selectedRequest.menuRequest?.title}" için ₺${offerPrice} teklifiniz iletildi.`);
      setSelectedRequest(null);
      setOfferPrice("");
      setOfferMessage("");
    } catch {
      setNotification("Teklif gönderilemedi.");
    }
  };

  // ── Sipariş durumu güncelle ───────────────────────────────────────────────
  const updateStatus = async (orderId, newStatus) => {
    try {
      await BackendDataService.updateOrderStatus(orderId, { status: newStatus }, token);
      await fetchOrders();
      setNotification("Sipariş durumu güncellendi.");
      if (newStatus === "completed" || newStatus === "cancelled") {
        setSelectedOrder(null);
        setIsListModalOpen(false);
      } else {
        setSelectedOrder(prev => prev?._id === orderId ? { ...prev, status: newStatus } : prev);
      }
    } catch (err) {
      setNotification("Durum güncellenemedi: " + (err.response?.data?.message || "Hata"));
    }
  };

  // ── Kazanç hesabı ─────────────────────────────────────────────────────────
  const dailyEarnings = (() => {
    const today = new Date().toDateString();
    return orderHistory
      .filter(o => o.status === "completed" && new Date(o.createdAt).toDateString() === today)
      .reduce((total, o) => total + (o.menu || []).reduce((s, m) => s + (m.productId?.price || 0), 0), 0);
  })();

  const filteredHistory = historyFilter === "Hepsi"
    ? orderHistory
    : orderHistory.filter(o =>
        historyFilter === "Tamamlandı" ? o.status === "completed" : o.status === "cancelled"
      );

  return (
    <div className="seller-home-container">
      {notification && (
        <div className="seller-toast-container">
          <div className="seller-toast-content"><span>✅</span> {notification}</div>
        </div>
      )}

      <div className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-text">
            <h1>{seller?.restaurantName || "Mağaza"} Özeti</h1>
            <p className="day-info">
              Sistem Tarihi: {new Date().toLocaleDateString("tr-TR")} | Kazanç Periyodu: Bugün
            </p>
          </div>
        </header>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { icon: "🔔", label: "Yeni Siparişler",  value: activeOrders.filter(o => o.status === "new").length,       onClick: () => setIsListModalOpen(true) },
            { icon: "👨‍🍳", label: "Hazırlanıyor",    value: activeOrders.filter(o => o.status === "preparing").length },
            { icon: "✅", label: "Toplam Arşiv",     value: orderHistory.length },
            { icon: "💰", label: "Günlük Kazanç",    value: `₺${dailyEarnings}`, highlight: true }
          ].map(({ icon, label, value, onClick, highlight }) => (
            <div key={label} className={`stat-card ${highlight ? "highlight" : ""}`}
              onClick={onClick} style={onClick ? { cursor: "pointer" } : {}}>
              <div className="stat-icon">{icon}</div>
              <div className="stat-info"><h3>{label}</h3><span className="stat-value">{value}</span></div>
            </div>
          ))}
        </div>

        {/* Müşteri Talepleri */}
        <section className="customer-requests-section">
          <div className="section-header">
            <h2>Müşteri Talepleri <small style={{ fontSize: "0.6em", color: "#ffc107" }}>● 15sn</small></h2>
          </div>
          <div className="request-scroll-area">
            {customerRequests.length > 0 ? customerRequests.map(req => (
              <div key={req._id} className="request-card-item">
                <div className="request-info">
                  <h4>{req.menuRequest?.title || "Talep"}</h4>
                  <p className="request-details">"{req.menuRequest?.description}"</p>
                  <span className="request-location">📂 {req.menuRequest?.category || "Genel"}</span>
                </div>
                {submittedOffers.includes(req._id) ? (
                  <span style={{
                    background: "#d4edda", color: "#155724",
                    padding: "6px 14px", borderRadius: "20px",
                    fontSize: "0.82rem", fontWeight: 600
                  }}>✓ Teklif Verildi</span>
                ) : (
                  <button className="btn-give-offer" onClick={() => setSelectedRequest(req)}>Teklif Ver</button>
                )}
              </div>
            )) : <p className="empty-text">Şu an yeni bir talep bulunmuyor.</p>}
          </div>
        </section>

        {/* Aktif Siparişler */}
        <section className="recent-orders-section">
          <div className="section-header">
            <h2>Aktif İşlemler</h2>
            <button className="btn-link" onClick={() => setIsListModalOpen(true)}>Tümünü Gör</button>
          </div>
          <div className="order-list-mini">
            {activeOrders.length > 0 ? activeOrders.map(order => (
              <div key={order._id} className="order-item-mini" onClick={() => setSelectedOrder(order)}>
                <div className="order-main-info">
                  <span className="order-id-tag">#{order._id.slice(-6).toUpperCase()}</span>
                  <span className="order-cust-name">{order.userId?.name || "Müşteri"}</span>
                </div>
                <div className="order-meta-info">
                  <span className="status-badge" data-status={order.status}>
                    {STATUS_MAP[order.status] || order.status}
                  </span>
                </div>
              </div>
            )) : <p className="empty-text">Aktif sipariş bulunmuyor.</p>}
          </div>
        </section>

        {/* Arşiv */}
        <section className="history-section">
          <div className="section-header">
            <h2>Sipariş Arşivi</h2>
            <div className="history-filters">
              {["Hepsi", "Tamamlandı", "İptal Edildi"].map(f => (
                <button key={f} className={historyFilter === f ? "active" : ""}
                  onClick={() => setHistoryFilter(f)}>{f}</button>
              ))}
            </div>
          </div>
          <div className="history-table-container">
            <table className="history-table">
              <thead><tr><th>Tarih</th><th>ID</th><th>Müşteri</th><th>Durum</th></tr></thead>
              <tbody>
                {filteredHistory.map(o => (
                  <tr key={o._id}>
                    <td>{new Date(o.createdAt).toLocaleDateString("tr-TR")}</td>
                    <td>#{o._id.slice(-6).toUpperCase()}</td>
                    <td>{o.userId?.name || "—"}</td>
                    <td><span className="status-badge" data-status={o.status}>{STATUS_MAP[o.status]}</span></td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr><td colSpan="4" className="text-center text-muted py-3">Kayıt bulunamadı.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ─── Teklif Modalı ─── */}
      {selectedRequest && (
        <div className="order-modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="order-modal-content offer-modal-styled" onClick={e => e.stopPropagation()}>
            <div className="offer-header-gradient">
              <button className="close-modal-btn" onClick={() => setSelectedRequest(null)}>×</button>
              <h2>Teklif Oluştur</h2>
              <div className="customer-info-badge">
                <div className="cust-avatar">{selectedRequest.menuRequest?.title?.charAt(0) || "T"}</div>
                <div>
                  <div style={{ fontWeight: "600" }}>{selectedRequest.menuRequest?.title}</div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>📂 {selectedRequest.menuRequest?.category || "Genel"}</div>
                </div>
              </div>
            </div>
            <div className="request-content-box">
              <div className="request-quote-card">
                <span className="request-text-display">"{selectedRequest.menuRequest?.description}"</span>
              </div>
              <div className="offer-form-elements">
                <label style={{ fontWeight: "700", color: "#2d5a47", marginBottom: "6px", display: "block" }}>Mesajınız (opsiyonel)</label>
                <input type="text" className="form-control mb-3" placeholder="Kısa bir not..."
                  value={offerMessage} onChange={e => setOfferMessage(e.target.value)} />
                <label style={{ fontWeight: "700", color: "#2d5a47", marginBottom: "10px", display: "block" }}>Fiyat Teklifiniz</label>
                <div className="price-input-wrapper">
                  <span className="currency-symbol">₺</span>
                  <input type="number" className="modern-price-input" placeholder="0.00" autoFocus
                    value={offerPrice} onChange={e => setOfferPrice(e.target.value)} />
                </div>
                <button className="btn-send-offer-modern" onClick={sendOffer}>Teklifi Müşteriye Gönder</button>
                <p className="text-center text-muted mt-3 mb-0" style={{ fontSize: "0.75rem" }}>
                  Teklifiniz müşterinin ekranında anlık olarak görünecektir.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Liste Modalı ─── */}
      {isListModalOpen && (
        <div className="order-modal-overlay" onClick={() => setIsListModalOpen(false)}>
          <div className="order-modal-content list-modal" onClick={e => e.stopPropagation()}>
            <div className="order-modal-header">
              <h2>Tüm Aktif Siparişler</h2>
              <button className="close-modal-btn" onClick={() => setIsListModalOpen(false)}>×</button>
            </div>
            <div className="order-modal-body">
              <table className="orders-table">
                <thead><tr><th>ID</th><th>Müşteri</th><th>Durum</th><th>İşlem</th></tr></thead>
                <tbody>
                  {activeOrders.map(o => (
                    <tr key={o._id} onClick={() => { setSelectedOrder(o); setIsListModalOpen(false); }} className="clickable-row">
                      <td>#{o._id.slice(-6).toUpperCase()}</td>
                      <td>{o.userId?.name || "—"}</td>
                      <td><span className="status-badge" data-status={o.status}>{STATUS_MAP[o.status]}</span></td>
                      <td><button className="btn-detail-view">Detay</button></td>
                    </tr>
                  ))}
                  {activeOrders.length === 0 && <tr><td colSpan="4" className="text-center text-muted py-3">Aktif sipariş yok.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── Detay Modalı ─── */}
      {selectedOrder && (
        <div className="order-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal-content detail-modal" onClick={e => e.stopPropagation()}>
            <div className="order-modal-header">
              <h2>Sipariş: <span className="order-id-highlight">#{selectedOrder._id.slice(-6).toUpperCase()}</span></h2>
              <button className="close-modal-btn" onClick={() => setSelectedOrder(null)}>×</button>
            </div>
            <div className="order-modal-body detail-body">
              {/* Müşteri bilgisi */}
              <div className="detail-section">
                <div className="section-title-bar"><span className="section-icon">👤</span><h4>Müşteri</h4></div>
                <div className="info-grid">
                  <div className="info-row">
                    <span className="info-label">Ad Soyad:</span>
                    <span className="info-data">{selectedOrder.userId?.name || "—"}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Telefon:</span>
                    <span className="info-data">{selectedOrder.userId?.phone || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Sipariş içeriği */}
              <div className="detail-section">
                <div className="section-title-bar"><span className="section-icon">🛍️</span><h4>Sipariş İçeriği</h4></div>
                {selectedOrder.menu && selectedOrder.menu.length > 0 ? (
                  <ul className="items-list-enhanced">
                    {selectedOrder.menu.map((item, i) => (
                      <li key={i}>
                        {item.productId?.name || "Ürün"} × {item.quantity}
                        {item.productId?.price ? ` — ₺${item.productId.price}` : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ padding: "8px 0" }}>
                    <strong>Ne yemek istiyorsunuz?</strong>
                    <p className="text-muted small mt-1">{selectedOrder.note || "Özel talep"}</p>
                  </div>
                )}
              </div>

              {/* Durum aksiyonları */}
              <div className="detail-footer">
                <div className="detail-actions-enhanced">
                  {selectedOrder.status === "new" && (
                    <>
                      <button className="btn-action-enhanced approve"
                        onClick={() => updateStatus(selectedOrder._id, "preparing")}>
                        Onayla / Hazırlanıyor
                      </button>
                      <button className="btn-action-enhanced cancel"
                        onClick={() => updateStatus(selectedOrder._id, "cancelled")}>
                        İptal Et
                      </button>
                    </>
                  )}
                  {selectedOrder.status === "preparing" && (
                    <button className="btn-action-enhanced shipping"
                      onClick={() => updateStatus(selectedOrder._id, "on_the_way")}>
                      Yola Çıkart
                    </button>
                  )}
                  {selectedOrder.status === "on_the_way" && (
                    <button className="btn-action-enhanced delivered"
                      onClick={() => updateStatus(selectedOrder._id, "completed")}>
                      Teslim Edildi
                    </button>
                  )}
                  {selectedOrder.status === "completed"  && <div className="success-status-msg">✅ Teslimat Tamamlandı.</div>}
                  {selectedOrder.status === "cancelled"  && <div className="error-status-msg">❌ Bu sipariş iptal edildi.</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerHome;