import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import burgerImg from "../assets/burger.png";
import pizzaImg from "../assets/pizza.png";
import pastaImg from "../assets/pasta.png";

const HomePage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(""); // Arama state'i

  const menuItems = [
    {
      id: 1,
      name: "Savora Gurme Burger",
      seller: "Burger Dünyası", // Satıcı eklendi
      rating: 4.8, // Puan eklendi
      description: "Ateş ızgarasında pişmiş dana köfte, karamelize soğan, cheddar peyniri ve özel sos.",
      price: 220,
      image: burgerImg
    },
    {
      id: 2,
      name: "İtalyan Margherita",
      seller: "Pizza Locale",
      rating: 4.5,
      description: "Orijinal İtalyan tarifiyle odun ateşinde pişirilmiş, taze fesleğen ve mozzarella peyniri.",
      price: 180,
      image: pizzaImg
    },
    {
      id: 3,
      name: "Kremalı Fettuccine Alfredo",
      seller: "Pasta House",
      rating: 4.9,
      description: "Özel krema sosu, parmesan peyniri parçaları ve taze maydanoz eşliğinde enfes makarna.",
      price: 195,
      image: pastaImg
    }
  ];

  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const totalAmount = cart.reduce((acc, curr) => acc + curr.price, 0);

  // Filtreleme mantığı: Ürün adı veya Satıcı adına göre ara
  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.seller.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="home-page-container container min-vh-100">
      {/* Arama Çubuğu Bölümü */}
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
        {/* Sol Taraf: Menü Listesi */}
        <div className="col-md-8">
          <h2 className="section-title mb-4">Günün Menüsü</h2>
          <div className="menu-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="menu-card">
                <div className="card-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="card-info">
                  <div className="seller-info">
                    <span className="seller-name">{item.seller}</span>
                    <span className="seller-rating">⭐ {item.rating}</span>
                  </div>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <div className="card-footer">
                    <span className="price">{item.price} ₺</span>
                    <button
                      className="btn-add-cart"
                      onClick={() => addToCart(item)}
                    >
                      Sepete Ekle
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredItems.length === 0 && (
            <p className="mt-4 text-center text-muted">Aradığınız kriterlere uygun ürün bulunamadı.</p>
          )}
        </div>

        {/* Sağ Taraf: Sepet Paneli */}
        <div className="col-md-4">
          <div className="cart-sidebar">
            <h3>Sepetiniz</h3>
            <hr />

            {cart.length === 0 ? (
              <div className="empty-cart-msg">
                <p>Sepetiniz şu an boş. Hemen lezzetli bir şeyler seçin!</p>
              </div>
            ) : (
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
              <div className="d-flex justify-content-between fw-bold">
                <span>Toplam:</span>
                <span>{totalAmount} ₺</span>
              </div>
              <button
                className="btn-checkout mt-3"
                disabled={cart.length === 0}
                onClick={() => navigate("/payment", { state: { amount: totalAmount } })}
              >
                Ödemeye Geç
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;