import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import burgerImg from "../assets/burger.png";
import pizzaImg from "../assets/pizza.png";
import pastaImg from "../assets/pasta.png";

const HomePage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  
  // MODAL VE SİPARİŞ STATE'LERİ
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // BİLDİRİM (TOAST) STATE'İ
  const [notification, setNotification] = useState(null);

  const [activeOrders, setActiveOrders] = useState([
    {
      id: "ORD-742",
      status: "Yeni Sipariş",
      restaurant: "Burger Dünyası",
      items: [{ name: "Savora Gurme Burger", price: 220 }],
      total: 220,
      date: "Bugün, 14:20"
    },
    {
      id: "ORD-855",
      status: "Hazırlanıyor",
      restaurant: "Pizza Locale",
      items: [{ name: "İtalyan Margherita", price: 180 }],
      total: 180,
      date: "Bugün, 13:45"
    },
    {
        id: "ORD-999",
        status: "Yolda",
        restaurant: "Pasta House",
        items: [{ name: "Kremalı Fettuccine", price: 195 }],
        total: 195,
        date: "Bugün, 13:30"
      }
  ]);

  const menuItems = [
    { id: 1, name: "Savora Gurme Burger", seller: "Burger Dünyası", rating: 4.8, description: "Ateş ızgarasında pişmiş dana köfte, karamelize soğan.", price: 220, image: burgerImg },
    { id: 2, name: "İtalyan Margherita", seller: "Pizza Locale", rating: 4.5, description: "Orijinal İtalyan tarifiyle odun ateşinde pişirilmiş.", price: 180, image: pizzaImg },
    { id: 3, name: "Kremalı Fettuccine Alfredo", seller: "Pasta House", rating: 4.9, description: "Özel krema sosu, parmesan peyniri parçaları.", price: 195, image: pastaImg }
  ];

  // Sepete ekleme fonksiyonu (Bildirim tetikleyicili)
  const addToCart = (item) => {
    setCart([...cart, item]);
    setNotification(`${item.name} sepete eklendi!`);
  };

  // Bildirimi 3 saniye sonra otomatik kapatma
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const confirmCancel = () => {
    setActiveOrders(activeOrders.filter(o => o.id !== selectedOrder.id));
    setShowConfirmModal(false);
    setSelectedOrder(null);
    setNotification("Sipariş iptal edildi.");
  };

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.seller.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = cart.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="home-page-container container py-4">
      
      {/* 0. DİNAMİK BİLDİRİM (TOAST) */}
      {notification && (
        <div className="toast-notification">
          <div className="toast-content">
            <span className="toast-icon">✅</span>
            {notification}
          </div>
        </div>
      )}

      {/* 1. AKTİF SİPARİŞLER */}
      {activeOrders.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="active-orders-banner shadow-sm">
              <div className="d-flex align-items-center mb-3">
                <div className="pulse-indicator me-2"></div>
                <h5 className="m-0 fw-bold">Aktif Siparişleriniz</h5>
              </div>
              
              <div className="order-vertical-scroll">
                {activeOrders.map((order) => (
                  <div key={order.id} className="mini-order-card vertical mb-2" onClick={() => setSelectedOrder(order)}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex flex-column">
                        <span className="order-number">#{order.id}</span>
                        <small className="text-muted">{order.restaurant}</small>
                      </div>
                      <span className={`status-pill ${order.status === 'Yeni Sipariş' ? 'status-new' : 'status-pro'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ARAMA ÇUBUĞU */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="search-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Ürün veya restoran ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>
      </div>

      <div className="row mb-5">
        {/* SOL: MENÜ */}
        <div className="col-md-8">
          <h2 className="section-title mb-4">Günün Menüsü</h2>
          <div className="menu-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="menu-card">
                <div className="card-image"><img src={item.image} alt={item.name} /></div>
                <div className="card-info">
                  <div className="seller-info">
                    <span className="seller-name">{item.seller}</span>
                    <span className="seller-rating">⭐ {item.rating}</span>
                  </div>
                  <h3>{item.name}</h3>
                  <div className="card-footer">
                    <span className="price">{item.price} ₺</span>
                    <button className="btn-add-cart" onClick={() => addToCart(item)}>Ekle</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SAĞ: SEPET */}
        <div className="col-md-4">
          <div className="cart-sidebar">
            <h3>Sepetiniz</h3>
            <hr />
            {cart.length === 0 ? <p className="text-muted text-center py-4">Boş</p> : (
              <div className="cart-items">
                {cart.map((item, index) => (
                  <div key={index} className="cart-item-row">
                    <span>{item.name}</span>
                    <strong>{item.price} ₺</strong>
                  </div>
                ))}
              </div>
            )}
            <div className="cart-total mt-4">
              <div className="d-flex justify-content-between fw-bold"><span>Toplam:</span><span>{totalAmount} ₺</span></div>
              <button className="btn-checkout mt-3 w-100" disabled={cart.length === 0} onClick={() => navigate("/payment", { state: { amount: totalAmount } })}>Ödemeye Geç</button>
            </div>
          </div>
        </div>
      </div>

      {/* DETAY MODAL */}
      {selectedOrder && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-card">
            <div className="modal-header-styled">
              <div><h4 className="fw-bold m-0">Sipariş Detayı</h4><span className="text-muted">#{selectedOrder.id}</span></div>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>&times;</button>
            </div>
            <div className="modal-body-styled">
              <div className="restaurant-info-box"><small>Restoran</small><h5>{selectedOrder.restaurant}</h5></div>
              <div className="d-flex justify-content-between my-3">
                <div><small className="d-block text-muted">DURUM</small><strong>{selectedOrder.status}</strong></div>
                <div className="text-end"><small className="d-block text-muted">TARİH</small><strong>{selectedOrder.date}</strong></div>
              </div>
              <hr />
              <div className="modal-item-list">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="d-flex justify-content-between"><span>{item.name}</span><span>{item.price} ₺</span></div>
                ))}
              </div>
            </div>
            <div className="modal-footer-styled mt-4 d-flex gap-2">
              {selectedOrder.status === "Yeni Sipariş" && (
                <button className="btn btn-outline-danger flex-grow-1" onClick={() => setShowConfirmModal(true)}>İptal Et</button>
              )}
              <button className="btn btn-dark flex-grow-1" onClick={() => setSelectedOrder(null)}>Kapat</button>
            </div>
          </div>
        </div>
      )}

      {/* ONAY MODAL */}
      {showConfirmModal && (
        <div className="custom-modal-overlay overlay-top">
          <div className="confirm-card text-center p-4 bg-white rounded shadow-lg">
            <h4 className="fw-bold">Emin misiniz?</h4>
            <p className="text-muted">Siparişiniz iptal edilecektir.</p>
            <div className="d-flex gap-2 mt-4">
              <button className="btn btn-light flex-grow-1" onClick={() => setShowConfirmModal(false)}>Vazgeç</button>
              <button className="btn btn-danger flex-grow-1" onClick={confirmCancel}>Evet, İptal Et</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;