import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BackendDataService from "../services/BackendDataServices";

const CATEGORIES = ["Tümü", "Burger", "Pizza", "Tatlı", "İçecek", "Yan Ürün"];

const STATUS_MAP = {
  new: "Yeni Sipariş",
  preparing: "Hazırlanıyor",
  on_the_way: "Yolda",
  completed: "Tamamlandı"
};

const HomePage = ({ token, user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [cart, setCart]                         = useState(location.state?.updatedCart || []);
  const [searchTerm, setSearchTerm]             = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [showOnlyRestaurants, setShowOnlyRestaurants] = useState(false);

  const [products, setProducts]       = useState([]);
  const [sellers, setSellers]         = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedOrder, setSelectedOrder]     = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [notification, setNotification]       = useState(null);

  // Offer system
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestData, setRequestData] = useState({ title: "", description: "", category: "" });
  const [activeRequest, setActiveRequest]       = useState(null);
  const [offers, setOffers]                     = useState([]);
  const [offerLoading, setOfferLoading]         = useState(false);

  // Initial fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, sellerRes, ordersRes] = await Promise.all([
          BackendDataService.getProducts(),
          BackendDataService.getSellers(),
          BackendDataService.getUserOrders(token)
        ]);
        setProducts(prodRes.data);
        setSellers(sellerRes.data);
        setActiveOrders(ordersRes.data.filter(o => o.status !== "completed"));
      } catch (err) {
        console.error("Veri yükleme hatası:", err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [token]);

  // Poll for offer updates every 5 seconds when there's an active request
  useEffect(() => {
    if (!activeRequest) return;
    const interval = setInterval(async () => {
      try {
        const res = await BackendDataService.getUserOffers(token);
        const myOffer = res.data.find(o => o._id === activeRequest._id);
        if (myOffer) setOffers(myOffer.incomingOffers || []);
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [activeRequest, token]);

  // Notification auto-dismiss
  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(t);
  }, [notification]);

  // ─── Offer handlers ────────────────────────────────────────────
  const handleSendRequest = async () => {
    if (!requestData.title || !requestData.description) {
      setNotification("Lütfen tüm alanları doldurun.");
      return;
    }
    setOfferLoading(true);
    try {
      const res = await BackendDataService.createOfferRequest(requestData, token);
      setActiveRequest(res.data);
      setOffers([]);
      setNotification("İsteğiniz restoranlara iletildi!");
      setShowRequestModal(false);
    } catch {
      setNotification("İstek gönderilemedi.");
    } finally {
      setOfferLoading(false);
    }
  };

  const handleWithdrawRequest = () => {
    setActiveRequest(null);
    setOffers([]);
    setShowRequestModal(false);
    setNotification("İsteğiniz geri çekildi.");
  };

  const addToCartFromOffer = async (offer) => {
    try {
      await BackendDataService.acceptOffer(
        { offerId: activeRequest._id, restaurantId: offer.restaurantId, price: offer.price },
        token
      );
      setNotification("Teklif kabul edildi! Sipariş oluşturuldu.");
      setActiveRequest(null);
      setOffers([]);
      setShowRequestModal(false);
      const ordersRes = await BackendDataService.getUserOrders(token);
      setActiveOrders(ordersRes.data.filter(o => o.status !== "completed"));
    } catch {
      setNotification("Teklif kabul edilirken hata oluştu.");
    }
  };

  const addToCart = (item) => {
    setCart([...cart, item]);
    setNotification(`${item.name} sepete eklendi!`);
  };

  const confirmCancel = async () => {
    try {
      await BackendDataService.cancelOrder(selectedOrder._id, token);
      setActiveOrders(prev => prev.filter(o => o._id !== selectedOrder._id));
      setNotification("Sipariş iptal edildi.");
    } catch {
      setNotification("Sipariş iptal edilemedi.");
    }
    setShowConfirmModal(false);
    setSelectedOrder(null);
  };

  const totalAmount = cart.reduce((acc, curr) => acc + curr.price, 0);

  const filteredProducts = products.filter(item => {
    const restaurantName = item.sellerId?.restaurantName || "";
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tümü" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loadingData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-success" role="status" />
      </div>
    );
  }

  return (
    <div className="home-page-container container py-4">
      {notification && (
        <div className="toast-notification">
          <div className="toast-content">✅ {notification}</div>
        </div>
      )}

      {/* ─── Active Orders Banner ─── */}
      {activeOrders.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="active-orders-banner shadow-sm">
              <div className="d-flex align-items-center mb-3">
                <div className="pulse-indicator me-2"></div>
                <h5 className="m-0 fw-bold">Aktif Siparişleriniz</h5>
              </div>
              <div className="order-vertical-scroll">
                {activeOrders.map(order => (
                  <div
                    key={order._id}
                    className="mini-order-card vertical mb-2"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="order-number">#{order._id.slice(-6).toUpperCase()}</span>
                        <br />
                        <small>{order.restaurantId?.restaurantName || "Restoran"}</small>
                      </div>
                      <span className={`status-pill ${order.status === "new" ? "status-new" : "status-pro"}`}>
                        {STATUS_MAP[order.status] || order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Search Row ─── */}
      <div className="row mb-4 search-container-row align-items-center shadow-sm mx-0">
        <div className="col-12 d-flex gap-2">
          <button
            className={`btn btn-request-food ${activeRequest ? "btn-request-active" : "btn-outline-primary"}`}
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
              onChange={e => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>
        <div className="col-12 mt-3 d-flex justify-content-between align-items-center">
          {!showOnlyRestaurants && (
            <div className="category-scroll-container d-flex gap-2">
              {CATEGORIES.map(cat => (
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
            className={`btn ${showOnlyRestaurants ? "btn-primary" : "btn-outline-primary"} rounded-pill px-4 shadow-sm ms-auto`}
            onClick={() => setShowOnlyRestaurants(!showOnlyRestaurants)}
          >
            {showOnlyRestaurants ? "🍔 Menüye Dön" : "🏪 Sadece Restoranları Listele"}
          </button>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="row mb-5">
        <div className={showOnlyRestaurants ? "col-12" : "col-md-8"}>
          <h2 className="section-title mb-4">
            {showOnlyRestaurants ? "Popüler Restoranlar" : selectedCategory === "Tümü" ? "Günün Menüsü" : selectedCategory}
          </h2>

          {showOnlyRestaurants ? (
            <div className="row">
              {sellers.map(res => (
                <div key={res._id} className="col-md-4 mb-4">
                  <div
                    className="restaurant-card p-3 shadow-sm border rounded-4 cursor-pointer bg-white"
                    onClick={() => navigate(`/sellers/${res._id}`, { state: { currentCart: cart } })}
                  >
                    <div className="res-placeholder mb-3 text-center py-4 bg-light rounded-3" style={{ fontSize: "2rem" }}>🏪</div>
                    <h5 className="fw-bold m-0">{res.restaurantName}</h5>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span className="text-muted small">{res.email}</span>
                    </div>
                  </div>
                </div>
              ))}
              {sellers.length === 0 && <p className="text-muted text-center py-5 col-12">Restoran bulunamadı.</p>}
            </div>
          ) : (
            <div className="menu-grid">
              {filteredProducts.map(item => (
                <div key={item._id} className="menu-card">
                  <div className="card-image">
                    {item.imgURL
                      ? <img src={item.imgURL} alt={item.name} />
                      : <div className="d-flex align-items-center justify-content-center h-100 bg-light text-muted" style={{ fontSize: "2rem" }}>🍽️</div>
                    }
                  </div>
                  <div className="card-info">
                    <div className="seller-info">
                      <span
                        className="seller-name text-primary cursor-pointer"
                        onClick={() => navigate(`/sellers/${item.sellerId?._id}`, { state: { currentCart: cart } })}
                      >
                        {item.sellerId?.restaurantName || "Restoran"}
                      </span>
                    </div>
                    <h3>{item.name}</h3>
                    <div className="card-footer">
                      <span className="price">{item.price} ₺</span>
                      <button className="btn-add-cart" onClick={() => addToCart(item)}>Ekle</button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <p className="text-muted text-center py-5 col-12">Ürün bulunamadı.</p>
              )}
            </div>
          )}
        </div>

        {/* ─── Cart Sidebar ─── */}
        {!showOnlyRestaurants && (
          <div className="col-md-4">
            <div className="cart-sidebar shadow-sm">
              <h3 className="fw-bold">Sepetiniz</h3>
              <hr />
              {cart.length === 0
                ? <p className="text-muted text-center py-4">Sepetiniz henüz boş.</p>
                : (
                  <div className="cart-items">
                    {cart.map((item, index) => (
                      <div key={index} className="cart-item-row d-flex justify-content-between mb-2">
                        <span>{item.name}</span>
                        <strong>{item.price} ₺</strong>
                      </div>
                    ))}
                  </div>
                )
              }
              <div className="cart-total mt-4">
                <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                  <span>Toplam:</span><span>{totalAmount} ₺</span>
                </div>
                <button
                  className={`btn-checkout w-100 ${cart.length > 0 ? "active" : ""}`}
                  disabled={cart.length === 0}
                  onClick={() => navigate("/payment", { state: { amount: totalAmount, cart } })}
                >
                  Ödemeye Geç
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Offer Modal ─── */}
      {showRequestModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-card p-4" style={{ maxWidth: "500px" }}>
            <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
              <h4 className="fw-bold m-0">{activeRequest ? "İsteğiniz ve Teklifler" : "Özel Yemek İsteği"}</h4>
              <button className="btn-close" onClick={() => setShowRequestModal(false)}></button>
            </div>
            <div className="request-form">
              <label className="small fw-bold text-muted">Başlık</label>
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Örn: Vejetaryen Öğle Yemeği"
                value={requestData.title}
                onChange={e => setRequestData({ ...requestData, title: e.target.value })}
                disabled={!!activeRequest}
              />
              <label className="small fw-bold text-muted">Ne yemek istiyorsunuz?</label>
              <textarea
                className="form-control request-textarea mb-3"
                placeholder="Örn: 2 adet acılı lahmacun ve bol yeşillik..."
                value={requestData.description}
                onChange={e => setRequestData({ ...requestData, description: e.target.value })}
                disabled={!!activeRequest}
              />

              {!activeRequest ? (
                <button className="btn btn-primary w-100 py-2 fw-bold" onClick={handleSendRequest} disabled={offerLoading}>
                  {offerLoading ? "Gönderiliyor..." : "İsteği Gönder"}
                </button>
              ) : (
                <div className="active-request-controls">
                  <div className="d-flex gap-2 mb-3">
                    <button className="btn btn-outline-danger flex-grow-1 small py-1" onClick={handleWithdrawRequest}>Geri Çek</button>
                  </div>
                  <h6 className="fw-bold border-top pt-3">Gelen Teklifler ({offers.length})</h6>
                  <div className="offers-section">
                    {offers.length === 0 ? (
                      <p className="text-center text-muted small py-3">Restoranlardan teklif bekleniyor...</p>
                    ) : (
                      offers.map((offer, idx) => (
                        <div key={idx} className="offer-item shadow-sm">
                          <div className="offer-info">
                            <div className="fw-bold">{offer.restaurantId?.restaurantName || "Restoran"}</div>
                            <div className="text-muted small">{offer.message}</div>
                            <div className="text-primary fw-bold">{offer.price} ₺</div>
                          </div>
                          <div className="offer-actions d-flex gap-2">
                            <button className="btn btn-sm btn-success" onClick={() => addToCartFromOffer(offer)}>Kabul Et</button>
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

      {/* ─── Order Detail Modal ─── */}
      {selectedOrder && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-card p-4">
            <div className="d-flex justify-content-between mb-3">
              <h4 className="fw-bold m-0">Sipariş #{selectedOrder._id.slice(-6).toUpperCase()}</h4>
              <button className="btn-close" onClick={() => setSelectedOrder(null)}></button>
            </div>
            <p><strong>Restoran:</strong> {selectedOrder.restaurantId?.restaurantName || "Restoran"}</p>
            <p><strong>Durum:</strong> {STATUS_MAP[selectedOrder.status] || selectedOrder.status}</p>
            <div className="modal-footer-styled d-flex gap-2 mt-4">
              {selectedOrder.status === "new" && (
                <button className="btn btn-outline-danger flex-grow-1" onClick={() => setShowConfirmModal(true)}>İptal Et</button>
              )}
              <button className="btn btn-dark flex-grow-1" onClick={() => setSelectedOrder(null)}>Kapat</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Confirm Cancel Modal ─── */}
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