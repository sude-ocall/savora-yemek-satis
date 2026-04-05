import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import BackendDataService from "../services/BackendDataServices";

const SellerShow = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [cart, setCart]           = useState(location.state?.currentCart || []);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [sellerMenu, setSellerMenu] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [comments, setComments]   = useState([
    { id: 1, user: "Ahmet", text: "Harika burgerler!", rating: 5 }
  ]);
  const [newComment, setNewComment] = useState("");
  const [userRating, setUserRating] = useState(5);

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
        console.error("Satıcı verileri yüklenemedi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const addToCart = (item) => setCart([...cart, item]);

  const submitComment = () => {
    if (!newComment) return;
    setComments([{ id: Date.now(), user: "Siz", text: newComment, rating: userRating }, ...comments]);
    setNewComment("");
    setUserRating(5);
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
        <h4>Restoran bulunamadı.</h4>
        <button className="btn btn-dark mt-3" onClick={() => navigate("/home")}>Geri Dön</button>
      </div>
    );
  }

  return (
    <div className="seller-show-container container py-5">
      <button className="btn btn-link mb-3 text-dark text-decoration-none fw-bold" onClick={() => navigate("/home", { state: { updatedCart: cart } })}>
        ← Geri Dön
      </button>

      <div className="seller-header p-4 bg-dark text-white rounded-4 mb-5 shadow">
        <h1>{sellerInfo.restaurantName}</h1>
        <p className="lead">{sellerInfo.email}</p>
      </div>

      <div className="row g-4">
        {/* Menu */}
        <div className="col-md-8">
          <h3 className="mb-4 fw-bold">Menü</h3>
          {sellerMenu.length === 0
            ? <p className="text-muted">Bu restoranın henüz ürünü yok.</p>
            : (
              <div className="list-group shadow-sm rounded-4 overflow-hidden border-0">
                {sellerMenu.map(item => (
                  <div key={item._id} className="list-group-item d-flex justify-content-between align-items-center p-4 border-0 border-bottom">
                    <div className="d-flex align-items-center gap-3">
                      {item.imgURL && (
                        <img src={item.imgURL} alt={item.name} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }} />
                      )}
                      <div>
                        <h5 className="mb-1 fw-bold">{item.name}</h5>
                        <small className="text-muted">{item.description}</small>
                        <div className="fw-bold text-success fs-5 mt-1">{item.price} ₺</div>
                      </div>
                    </div>
                    <button className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm" onClick={() => addToCart(item)}>
                      Sepete Ekle
                    </button>
                  </div>
                ))}
              </div>
            )
          }

          {/* Comments */}
          <div className="comments-section mt-5">
            <h3 className="fw-bold mb-4">Yorumlar</h3>
            <div className="mb-4 bg-white p-4 rounded-4 shadow-sm border">
              <label className="form-label fw-bold text-secondary mb-1">Puanınız:</label>
              <div className="star-rating">
                {[5, 4, 3, 2, 1].map(num => (
                  <React.Fragment key={num}>
                    <input type="radio" id={`star-${num}`} name="rating" value={num} checked={userRating === num} onChange={() => setUserRating(num)} />
                    <label htmlFor={`star-${num}`}>★</label>
                  </React.Fragment>
                ))}
              </div>
              <textarea className="form-control comment-input-area mb-3 shadow-none" rows="3" placeholder="Deneyiminizi paylaşın..." value={newComment} onChange={e => setNewComment(e.target.value)} />
              <button className="btn btn-primary rounded-pill px-4 fw-bold" onClick={submitComment}>Yorum Yap</button>
            </div>
            <div className="comment-list">
              {comments.map(c => (
                <div key={c.id} className="comment-card p-3 mb-3 bg-white border-0 shadow-sm rounded-4 px-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong className="text-dark">{c.user}</strong>
                    <span className="text-warning">{"★".repeat(c.rating)}{"☆".repeat(5 - c.rating)}</span>
                  </div>
                  <p className="mb-0 text-muted">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cart */}
        <div className="col-md-4">
          <div className="cart-sidebar shadow border-0 rounded-4">
            <h3 className="fw-bold">Sepetiniz</h3>
            <hr className="my-3 opacity-10" />
            {cart.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-cart-x text-muted fs-1 d-block mb-2"></i>
                <p className="text-muted">Sepetiniz henüz boş.</p>
              </div>
            ) : (
              <div className="cart-items">
                {cart.map((item, index) => (
                  <div key={index} className="cart-item-row d-flex justify-content-between mb-2 p-2 bg-light rounded-3">
                    <span>{item.name}</span>
                    <strong className="text-primary">{item.price} ₺</strong>
                  </div>
                ))}
              </div>
            )}
            <div className="cart-total mt-4">
              <div className="d-flex justify-content-between fw-bold fs-5 mb-3 px-2">
                <span>Toplam:</span>
                <span className="text-danger">{totalAmount} ₺</span>
              </div>
              <button
                className={`btn-checkout w-100 py-3 shadow-sm ${cart.length > 0 ? "active" : ""}`}
                disabled={cart.length === 0}
                onClick={() => navigate("/payment", { state: { amount: totalAmount, cart } })}
              >
                {cart.length > 0 ? "Ödemeye Geç" : "Sepet Boş"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerShow;