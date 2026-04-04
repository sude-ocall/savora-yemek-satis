import React, { useState, useEffect } from 'react';

const SellerHome = () => {
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [historyFilter, setHistoryFilter] = useState("Hepsi");

  // Sistem tarihini "YYYY-MM-DD" formatında alalım
  const todayStr = new Date().toISOString().split('T')[0];

  // --- AKTİF SİPARİŞLER ---
  const [orders, setOrders] = useState([
    { 
      id: "#ORD-5501", 
      customer: "Ali Mutlu", 
      price: "180", 
      status: "Yeni Sipariş", 
      items: ["1x Pizza Marguerita", "1x Kola"], 
      phone: "0532 000 00 00", 
      address: "Antalya, Muratpaşa", 
      date: todayStr 
    },
    { 
      id: "#ORD-5502", 
      customer: "Zeynep Kaya", 
      price: "320", 
      status: "Hazırlanıyor", 
      items: ["2x Burger Menü"], 
      phone: "0533 111 22 33", 
      address: "Konyaaltı, Liman", 
      date: todayStr 
    },
    { 
      id: "#ORD-5503", 
      customer: "Can Demir", 
      price: "95", 
      status: "Teslim Edildi", 
      items: ["1x Lahmacun"], 
      phone: "0544 555 44 33", 
      address: "Lara, Fener", 
      date: todayStr 
    }
  ]);

  // --- ARŞİVLENMİŞ SİPARİŞLER ---
  const [orderHistory, setOrderHistory] = useState([
    { id: "#ORD-5480", customer: "Mehmet Öz", price: "450", status: "Tamamlanan", date: "2026-04-03", items: ["3x Kebap"] },
    { id: "#ORD-5475", customer: "Ayşe Demir", price: "120", status: "İptal Edildi", date: "2026-04-02", items: ["2x Pide"] }
  ]);

  // --- GÜNLÜK KAZANÇ HESAPLAMA ---
  // Sadece bugünün tarihine sahip VE (Teslim Edildi veya Tamamlanan) olanları toplar
  const calculateDailyEarnings = () => {
    const activeDelivered = orders
      .filter(o => o.date === todayStr && o.status === "Teslim Edildi")
      .reduce((acc, curr) => acc + parseFloat(curr.price), 0);

    const archivedToday = orderHistory
      .filter(o => o.date === todayStr && o.status === "Tamamlanan")
      .reduce((acc, curr) => acc + parseFloat(curr.price), 0);

    return activeDelivered + archivedToday;
  };

  // --- OTOMATİK GÜN SONU MANTIĞI ---
  useEffect(() => {
    const checkTime = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 23 && now.getMinutes() === 59 && now.getSeconds() >= 55) {
        handleDayEndCleanup();
      }
    }, 5000); 
    return () => clearInterval(checkTime);
  }, [orders]);

  const handleDayEndCleanup = () => {
    const deliveredOrders = orders.filter(o => o.status === "Teslim Edildi");
    if (deliveredOrders.length > 0) {
      const completedOnes = deliveredOrders.map(o => ({ ...o, status: "Tamamlanan" }));
      setOrderHistory(prev => [...completedOnes, ...prev]);
      setOrders(prev => prev.filter(o => o.status !== "Teslim Edildi"));
    }
  };

  const updateStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    }
  };

  const filteredHistory = orderHistory.filter(order => {
    if (historyFilter === "Hepsi") return true;
    return order.status === historyFilter;
  });

  return (
    <div className="seller-home-container">
      <div className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-text">
            <h1>Mağaza Özeti</h1>
            <p className="day-info">
              Sistem Tarihi: {new Date().toLocaleDateString('tr-TR')} | 
              Kazanç Periyodu: Bugün
            </p>
          </div>
        </header>

        <div className="stats-grid">
          <div className="stat-card" onClick={() => setIsListModalOpen(true)} style={{cursor: 'pointer'}}>
            <div className="stat-icon">🔔</div>
            <div className="stat-info">
              <h3>Yeni Siparişler</h3>
              <span className="stat-value">{orders.filter(o => o.status === "Yeni Sipariş").length}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👨‍🍳</div>
            <div className="stat-info">
              <h3>Hazırlanıyor</h3>
              <span className="stat-value">{orders.filter(o => o.status === "Hazırlanıyor").length}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Toplam Arşiv</h3>
              <span className="stat-value">{orderHistory.length}</span>
            </div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>Günlük Kazanç</h3>
              <span className="stat-value">₺{calculateDailyEarnings()}</span>
            </div>
          </div>
        </div>

        <section className="recent-orders-section">
          <div className="section-header">
            <h2>Aktif İşlemler</h2>
            <button className="btn-link" onClick={() => setIsListModalOpen(true)}>Tümünü Gör</button>
          </div>
          <div className="order-list-mini">
            {orders.length > 0 ? orders.map((order) => (
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

        <section className="history-section">
          <div className="section-header">
            <h2>Sipariş Arşivi</h2>
            <div className="history-filters">
              <button className={historyFilter === "Hepsi" ? "active" : ""} onClick={() => setHistoryFilter("Hepsi")}>Hepsi</button>
              <button className={historyFilter === "Tamamlanan" ? "active" : ""} onClick={() => setHistoryFilter("Tamamlanan")}>Tamamlananlar</button>
              <button className={historyFilter === "İptal Edildi" ? "active" : ""} onClick={() => setHistoryFilter("İptal Edildi")}>İptaller</button>
            </div>
          </div>
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>ID</th>
                  <th>Müşteri</th>
                  <th>Tutar</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map(h => (
                  <tr key={h.id}>
                    <td>{h.date}</td>
                    <td>{h.id}</td>
                    <td>{h.customer}</td>
                    <td>₺{h.price}</td>
                    <td><span className="status-badge" data-status={h.status}>{h.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* MODAL 1: Tüm Aktif Liste */}
      {isListModalOpen && (
        <div className="order-modal-overlay" onClick={() => setIsListModalOpen(false)}>
          <div className="order-modal-content list-modal" onClick={e => e.stopPropagation()}>
            <div className="order-modal-header">
              <h2>Tüm Aktif Siparişler</h2>
              <button className="close-modal-btn" onClick={() => setIsListModalOpen(false)}>×</button>
            </div>
            <div className="order-modal-body">
              <table className="orders-table">
                <thead>
                  <tr><th>ID</th><th>Müşteri</th><th>Durum</th><th>İşlem</th></tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} onClick={() => {setSelectedOrder(o); setIsListModalOpen(false)}} className="clickable-row">
                      <td>{o.id}</td>
                      <td>{o.customer}</td>
                      <td><span className="status-badge" data-status={o.status}>{o.status}</span></td>
                      <td><button className="btn-detail-view">Detay</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Detay ve Yönetim */}
      {selectedOrder && (
        <div className="order-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal-content detail-modal" onClick={e => e.stopPropagation()}>
            <div className="order-modal-header">
              <h2>Sipariş Detayı: <span className="order-id-highlight">{selectedOrder.id}</span></h2>
              <button className="close-modal-btn" onClick={() => setSelectedOrder(null)}>×</button>
            </div>
            <div className="order-modal-body detail-body">
              <div className="detail-section">
                <div className="section-title-bar">
                  <span className="section-icon">👤</span>
                  <h4>Müşteri & Teslimat</h4>
                </div>
                <div className="info-grid">
                  <div className="info-row"><span className="info-label">Ad Soyad:</span> <span className="info-data">{selectedOrder.customer}</span></div>
                  <div className="info-row"><span className="info-label">Telefon:</span> <span className="info-data">{selectedOrder.phone}</span></div>
                  <div className="info-row"><span className="info-label">Adres:</span> <span className="info-data address-data">{selectedOrder.address}</span></div>
                </div>
              </div>

              <div className="detail-section">
                <div className="section-title-bar">
                  <span className="section-icon">🛍️</span>
                  <h4>Sipariş İçeriği</h4>
                </div>
                <ul className="items-list-enhanced">
                  {selectedOrder.items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
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
                  {selectedOrder.status === "Tamamlanan" && <div className="success-status-msg">📁 Bu sipariş arşivlendi.</div>}
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