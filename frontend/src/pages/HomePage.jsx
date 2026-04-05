import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BackendDataService from "../services/BackendDataServices";

const CATEGORIES = ["Tümü", "Burger", "Pizza", "Tatlı", "İçecek", "Yan Ürün"];

const STATUS_MAP = {
  new: "Yeni Sipariş",
  preparing: "Hazırlanıyor",
  on_the_way: "Yolda",
  completed: "Tamamlandı",
  cancelled: "Restoran İptali"
};

// ─── Aktif istek localStorage ───
const OFFER_KEY = "savora_active_request";

const loadActiveRequest = () => {
  try {
    const raw = localStorage.getItem(OFFER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveActiveRequest = (req) => {
  try {
    if (req) {
      localStorage.setItem(OFFER_KEY, JSON.stringify(req));
    } else {
      localStorage.removeItem(OFFER_KEY);
    }
  } catch {}
};

const HomePage = ({ token, user, cart, onAddToCart, onRemoveFromCart, onClearCart }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // conflictModal: { item, existingRestaurant, newRestaurant }
  const [conflictModal, setConflictModal] = useState(null);

  const [searchTerm, setSearchTerm]             = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [showOnlyRestaurants, setShowOnlyRestaurants] = useState(false);

  const [products, setProducts]         = useState([]);
  const [sellers, setSellers]           = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [loadingData, setLoadingData]   = useState(true);

  const [selectedOrder, setSelectedOrder]       = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAddressAlert, setShowAddressAlert]   = useState(false);
  const [notification, setNotification]         = useState(null);

  // Teklif sistemi
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestData, setRequestData]           = useState({ title: "", description: "", category: "" });
  const [activeRequest, setActiveRequest]       = useState(loadActiveRequest);
  const [offers, setOffers]                     = useState([]);
  const [offerLoading, setOfferLoading]         = useState(false);

  // ─── Aktif isteği localStorage'a kaydet ───
  useEffect(() => {
    saveActiveRequest(activeRequest);
  }, [activeRequest]);

  // ─── Ürün + Satıcı: mount'ta bir kez, sonra 60sn'de bir ───
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const [prodRes, sellerRes] = await Promise.all([
          BackendDataService.getProducts(),
          BackendDataService.getSellers()
        ]);
        setProducts(prodRes.data);
        setSellers(sellerRes.data);
      } catch (err) {
        console.error("Katalog yükleme hatası:", err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchCatalog();
    const catalogInterval = setInterval(fetchCatalog, 60000);
    return () => clearInterval(catalogInterval);
  }, [token]);

  // ─── Aktif siparişler: 15sn'de bir yenile ───
  const fetchOrders = useCallback(async () => {
    try {
      const res = await BackendDataService.getUserOrders(token);
      setActiveOrders(res.data.filter(o => o.status !== "completed" && o.status !== "cancelled"));
    } catch {}
  }, [token]);

  useEffect(() => {
    fetchOrders();
    const ordersInterval = setInterval(fetchOrders, 15000);
    return () => clearInterval(ordersInterval);
  }, [fetchOrders]);

  // ─── Aktif istek varsa teklifleri 5sn'de bir çek ───
  const fetchOffers = useCallback(async () => {
    if (!activeRequest) return;
    try {
      const res = await BackendDataService.getUserOffers(token);
      const myOffer = res.data.find(o => o._id === activeRequest._id);
      if (myOffer) {
        setOffers(myOffer.incomingOffers || []);
        if (myOffer.status === "closed") {
          setActiveRequest(null);
          setOffers([]);
        }
      }
    } catch {}
  }, [activeRequest, token]);

  useEffect(() => {
    if (!activeRequest) return;
    fetchOffers();
    const interval = setInterval(fetchOffers, 5000);
    return () => clearInterval(interval);
  }, [activeRequest, fetchOffers]);

  // ─── Bildirim otomatik kapat ───
  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(t);
  }, [notification]);

  // ─── Teklif isteği gönder ───
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
      setRequestData({ title: "", description: "", category: "" });
    } catch {
      setNotification("İstek gönderilemedi.");
    } finally {
      setOfferLoading(false);
    }
  };

  // ─── İsteği geri çek ───
  const handleWithdrawRequest = () => {
    setActiveRequest(null);
    setOffers([]);
    setShowRequestModal(false);
    setRequestData({ title: "", description: "", category: "" });
    setNotification("İsteğiniz geri çekildi.");
  };

  // ─── Teklifi kabul et → SADECE ödeme sayfasına yönlendir ───
  // Sipariş ödeme SONRASI oluşturulur. Kullanıcı geri dönerse istek açık kalır.
  const handleAcceptOffer = (offer) => {
    const restaurantId = offer.restaurantId?._id || offer.restaurantId;
    setShowRequestModal(false);

    navigate("/payment", {
      state: {
        amount: offer.price,
        cart: [],
        fromOffer: true,
        offerData: {
          offerId: activeRequest._id,
          restaurantId,
          price: offer.price,
          note: activeRequest.menuRequest?.description || ""
        }
      }
    });
    // activeRequest burada temizlenmez — ödeme tamamlanana kadar kalır
  };

  // ─── Sepete ekle ───
  // ─── Adres kontrolü ile ödemeye geç ───
  const handleCheckout = async () => {
    try {
      const res = await BackendDataService.getUserProfile(token);
      const addresses = res.data.user?.addresses || [];
      if (addresses.length === 0) { setShowAddressAlert(true); return; }
    } catch {}
    navigate("/payment", { state: { amount: totalAmount, cart } });
  };

  // ─── Restoran kontrolü ile sepete ekle ───
  const getRestId  = (item) => item.sellerId?._id || item.sellerId;
  const getRestName = (item) => item.sellerId?.restaurantName || "Restoran";

  const handleAddToCart = (item) => {
    if (cart.length === 0) {
      onAddToCart(item);
      setNotification(`${item.name} sepete eklendi!`);
      return;
    }
    const existingId = getRestId(cart[0]);
    const newId      = getRestId(item);
    if (String(existingId) === String(newId)) {
      onAddToCart(item);
      setNotification(`${item.name} sepete eklendi!`);
    } else {
      setConflictModal({
        item,
        existingRestaurant: getRestName(cart[0]),
        newRestaurant: getRestName(item)
      });
    }
  };

  // ─── Sipariş iptal onayla ───
  const confirmCancel = async () => {
    try {
      await BackendDataService.cancelOrder(selectedOrder._id, token);
      // DB'den güncel sipariş listesini çek
      await fetchOrders();
      setNotification("Sipariş iptal edildi.");
    } catch (err) {
      setNotification("Sipariş iptal edilemedi: " + (err.response?.data?.message || "Hata oluştu."));
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
    <div className="home-page-container container py-4 min-vh-100">
      {notification && (
        <div className="toast-notification">
          <div className="toast-content">✅ {notification}</div>
        </div>
      )}

      {/* ─── Aktif Siparişler ─── */}
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
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="order-number">#{order._id.slice(-6).toUpperCase()}</span>
                        <br />
                        <small>{order.restaurantId?.restaurantName || "Restoran"}</small>
                        {(!order.menu || order.menu.length === 0) && order.note && (
                          <small className="text-muted d-block" style={{ fontSize: "0.7rem", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            📝 {order.note}
                          </small>
                        )}
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

      {/* ─── Arama Satırı ─── */}
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

      {/* ─── Ana İçerik ─── */}
      <div className="row mb-5">
        <div className={showOnlyRestaurants ? "col-12" : "col-md-8"}>
          <h2 className="section-title mb-4">
            {showOnlyRestaurants
              ? "Popüler Restoranlar"
              : selectedCategory === "Tümü" ? "Günün Menüsü" : selectedCategory}
          </h2>

          {showOnlyRestaurants ? (
            <div className="row">
              {sellers.map(res => (
                <div key={res._id} className="col-md-4 mb-4">
                  <div
                    className="restaurant-card p-3 shadow-sm border rounded-4 cursor-pointer bg-white"
                    onClick={() => navigate(`/sellers/${res._id}`, { state: { currentCart: cart } })}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="res-placeholder mb-3 text-center py-4 bg-light rounded-3" style={{ fontSize: "2rem" }}>🏪</div>
                    <h5 className="fw-bold m-0">{res.restaurantName}</h5>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span className="text-muted small">{res.email}</span>
                    </div>
                  </div>
                </div>
              ))}
              {sellers.length === 0 && (
                <p className="text-muted text-center py-5 col-12">Restoran bulunamadı.</p>
              )}
            </div>
          ) : (
            <div className="menu-grid">
              {filteredProducts.map(item => (
                <div key={item._id} className="menu-card" style={{ cursor: "pointer" }} onClick={() => navigate(`/sellers/${item.sellerId?._id}`, { state: { currentCart: cart } })}>
                  <div className="card-image">
                    {item.imgURL
                      ? <img src={item.imgURL} alt={item.name} />
                      : <div className="d-flex align-items-center justify-content-center h-100 bg-light text-muted" style={{ fontSize: "2rem" }}>🍽️</div>
                    }
                  </div>
                  <div className="card-info">
                    <div className="seller-info">
                      <span
                        className="seller-name text-primary"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/sellers/${item.sellerId?._id}`, { state: { currentCart: cart } })}
                      >
                        {item.sellerId?.restaurantName || "Restoran"}
                      </span>
                    </div>
                    <h3>{item.name}</h3>
                    <div className="card-footer">
                      <span className="price">{item.price} ₺</span>
                      <button className="btn-add-cart" onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }}>Ekle</button>
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

        {/* ─── Sepet Sidebar ─── */}
        {!showOnlyRestaurants && (
          <div className="col-md-4">
            <div className="cart-sidebar shadow-sm">
              <h3 className="fw-bold">Sepetiniz</h3>
              <hr />
              {cart.length === 0 ? (
                <p className="text-muted text-center py-4">Sepetiniz henüz boş.</p>
              ) : (
                <div className="cart-items">
                  {cart.map((item, index) => (
                    <div key={index} className="cart-item-row d-flex justify-content-between align-items-center mb-2">
                      <span>{item.name}</span>
                      <div className="d-flex align-items-center gap-2">
                        <strong>{item.price} ₺</strong>
                        <button
                          onClick={() => onRemoveFromCart(index)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#dc3545",
                            cursor: "pointer",
                            fontSize: "18px",
                            padding: "0 4px",
                            lineHeight: 1,
                            fontWeight: "bold"
                          }}
                          title="Sepetten çıkar"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="cart-total mt-4">
                <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                  <span>Toplam:</span>
                  <span>{totalAmount} ₺</span>
                </div>
                <button
                  className={`btn-checkout w-100 ${cart.length > 0 ? "active" : ""}`}
                  disabled={cart.length === 0}
                  onClick={handleCheckout}
                >
                  Ödemeye Geç
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Teklif / İstek Modalı ─── */}
      {showRequestModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-card p-4" style={{ maxWidth: "500px" }}>
            <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
              <h4 className="fw-bold m-0">
                {activeRequest ? "İsteğiniz ve Teklifler" : "Özel Yemek İsteği"}
              </h4>
              <button className="btn-close" onClick={() => setShowRequestModal(false)}></button>
            </div>

            <div className="request-form">
              <label className="small fw-bold text-muted">Başlık</label>
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Örn: Vejetaryen Öğle Yemeği"
                value={activeRequest ? activeRequest.menuRequest?.title : requestData.title}
                onChange={e => setRequestData({ ...requestData, title: e.target.value })}
                disabled={!!activeRequest}
              />

              <label className="small fw-bold text-muted">Ne yemek istiyorsunuz?</label>
              <textarea
                className="form-control request-textarea mb-3"
                placeholder="Örn: 2 adet acılı lahmacun ve bol yeşillik..."
                value={activeRequest ? activeRequest.menuRequest?.description : requestData.description}
                onChange={e => setRequestData({ ...requestData, description: e.target.value })}
                disabled={!!activeRequest}
              />

              {!activeRequest ? (
                <button
                  className="btn btn-primary w-100 py-2 fw-bold"
                  onClick={handleSendRequest}
                  disabled={offerLoading}
                >
                  {offerLoading ? "Gönderiliyor..." : "İsteği Gönder"}
                </button>
              ) : (
                <div className="active-request-controls">
                  <div className="d-flex gap-2 mb-3">
                    <button
                      className="btn btn-outline-danger flex-grow-1 small py-1"
                      onClick={handleWithdrawRequest}
                    >
                      Geri Çek
                    </button>
                  </div>

                  <h6 className="fw-bold border-top pt-3">
                    Gelen Teklifler ({offers.length})
                  </h6>

                  <div className="offers-section">
                    {offers.length === 0 ? (
                      <p className="text-center text-muted small py-3">
                        Restoranlardan teklif bekleniyor...
                      </p>
                    ) : (
                      offers.map((offer, idx) => (
                        <div key={idx} className="offer-item shadow-sm">
                          <div className="offer-info">
                            <div className="fw-bold">
                              {offer.restaurantId?.restaurantName || "Restoran"}
                            </div>
                            <div className="text-muted small">{offer.message}</div>
                            <div className="text-primary fw-bold">{offer.price} ₺</div>
                          </div>
                          <div className="offer-actions d-flex gap-2">
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleAcceptOffer(offer)}
                            >
                              Kabul Et
                            </button>
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

      {/* ─── Sipariş Detay Modalı ─── */}
      {selectedOrder && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-card p-4">
            <div className="d-flex justify-content-between mb-3">
              <h4 className="fw-bold m-0">
                Sipariş #{selectedOrder._id.slice(-6).toUpperCase()}
              </h4>
              <button className="btn-close" onClick={() => setSelectedOrder(null)}></button>
            </div>

            <p><strong>Restoran:</strong> {selectedOrder.restaurantId?.restaurantName || "Restoran"}</p>
            <p><strong>Durum:</strong> {STATUS_MAP[selectedOrder.status] || selectedOrder.status}</p>

            {/* Sipariş içeriği */}
            <div className="mt-2 mb-3">
              {selectedOrder.menu && selectedOrder.menu.length > 0 ? (
                <>
                  <strong>Sipariş İçeriği:</strong>
                  <ul className="mt-2 mb-0 ps-3">
                    {selectedOrder.menu.map((item, idx) => (
                      <li key={idx} className="text-muted small">
                        {item.productId?.name
                          ? `${item.productId.name} × ${item.quantity}`
                          : `Ürün #${idx + 1} × ${item.quantity}`}
                        {item.productId?.price ? ` — ${item.productId.price} ₺` : ""}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <strong>Ne yemek istiyorsunuz?</strong>
                  <p className="text-muted small mt-1 mb-0">
                    {selectedOrder.note || "—"}
                  </p>
                </>
              )}
            </div>

            <div className="modal-footer-styled d-flex gap-2 mt-4">
              {selectedOrder.status === "new" && (
                <button
                  className="btn btn-outline-danger flex-grow-1"
                  onClick={() => setShowConfirmModal(true)}
                >
                  İptal Et
                </button>
              )}
              <button
                className="btn btn-dark flex-grow-1"
                onClick={() => setSelectedOrder(null)}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── İptal Onay Modalı ─── */}
      {showConfirmModal && (
        <div className="custom-modal-overlay overlay-top">
          <div className="confirm-card text-center p-4 bg-white rounded shadow-lg">
            <h4 className="fw-bold">Emin misiniz?</h4>
            <p className="text-muted small">Bu sipariş iptal edilecektir.</p>
            <div className="d-flex gap-2 mt-4">
              <button
                className="btn btn-light flex-grow-1"
                onClick={() => setShowConfirmModal(false)}
              >
                Vazgeç
              </button>
              <button
                className="btn btn-danger flex-grow-1"
                onClick={confirmCancel}
              >
                Evet, İptal Et
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ─── Farklı Restoran Uyarı Modalı ─── */}
      {conflictModal && (
        <div className="custom-modal-overlay overlay-top">
          <div className="confirm-card text-center p-4 bg-white rounded shadow-lg" style={{ maxWidth: 420 }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🛒</div>
            <h5 className="fw-bold mb-2">Farklı Restoran</h5>
            <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
              Sepetinizde <strong>{conflictModal.existingRestaurant}</strong> restoranından ürünler var.<br />
              <strong>{conflictModal.newRestaurant}</strong> restoranından ürün eklemek için
              mevcut sepeti temizlemeniz gerekiyor.
            </p>
            <div className="d-flex gap-2">
              <button className="btn btn-light flex-grow-1 fw-bold rounded-pill"
                onClick={() => setConflictModal(null)}>İptal</button>
              <button className="btn btn-danger flex-grow-1 fw-bold rounded-pill"
                onClick={() => {
                  onClearCart();
                  onAddToCart(conflictModal.item);
                  setNotification(`${conflictModal.item.name} sepete eklendi!`);
                  setConflictModal(null);
                }}>Sepeti Temizle ve Ekle</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Adres Uyarı Modalı ─── */}
      {showAddressAlert && (
        <div className="custom-modal-overlay overlay-top">
          <div className="confirm-card text-center p-4 bg-white rounded shadow-lg" style={{ maxWidth: 400 }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📍</div>
            <h5 className="fw-bold mb-2">Adres Bulunamadı</h5>
            <p className="text-muted small mb-4">
              Ödemeye geçmeden önce profilinize en az bir teslimat adresi eklemeniz gerekiyor.
            </p>
            <div className="d-flex gap-2">
              <button className="btn btn-light flex-grow-1 rounded-pill fw-bold"
                onClick={() => setShowAddressAlert(false)}>Kapat</button>
              <button className="btn btn-warning flex-grow-1 rounded-pill fw-bold"
                onClick={() => { setShowAddressAlert(false); navigate("/profile", { state: { tab: "addresses" } }); }}>
                Adres Ekle
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HomePage;