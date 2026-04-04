import React, { useState } from 'react';

const SellerHome = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Örnek Sipariş Verisi (Scroll test etmek için)
  const dummyOrders = Array(15).fill({
    id: "#ORD-1234",
    customer: "Ahmet Yılmaz",
    price: "₺240",
    status: "Hazırlanıyor",
    date: "Bugün, 14:30"
  });

  return (
    <div className="seller-home-container">
      <div className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-text">
            <h1>Mağaza Özeti</h1>
            <p>Bugün neler olup bitiyor göz atın.</p>
          </div>
          <button className="btn-refresh">Verileri Güncelle</button>
        </header>

        {/* İstatistik Kartları */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>Gelen Siparişler</h3>
              <span className="stat-value">12</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Tamamlananlar</h3>
              <span className="stat-value">48</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🍴</div>
            <div className="stat-info">
              <h3>Aktif Menü Sayısı</h3>
              <span className="stat-value">5</span>
            </div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>Günlük Kazanç</h3>
              <span className="stat-value">₺1,250</span>
            </div>
          </div>
        </div>

        {/* Son Siparişler Alanı */}
        <section className="recent-orders-section">
          <div className="section-header">
            <h2>Son Siparişler</h2>
            <button className="btn-link" onClick={() => setIsModalOpen(true)}>Tümünü Gör</button>
          </div>
          <div className="order-table-container">
            <div className="empty-order-state">
              <p>Sipariş listesi burada listelenecek...</p>
            </div>
          </div>
        </section>
      </div>

      {/* Siparişler Modalı (Sayfaya Entegre) */}
      {isModalOpen && (
        <div className="order-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <h2>Tüm Siparişler</h2>
              <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <div className="order-modal-body">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Sipariş No</th>
                    <th>Müşteri</th>
                    <th>Tutar</th>
                    <th>Durum</th>
                    <th>Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {dummyOrders.map((order, index) => (
                    <tr key={index}>
                      <td>{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{order.price}</td>
                      <td><span className="status-badge">{order.status}</span></td>
                      <td>{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerHome;