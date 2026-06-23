import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackendDataService from "../services/BackendDataServices";

// --- Yildiz gosterimi ---
const StarDisplay = ({ rating, size = "1rem" }) => {
  const full = Math.round(Number(rating) || 0);
  return (
    <span style={{ fontSize: size, lineHeight: 1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= full ? "#ffc107" : "#ddd" }}>&#9733;</span>
      ))}
    </span>
  );
};

// --- Tiklanabilir yildiz secici ---
const StarPicker = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span
          key={i}
          style={{ fontSize: "1.5rem", cursor: "pointer", color: i <= (hover || value) ? "#ffc107" : "#ddd" }}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
        >&#9733;</span>
      ))}
    </span>
  );
};

const calcAvg = (arr) =>
  arr.length ? arr.reduce((s, n) => s + n, 0) / arr.length : null;

const SellerShow = ({ token, cart, onAddToCart, onRemoveFromCart, onClearCart }) => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [conflictModal, setConflictModal]   = useState(null);
  const [showAddressAlert, setShowAddressAlert] = useState(false);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [sellerMenu, setSellerMenu] = useState([]);
  const [loading, setLoading]       = useState(true);

  // --- Yorumlar (MongoDB) ---
  const [comments, setComments]     = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [userRating, setUserRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // --- Menu puanlari (localStorage) ---
  const [menuRatings, setMenuRatings] = useState(() => {
    try {
      const s = localStorage.getItem("savora_menu_ratings_" + id);
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  });
  const [myMenuRatings, setMyMenuRatings] = useState({});

  // --- Hesaplamalar ---
  const sellerRating  = calcAvg(comments.map(c => c.rating));
  const getItemRating = (itemId) => calcAvg(menuRatings[itemId] || []);

  // --- Satici ve menu yukle ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sellersRes, productsRes] = await Promise.all([
          BackendDataService.getSellers(),
          BackendDataService.getProducts()
        ]);
        const found = sellersRes.data.find(s => s._id === id);
        setSellerInfo(found || null);
        const filtered = productsRes.data.filter(
          p => p.sellerId?._id === id || p.sellerId === id
        );
        setSellerMenu(filtered);
      } catch (err) {
        console.error("Satici verileri yuklenemedi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // --- Yorumlari MongoDB'den yukle ---
  useEffect(() => {
    setCommentsLoading(true);
    BackendDataService.getReviews(id)
      .then(res => setComments(res.data))
      .catch(err => console.error("Yorumlar yuklenemedi:", err))
      .finally(() => setCommentsLoading(false));
  }, [id]);

  const getRestId   = (item) => item.sellerId?._id || item.sellerId;
  const getRestName = (item) => item.sellerId?.restaurantName || "Restoran";

  const handleAddToCart = (item) => {
    if (cart.length === 0) {
      onAddToCart(item);
      return;
    }
    if (String(getRestId(cart[0])) === String(getRestId(item))) {
      onAddToCart(item);
    } else {
      setConflictModal({
        item,
        existingRestaurant: getRestName(cart[0]),
        newRestaurant: getRestName(item)
      });
    }
  };

  // --- Yorum gonder ---
  const submitComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await BackendDataService.addReview(id, {
        text: newComment.trim(),
        rating: userRating
      }, token);
      setComments(prev => [res.data, ...prev]);
      setNewComment("");
      setUserRating(5);
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Yorum gonderilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Adres kontrolü ile ödemeye geç ---
  const handleCheckout = async () => {
    try {
      const res = await BackendDataService.getUserProfile(token);
      const addresses = res.data.user?.addresses || [];
      if (addresses.length === 0) { setShowAddressAlert(true); return; }
    } catch {}
    navigate("/payment", { state: { amount: totalAmount, cart } });
  };

  // --- Menu urunu puanla ---
  const rateMenuItem = (itemId, rating) => {
    if (myMenuRatings[itemId]) return;
    setMyMenuRatings(prev => ({ ...prev, [itemId]: rating }));
    setMenuRatings(prev => {
      const updated = { ...prev, [itemId]: [...(prev[itemId] || []), rating] };
      try { localStorage.setItem("savora_menu_ratings_" + id, JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const totalAmount = cart.reduce((acc, curr) => acc + curr.price, 0);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-success" role="status" />
      </div>
    );
  }

  if (!sellerInfo) {
    return (
      <div className="text-center py-5">
        <h4>Restoran bulunamadi.</h4>
        <button className="btn btn-dark mt-3" onClick={() => navigate("/home")}>Geri Don</button>
      </div>
    );
  }

  return (
    <div className="seller-show-container container py-5">
      <button
        className="btn btn-link mb-3 text-dark text-decoration-none fw-bold"
        onClick={() => navigate("/home")}
      >
        &#8592; Geri Don
      </button>

      {/* --- Satici baslik --- */}
      <div className="seller-header p-4 bg-dark text-white rounded-4 mb-5 shadow d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="mb-1">{sellerInfo.restaurantName}</h1>
          <p className="lead mb-0 opacity-75">{sellerInfo.email}</p>
        </div>
        <div className="text-end">
          {sellerRating !== null ? (
            <>
              <div style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}>
                {sellerRating.toFixed(1)} <span style={{ color: "#ffc107" }}>&#9733;</span>
              </div>
              <small className="opacity-75">{comments.length} yorum</small>
            </>
          ) : (
            <small className="opacity-75">Henuz yorum yok</small>
          )}
        </div>
      </div>

      <div className="row g-4">
        {/* --- Menu --- */}
        <div className="col-md-8">
          <h3 className="mb-4 fw-bold">Menu</h3>

          {sellerMenu.length === 0 ? (
            <p className="text-muted">Bu restoranin henuz urunu yok.</p>
          ) : (
            <div className="list-group shadow-sm rounded-4 overflow-hidden border-0">
              {sellerMenu.map(item => {
                const itemAvg  = getItemRating(item._id);
                const myRating = myMenuRatings[item._id];
                return (
                  <div key={item._id} className="list-group-item p-4 border-0 border-bottom">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="d-flex align-items-start gap-3 flex-grow-1">
                        {item.imgURL && (
                          <img src={item.imgURL} alt={item.name}
                            style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 10, flexShrink: 0 }} />
                        )}
                        <div className="flex-grow-1">
                          <h5 className="mb-1 fw-bold">{item.name}</h5>
                          <small className="text-muted d-block mb-1">{item.description}</small>
                          <div className="fw-bold text-success fs-5 mb-2">{item.price} &#8378;</div>

                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            {itemAvg !== null ? (
                              <span className="d-flex align-items-center gap-1">
                                <StarDisplay rating={itemAvg} size="0.9rem" />
                                <small className="text-muted">
                                  {itemAvg.toFixed(1)} ({(menuRatings[item._id] || []).length} oy)
                                </small>
                              </span>
                            ) : (
                              <small className="text-muted">Henuz puanlanmadi</small>
                            )}

                            {myRating ? (
                              <small className="text-success">&#10003; {myRating} puan verdiniz</small>
                            ) : (
                              <span className="d-flex align-items-center gap-1">
                                <small className="text-muted">Puanla:</small>
                                <StarPicker value={0} onChange={(r) => rateMenuItem(item._id, r)} />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        className="btn btn-danger rounded-pill px-3 fw-bold shadow-sm ms-3"
                        style={{ flexShrink: 0 }}
                        onClick={() => handleAddToCart(item)}
                      >
                        Sepete Ekle
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* --- Yorumlar --- */}
          <div className="comments-section mt-5">
            <h3 className="fw-bold mb-4">
              Yorumlar
              {comments.length > 0 && (
                <small className="text-muted fw-normal ms-2" style={{ fontSize: "1rem" }}>
                  ({comments.length})
                </small>
              )}
            </h3>

            {/* Yorum formu — sadece giriş yapılmışsa */}
            {!token && (
              <div className="alert alert-warning mb-4">
                Yorum yapabilmek için <strong>giriş yapmanız</strong> gerekiyor.
              </div>
            )}
            {token && <div className="mb-4 bg-white p-4 rounded-4 shadow-sm border">
              <label className="form-label fw-bold text-secondary mb-2">Puaniniz:</label>
              <div className="mb-3">
                <StarPicker value={userRating} onChange={setUserRating} />
                <small className="text-muted ms-2">{userRating} / 5</small>
              </div>
              <textarea
                className="form-control mb-3 shadow-none"
                rows="3"
                placeholder="Deneyiminizi paylasin..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              {submitError && (
                <div className="alert alert-danger py-2 mb-3">{submitError}</div>
              )}
              <button
                className="btn btn-primary rounded-pill px-4 fw-bold"
                onClick={submitComment}
                disabled={submitting || !newComment.trim()}
              >
                {submitting ? "Gonderiliyor..." : "Yorum Yap"}
              </button>
            </div>}

            {/* Yorum listesi */}
            {commentsLoading ? (
              <div className="text-center py-3">
                <div className="spinner-border text-success spinner-border-sm" role="status" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-muted text-center py-4">Henuz yorum yapilmamis. Ilk yorumu siz yapin!</p>
            ) : (
              <div className="comment-list">
                {comments.map(c => (
                  <div key={c._id} className="comment-card p-3 mb-3 bg-white border-0 shadow-sm rounded-4 px-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong className="text-dark">{c.user}</strong>
                      <StarDisplay rating={c.rating} />
                    </div>
                    <p className="mb-0 text-muted">{c.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* --- Sepet --- */}
        <div className="col-md-4">
          <div className="cart-sidebar shadow border-0 rounded-4">
            <h3 className="fw-bold">Sepetiniz</h3>
            <hr className="my-3 opacity-10" />
            {cart.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">Sepetiniz henuz bos.</p>
              </div>
            ) : (
              <div className="cart-items">
                {cart.map((item, index) => (
                  <div key={index} className="cart-item-row d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded-3">
                    <span>{item.name}</span>
                    <div className="d-flex align-items-center gap-2">
                      <strong className="text-primary">{item.price} &#8378;</strong>
                      <button
                        onClick={() => onRemoveFromCart(index)}
                        style={{ background: "none", border: "none", color: "#dc3545", cursor: "pointer", fontSize: "16px", padding: "0 4px", lineHeight: 1 }}
                      >&#215;</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="cart-total mt-4">
              <div className="d-flex justify-content-between fw-bold fs-5 mb-3 px-2">
                <span>Toplam:</span>
                <span className="text-danger">{totalAmount} &#8378;</span>
              </div>
              <button
                className={"btn-checkout w-100 py-3 shadow-sm " + (cart.length > 0 ? "active" : "")}
                disabled={cart.length === 0}
                onClick={handleCheckout}
              >
                {cart.length > 0 ? "Odemeye Gec" : "Sepet Bos"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Adres Uyarı Modalı */}
      {showAddressAlert && (
        <div className="custom-modal-overlay overlay-top" style={{ zIndex: 2100 }}>
          <div className="confirm-card text-center p-4 bg-white rounded shadow-lg" style={{ maxWidth: 400 }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>&#128205;</div>
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

      {/* ─── Farklı Restoran Uyarı Modalı ─── */}
      {conflictModal && (
        <div className="custom-modal-overlay overlay-top" style={{ zIndex: 2000 }}>
          <div className="confirm-card text-center p-4 bg-white rounded shadow-lg" style={{ maxWidth: 420 }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>&#128722;</div>
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
                  setConflictModal(null);
                }}>Sepeti Temizle ve Ekle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerShow;