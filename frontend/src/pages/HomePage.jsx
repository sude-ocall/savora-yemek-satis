import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import burgerImg from "../assets/burger.png";
import pizzaImg from "../assets/pizza.png";
import pastaImg from "../assets/pasta.png";

const CATEGORIES = ["Tümü", "Burger", "Pizza", "Tatlı", "İçecek", "Yan Ürün"];

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [cart, setCart] = useState(location.state?.updatedCart || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [showOnlyRestaurants, setShowOnlyRestaurants] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // --- Yeni State'ler (İstek Sistemi) ---
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestData, setRequestData] = useState({ address: "", details: "" });
  const [activeRequest, setActiveRequest] = useState(null); // Gönderilen istek verisi
  const [offers, setOffers] = useState([]); // Restoranlardan gelen teklifler

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
    }
  ]);

  const menuItems = [
    { id: 1, name: "Savora Gurme Burger", category: "Burger", seller: "Burger Dünyası", sellerId: 101, rating: 4.8, price: 220, image: burgerImg },
    { id: 2, name: "İtalyan Margherita", category: "Pizza", seller: "Pizza Locale", sellerId: 102, rating: 4.5, price: 180, image: pizzaImg },
    { id: 3, name: "Kremalı Fettuccine Alfredo", category: "Yan Ürün", seller: "Pasta House", sellerId: 103, rating: 4.9, price: 195, image: pastaImg }
  ];

  const restaurants = [
    { id: 101, name: "Burger Dünyası", rating: 4.8, category: "Burger", image: "🏪" },
    { id: 102, name: "Pizza Locale", rating: 4.5, category: "Pizza", image: "🏪" },
    { id: 103, name: "Pasta House", rating: 4.9, category: "İtalyan", image: "🏪" }
  ];

  // --- Yeni Fonksiyonlar (İstek Sistemi) ---
  const handleSendRequest = () => {
    if (!requestData.address || !requestData.details) {
      setNotification("Lütfen tüm alanları doldurun.");
      return;
    }
    setActiveRequest(requestData);
    setNotification("İsteğiniz restoranlara iletildi!");
    setShowRequestModal(false);

    // Simülasyon: 2 saniye sonra teklifler gelsin
    setTimeout(() => {
      setOffers([
        { id: 1, name: "Burger Sarayı", rating: 4.2, price: 190 },
        { id: 2, name: "Lezzet Durağı", rating: 4.7, price: 210 },
        { id: 3, name: "Hızlı Pizza", rating: 4.0, price: 175 },
      ]);
    }, 2000);
  };

  const handleWithdrawRequest = () => {
    setActiveRequest(null);
    setOffers([]);
    setShowRequestModal(false);
    setNotification("İsteğiniz geri çekildi.");
  };

  const addToCartFromOffer = (offer) => {
    const newItem = { id: Date.now(), name: `Özel Teklif: ${activeRequest.details}`, price: offer.price, seller: offer.name };
    setCart([...cart, newItem]);
    setNotification("Teklif sepete eklendi!");
    setShowRequestModal(false);
  };

  const addToCart = (item) => {
    setCart([...cart, item]);
    setNotification(`${item.name} sepete eklendi!`);
  };

  const goToSeller = (sellerId) => {
    navigate(`/seller-show/${sellerId}`, { state: { currentCart: cart } });
  };

  const confirmCancel = () => {
    setActiveOrders(activeOrders.filter(o => o.id !== selectedOrder.id));
    setShowConfirmModal(false);
    setSelectedOrder(null);
    setNotification("Sipariş iptal edildi.");
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.seller.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tümü" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalAmount = cart.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="home-page-container container py-4">
      {notification && (
        <div className="toast-notification">
          <div className="toast-content">✅ {notification}</div>
        </div>
      )}

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
                      <div><span className="order-number">#{order.id}</span><br /><small>{order.restaurant}</small></div>
                      <span className={`status-pill ${order.status === 'Yeni Sipariş' ? 'status-new' : 'status-pro'}`}>{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Arama ve Özel İstek Satırı */}
      <div className="row mb-4 search-container-row align-items-center shadow-sm mx-0">
        <div className="col-12 d-flex gap-2">
          <button
            className={`btn btn-request-food ${activeRequest ? 'btn-request-active' : 'btn-outline-primary'}`}
            onClick={() => setShowRequestModal(true)}
          >
            {activeRequest ? "🔔 Teklifleri Gör" : "📍 Şunu arıyorum..."}
          </button>

          <div className="search-wrapper flex-grow-1 mb-0">
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

        <div className="col-12 mt-3 d-flex justify-content-between align-items-center">
          {!showOnlyRestaurants && (
            <div className="category-scroll-container d-flex gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
          <button
            className={`btn ${showOnlyRestaurants ? 'btn-primary' : 'btn-outline-primary'} rounded-pill px-4 shadow-sm ms-auto`}
            onClick={() => setShowOnlyRestaurants(!showOnlyRestaurants)}
          >
            {showOnlyRestaurants ? "🍔 Menüye Dön" : "🏪 Sadece Restoranları Listele"}
          </button>
        </div>
      </div>

      <div className="row mb-5">
        <div className={showOnlyRestaurants ? "col-12" : "col-md-8"}>
          <h2 className="section-title mb-4">
            {showOnlyRestaurants ? "Popüler Restoranlar" : (selectedCategory === "Tümü" ? "Günün Menüsü" : selectedCategory)}
          </h2>

          {showOnlyRestaurants ? (
            <div className="row">
              {restaurants.map(res => (
                <div key={res.id} className="col-md-4 mb-4">
                  <div className="restaurant-card p-3 shadow-sm border rounded-4 cursor-pointer bg-white" onClick={() => goToSeller(res.id)}>
                    <div className="res-placeholder mb-3 text-center py-4 bg-light rounded-3" style={{ fontSize: '2rem' }}>{res.image}</div>
                    <h5 className="fw-bold m-0">{res.name}</h5>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span className="text-muted small">{res.category}</span>
                      <span className="text-warning fw-bold">⭐ {res.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="menu-grid">
              {filteredItems.map((item) => (
                <div key={item.id} className="menu-card">
                  <div className="card-image"><img src={item.image} alt={item.name} /></div>
                  <div className="card-info">
                    <div className="seller-info">
                      <span className="seller-name text-primary cursor-pointer" onClick={() => goToSeller(item.sellerId)}>{item.seller}</span>
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
          )}
        </div>

        {!showOnlyRestaurants && (
          <div className="col-md-4">
            <div className="cart-sidebar shadow-sm">
              <h3 className="fw-bold">Sepetiniz</h3>
              <hr />
              {cart.length === 0 ? <p className="text-muted text-center py-4">Sepetiniz henüz boş.</p> : (
                <div className="cart-items">
                  {cart.map((item, index) => (
                    <div key={index} className="cart-item-row d-flex justify-content-between mb-2">
                      <span>{item.name}</span>
                      <strong>{item.price} ₺</strong>
                    </div>
                  ))}
                </div>
              )}
              <div className="cart-total mt-4">
                <div className="d-flex justify-content-between fw-bold fs-5 mb-3"><span>Toplam:</span><span>{totalAmount} ₺</span></div>
                <button className={`btn-checkout w-100 ${cart.length > 0 ? 'active' : ''}`} disabled={cart.length === 0} onClick={() => navigate("/payment", { state: { amount: totalAmount } })}>Ödemeye Geç</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- Özel İstek Modalı (Yeni) --- */}
      {showRequestModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-card p-4" style={{ maxWidth: '500px' }}>
            <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
              <h4 className="fw-bold m-0">{activeRequest ? "İsteğiniz ve Teklifler" : "Özel Yemek İsteği"}</h4>
              <button className="btn-close" onClick={() => setShowRequestModal(false)}></button>
            </div>

            <div className="request-form">
              <label className="small fw-bold text-muted">Konum / Adres</label>
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Örn: Antalya, Konyaaltı..."
                value={requestData.address}
                onChange={(e) => setRequestData({ ...requestData, address: e.target.value })}
              />

              <label className="small fw-bold text-muted">Ne yemek istiyorsunuz?</label>
              <textarea
                className="form-control request-textarea mb-3"
                placeholder="Örn: 2 adet acılı lahmacun ve bol yeşillik istiyorum..."
                value={requestData.details}
                onChange={(e) => setRequestData({ ...requestData, details: e.target.value })}
              ></textarea>

              {!activeRequest ? (
                <button className="btn btn-primary w-100 py-2 fw-bold" onClick={handleSendRequest}>İsteği Gönder</button>
              ) : (
                <div className="active-request-controls">
                  <div className="d-flex gap-2 mb-3">
                    <button className="btn btn-warning flex-grow-1 small py-1" onClick={handleSendRequest}>Güncelle</button>
                    <button className="btn btn-outline-danger flex-grow-1 small py-1" onClick={handleWithdrawRequest}>Geri Çek</button>
                  </div>

                  <h6 className="fw-bold border-top pt-3">Gelen Teklifler ({offers.length})</h6>
                  <div className="offers-section">
                    {offers.length === 0 ? (
                      <p className="text-center text-muted small py-3">Restoranlardan teklif bekleniyor...</p>
                    ) : (
                      offers.map(offer => (
                        <div key={offer.id} className="offer-item shadow-sm">
                          <div className="offer-info">
                            <div className="fw-bold">{offer.name} <span className="text-warning small">⭐{offer.rating}</span></div>
                            <div className="text-primary fw-bold">{offer.price} ₺</div>
                          </div>
                          <div className="offer-actions d-flex gap-2">
                            <button className="btn btn-sm btn-success" onClick={() => addToCartFromOffer(offer)}>Kabul Et</button>
                            <button className="btn btn-sm btn-light text-danger" onClick={() => setOffers(offers.filter(o => o.id !== offer.id))}>X</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-card p-4">
            <div className="d-flex justify-content-between mb-3">
              <h4 className="fw-bold m-0">Sipariş Detayı #{selectedOrder.id}</h4>
              <button className="btn-close" onClick={() => setSelectedOrder(null)}></button>
            </div>
            <p><strong>Restoran:</strong> {selectedOrder.restaurant}</p>
            <p><strong>Durum:</strong> {selectedOrder.status}</p>
            <div className="modal-footer-styled d-flex gap-2 mt-4">
              {selectedOrder.status === "Yeni Sipariş" && (
                <button className="btn btn-outline-danger flex-grow-1" onClick={() => setShowConfirmModal(true)}>İptal Et</button>
              )}
              <button className="btn btn-dark flex-grow-1" onClick={() => setSelectedOrder(null)}>Kapat</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="custom-modal-overlay overlay-top">
          <div className="confirm-card text-center p-4 bg-white rounded shadow-lg">
            <h4 className="fw-bold">Emin misiniz?</h4>
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