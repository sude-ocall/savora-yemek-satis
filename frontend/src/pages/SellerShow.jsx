import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const SellerShow = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [cart, setCart] = useState(location.state?.currentCart || []);
  const [comments, setComments] = useState([
    { id: 1, user: "Ahmet", text: "Harika burgerler!", rating: 5 },
  ]);
  const [newComment, setNewComment] = useState("");
  
  const sellerInfo = { name: "Burger Dünyası", rating: 4.8, description: "En iyi gurme burgerler." };
  const sellerMenu = [
    { id: 1, name: "Savora Gurme Burger", price: 220 },
    { id: 10, name: "Klasik Burger", price: 180 }
  ];

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  const handleGoBack = () => {
    navigate("/", { state: { updatedCart: cart } });
  };

  const submitComment = () => {
    if(!newComment) return;
    setComments([...comments, { id: Date.now(), user: "Siz", text: newComment, rating: 5 }]);
    setNewComment("");
  };

  const totalAmount = cart.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="seller-show-container container py-5">
      <button className="btn btn-link mb-3 text-dark text-decoration-none fw-bold" onClick={handleGoBack}>← Geri Dön</button>
      
      <div className="seller-header p-4 bg-dark text-white rounded-4 mb-5">
        <h1>{sellerInfo.name}</h1>
        <p className="lead">{sellerInfo.description}</p>
        <span className="badge bg-warning text-dark">⭐ {sellerInfo.rating}</span>
      </div>

      <div className="row">
        <div className="col-md-8">
          <h3 className="mb-4 fw-bold">Menü</h3>
          <div className="list-group shadow-sm rounded-4 overflow-hidden">
            {sellerMenu.map(item => (
              <div key={item.id} className="list-group-item d-flex justify-content-between align-items-center p-3 border-0 border-bottom">
                <div>
                  <h5 className="mb-1 fw-bold">{item.name}</h5>
                  <span className="fw-bold text-success">{item.price} ₺</span>
                </div>
                <button className="btn btn-danger rounded-pill px-4" onClick={() => addToCart(item)}>Sepete Ekle</button>
              </div>
            ))}
          </div>

          <div className="comments-section mt-5">
            <h3 className="fw-bold mb-4">Yorumlar</h3>
            <div className="mb-4 bg-light p-3 rounded-4">
              <textarea 
                className="form-control mb-2 border-0 shadow-none" 
                rows="3"
                placeholder="Yorumunuzu yazın..." 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button className="btn btn-primary rounded-pill px-4" onClick={submitComment}>Yorum Yap</button>
            </div>
            <div className="comment-list">
              {comments.map(c => (
                <div key={c.id} className="comment-card p-3 mb-2 bg-white border rounded-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <strong className="text-primary">{c.user}</strong>
                    <span className="text-warning">{"⭐".repeat(c.rating)}</span>
                  </div>
                  <p className="mb-0 text-muted">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="cart-sidebar shadow-sm">
            <h3 className="fw-bold">Sepetiniz</h3>
            <hr />
            {cart.length === 0 ? (
              <p className="text-muted text-center py-4">Sepetiniz henüz boş.</p>
            ) : (
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
              <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                <span>Toplam:</span>
                <span>{totalAmount} ₺</span>
              </div>
              
              <button 
                className={`btn-checkout w-100 ${cart.length > 0 ? 'active' : ''}`}
                disabled={cart.length === 0}
                onClick={handleGoBack}
              >
                {cart.length > 0 ? 'Sepeti Onayla ve Dön' : 'Ödemeye Geç'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerShow;