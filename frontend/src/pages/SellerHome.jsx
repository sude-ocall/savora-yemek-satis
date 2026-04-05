import React, { useState, useEffect } from "react";
import BackendDataService from "../services/BackendDataServices";

const SellerHome = ({ token, seller }) => {
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder]     = useState(null);
  const [historyFilter, setHistoryFilter]     = useState("Hepsi");
  const [notification, setNotification]       = useState(null);

  const [customerRequests, setCustomerRequests] = useState([]);
  const [selectedRequest, setSelectedRequest]   = useState(null);
  const [offerPrice, setOfferPrice]             = useState("");
  const [offerMessage, setOfferMessage]         = useState("");

  // Siparişler: backend'de satıcıya özel GET endpoint olmadığından yerel tutulur.
  // Gerçek siparişler için backend'e GET /api/orders/seller eklenmesi gerekir.
  const [orders, setOrders]           = useState([]);
  const [orderHistory]                = useState([]);

  // Fetch open offers (customer requests) on mount + every 10s
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await BackendDataService.getOpenOffers(token);
        setCustomerRequests(res.data);
      } catch (err) {
        console.error("Talepler yüklenemedi:", err);
      }
    };
    fetchOffers();
    const interval = setInterval(fetchOffers, 10000);
    return () => clearInterval(interval);
  }, [token]);

  // Notification auto-dismiss
  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(t);
  }, [notification]);

  const sendOffer = async () => {
    if (!offerPrice) { setNotification("Lütfen bir fiyat giriniz!"); return; }
    try {
      await BackendDataService.addRestaurantOffer(
        selectedRequest._id,
        { price: Number(offerPrice), message: offerMessage },
        token
      );
      setNotification(`"${selectedRequest.menuRequest?.title}" için ₺${offerPrice} teklifiniz iletildi.`);
      setCustomerRequests(prev => prev.filter(r => r._id !== selectedRequest._id));
      setSelectedRequest(null);
      setOfferPrice("");
      setOfferMessage("");
    } catch {
      setNotification("Teklif gönderilemedi.");
    }
  };

  const updateStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    setNotification(`Sipariş durumu: ${newStatus}`);
  };

  const calculateDailyEarnings = () =>
    orders.filter(o => o.status === "Teslim Edildi").reduce((acc, o) => acc + parseFloat(o.price), 0);

  const filteredHistory = orderHistory.filter(o => historyFilter === "Hepsi" || o.status === historyFilter);

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
            { icon: "🔔", label: "Yeni Siparişler", value: orders.filter(o => o.status === "Yeni Sipariş").length, onClick: () => setIsListModalOpen(true) },
            { icon: "👨‍🍳", label: "Hazırlanıyor", value: orders.filter(o => o.status === "Hazırlanıyor").length },
            { icon: "✅", label: "Toplam Arşiv", value: orderHistory.length },
            { icon: "💰", label: "Günlük Kazanç", value: `₺${calculateDailyEarnings()}`, highlight: true }
          ].map(({ icon, label, value, onClick, highlight }) => (
            <div key={label} className={`stat-card ${highlight ? "highlight" : ""}`} onClick={onClick} style={onClick ? { cursor: "pointer" } : {}}>
              <div className="stat-icon">{icon}</div>
              <div className="stat-info"><h3>{label}</h3><span className="stat-value">{value}</span></div>
            </div>
          ))}
        </div>

        {/* Customer Requests */}
        <section className="customer-requests-section">
          <div className="section-header">
            <h2>Müşteri Talepleri <small style={{ fontSize: "0.6em", color: "#ffc107" }}>● Canlı</small></h2>
          </div>
          <div className="request-scroll-area">
            {customerRequests.length > 0 ? customerRequests.map(req => (
              <div key={req._id} className="request-card-item">
                <div className="request-info">
                  <h4>{req.menuRequest?.title || "Talep"}</h4>
                  <p className="request-details">"{req.menuRequest?.description}"</p>
                  <span className="request-location">📂 {req.menuRequest?.category || "Genel"}</span>
                </div>
                <button className="btn-give-offer" onClick={() => setSelectedRequest(req)}>Teklif Ver</button>
              </div>
            )) : <p className="empty-text">Şu an yeni bir talep bulunmuyor.</p>}
          </div>
        </section>

        {/* Active Orders */}
        <section className="recent-orders-section">
          <div className="section-header">
            <h2>Aktif İşlemler</h2>
            <button className="btn-link" onClick={() => setIsListModalOpen(true)}>Tümünü Gör</button>
          </div>
          <div className="order-list-mini">
            {orders.length > 0 ? orders.map(order => (
              <div key={order.id} className="order-item-mini" onClick={() => setSelectedOrder(order)}>
                <div className="order-main-info">
                  <span className="order-id-tag">{order.id}</span>
                  <span className="order-cust-name">{order.customer}</span>
                </div>
                <div className="order-meta-info">
                  <span className="status-badge" data-status={order.status}>{order.status}</span>
                  <span className="order-price-text">₺{order.price}</span>
                </div>
              </div>
            )) : <p className="empty-text">Aktif sipariş bulunmuyor.</p>}
          </div>
        </section>

        {/* Order History */}
        <section className="history-section">
          <div className="section-header">
            <h2>Sipariş Arşivi</h2>
            <div className="history-filters">
              {["Hepsi", "Tamamlanan", "İptal Edildi"].map(f => (
                <button key={f} className={historyFilter === f ? "active" : ""} onClick={() => setHistoryFilter(f)}>{f}</button>
              ))}
            </div>
          </div>
          <div className="history-table-container">
            <table className="history-table">
              <thead><tr><th>Tarih</th><th>ID</th><th>Müşteri</th><th>Tutar</th><th>Durum</th></tr></thead>
              <tbody>
                {filteredHistory.map(h => (
                  <tr key={h.id}>
                    <td>{h.date}</td><td>{h.id}</td><td>{h.customer}</td>
                    <td>₺{h.price}</td>
                    <td><span className="status-badge" data-status={h.status}>{h.status}</span></td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr><td colSpan="5" className="text-center text-muted py-3">Kayıt bulunamadı.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ─── Offer Modal ─── */}
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
                <input type="text" className="form-control mb-3" placeholder="Kısa bir not..." value={offerMessage} onChange={e => setOfferMessage(e.target.value)} />
                <label style={{ fontWeight: "700", color: "#2d5a47", marginBottom: "10px", display: "block" }}>Fiyat Teklifiniz</label>
                <div className="price-input-wrapper">
                  <span className="currency-symbol">₺</span>
                  <input type="number" className="modern-price-input" placeholder="0.00" autoFocus value={offerPrice} onChange={e => setOfferPrice(e.target.value)} />
                </div>
                <button className="btn-send-offer-modern" onClick={sendOffer}>Teklifi Müşteriye Gönder</button>
                <p className="text-center text-muted mt-3 mb-0" style={{ fontSize: "0.75rem" }}>Teklifiniz müşterinin ekranında anlık olarak görünecektir.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── List Modal ─── */}
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
                  {orders.map(o => (
                    <tr key={o.id} onClick={() => { setSelectedOrder(o); setIsListModalOpen(false); }} className="clickable-row">
                      <td>{o.id}</td><td>{o.customer}</td>
                      <td><span className="status-badge" data-status={o.status}>{o.status}</span></td>
                      <td><button className="btn-detail-view">Detay</button></td>
                    </tr>
                  ))}
                  {orders.length === 0 && <tr><td colSpan="4" className="text-center text-muted py-3">Aktif sipariş yok.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── Detail Modal ─── */}
      {selectedOrder && (
        <div className="order-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal-content detail-modal" onClick={e => e.stopPropagation()}>
            <div className="order-modal-header">
              <h2>Sipariş Detayı: <span className="order-id-highlight">{selectedOrder.id}</span></h2>
              <button className="close-modal-btn" onClick={() => setSelectedOrder(null)}>×</button>
            </div>
            <div className="order-modal-body detail-body">
              <div className="detail-section">
                <div className="section-title-bar"><span className="section-icon">👤</span><h4>Müşteri & Teslimat</h4></div>
                <div className="info-grid">
                  <div className="info-row"><span className="info-label">Ad Soyad:</span> <span className="info-data">{selectedOrder.customer}</span></div>
                  <div className="info-row"><span className="info-label">Telefon:</span> <span className="info-data">{selectedOrder.phone}</span></div>
                  <div className="info-row"><span className="info-label">Adres:</span> <span className="info-data address-data">{selectedOrder.address}</span></div>
                </div>
              </div>
              <div className="detail-section">
                <div className="section-title-bar"><span className="section-icon">🛍️</span><h4>Sipariş İçeriği</h4></div>
                <ul className="items-list-enhanced">{selectedOrder.items?.map((item, i) => <li key={i}>{item}</li>)}</ul>
              </div>
              <div className="detail-footer">
                <div className="total-price-enhanced">
                  <span className="total-label">Toplam:</span>
                  <span className="total-value">₺{selectedOrder.price}</span>
                </div>
                <div className="detail-actions-enhanced">
                  {selectedOrder.status === "Yeni Sipariş" && (
                    <>
                      <button className="btn-action-enhanced approve" onClick={() => updateStatus(selectedOrder.id, "Hazırlanıyor")}>Onayla</button>
                      <button className="btn-action-enhanced cancel" onClick={() => updateStatus(selectedOrder.id, "İptal Edildi")}>İptal Et</button>
                    </>
                  )}
                  {selectedOrder.status === "Hazırlanıyor" && (
                    <button className="btn-action-enhanced shipping" onClick={() => updateStatus(selectedOrder.id, "Yola Çıktı")}>Yola Çıkart</button>
                  )}
                  {selectedOrder.status === "Yola Çıktı" && (
                    <button className="btn-action-enhanced delivered" onClick={() => updateStatus(selectedOrder.id, "Teslim Edildi")}>Teslim Edildi İşaretle</button>
                  )}
                  {selectedOrder.status === "Teslim Edildi" && <div className="success-status-msg">✅ Teslimat Tamamlandı.</div>}
                  {selectedOrder.status === "İptal Edildi" && <div className="error-status-msg">❌ Bu sipariş iptal edildi.</div>}
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