import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BackendDataService from "../services/BackendDataServices";

const PaymentPage = ({ token, onClearCart }) => {
  const navigate    = useNavigate();
  const location    = useLocation();

  const totalAmount = location.state?.amount   || 0;
  const cart        = location.state?.cart     || [];
  const fromOffer   = location.state?.fromOffer || false;
  // Teklif kabul akışında offerData gelir: { offerId, restaurantId, price }
  const offerData   = location.state?.offerData || null;

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing]   = useState(false);
  const [isSuccess, setIsSuccess]         = useState(false);
  const [orderError, setOrderError]       = useState("");

  const [savedCards, setSavedCards]         = useState([]);
  const [selectedCardId, setSelectedCardId] = useState("new");
  const [saveThisCard, setSaveThisCard]     = useState(false);

  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cardName, setCardName]     = useState("");
  const [cvv, setCvv]               = useState("");

  // ─── Kullanıcının kayıtlı kartlarını DB'den çek ───
  useEffect(() => {
    if (!token) return;
    BackendDataService.getUserProfile(token)
      .then(res => {
        const cards = res.data.user?.creditCards || [];
        setSavedCards(
          cards.map((c, i) => ({
            id: i,
            title: "Kayıtlı Kart",
            lastFour: c.last4,
            expiry: c.expiryDate,
            name: ""
          }))
        );
      })
      .catch(() => {});
  }, [token]);

  // ─── Kayıtlı kart seçilince alanları doldur ───
  useEffect(() => {
    if (selectedCardId !== "new") {
      const card = savedCards.find(c => c.id === parseInt(selectedCardId));
      if (card) {
        setCardNumber(`**** **** **** ${card.lastFour}`);
        setExpiryDate(card.expiry);
        setCardName(card.name || "");
        setCvv("");
      }
    } else {
      setCardNumber("");
      setExpiryDate("");
      setCardName("");
      setCvv("");
    }
  }, [selectedCardId, savedCards]);

  const handleCardNumberChange = (e) => {
    if (selectedCardId !== "new") return;
    let value = e.target.value.replace(/\D/g, "");
    let formatted = value.match(/.{1,4}/g)?.join(" ") || "";
    if (formatted.length <= 19) setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    if (selectedCardId !== "new") return;
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.substring(0, 4);
    setExpiryDate(
      value.length > 2
        ? value.substring(0, 2) + "/" + value.substring(2)
        : value
    );
  };

  const validateExpiry = (date) => {
    if (date.length !== 5) return false;
    const [month, year] = date.split("/").map(Number);
    const now = new Date();
    const cm  = now.getMonth() + 1;
    const cy  = parseInt(now.getFullYear().toString().slice(-2));
    return !(month < 1 || month > 12 || year < cy || (year === cy && month < cm));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setOrderError("");

    if (
      paymentMethod === "card" &&
      selectedCardId === "new" &&
      !validateExpiry(expiryDate)
    ) {
      setOrderError("Lütfen geçerli bir son kullanma tarihi giriniz.");
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Sepetten sipariş oluştur (normal akış)
      if (!fromOffer && cart.length > 0 && token) {
        const menu = cart.map(item => ({ productId: item._id, quantity: 1 }));
        await BackendDataService.createOrder({ menu }, token);
      }

      // 2. Teklif kabul akışı → ödeme başarısında acceptOffer çağır
      if (fromOffer && offerData) {
        await BackendDataService.acceptOffer(
          {
            offerId:      offerData.offerId,
            restaurantId: offerData.restaurantId,
            price:        offerData.price,
            note:         offerData.note || ""
          },
          token
        );
        // Aktif isteği localStorage'dan temizle
        localStorage.removeItem("savora_active_request");
      }

      // 3. Yeni kart "kaydet" işaretliyse DB'ye ekle
      if (paymentMethod === "card" && selectedCardId === "new" && saveThisCard) {
        const rawNumber = cardNumber.replace(/\s/g, "");
        const last4 = rawNumber.slice(-4);
        await BackendDataService.addCreditCard(
          { cardHash: rawNumber, last4, expiryDate },
          token
        );
      }

      // 4. Sepeti temizle
      localStorage.removeItem("savora_cart");
      if (onClearCart) onClearCart();

      // 5. Başarı
      setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);
      }, 2000);

    } catch (err) {
      setIsProcessing(false);
      setOrderError(
        err.response?.data?.message || "Sipariş oluşturulurken bir hata oluştu."
      );
    }
  };

  // ─── Başarı ekranı ───
  if (isSuccess) {
    return (
      <div
        className="payment-success-container min-vh-100 d-flex align-items-center justify-content-center"
      >
        <div
          className="success-card text-center shadow-lg p-5 rounded-4 bg-white"
          style={{ maxWidth: 450 }}
        >
          <div className="success-icon fs-1 mb-3">✅</div>
          <h2 className="fw-bold">Siparişiniz Alındı!</h2>
          <p className="text-muted">Lezzetli yemeğiniz hazırlanmaya başlandı bile.</p>
          <button
            className="btn btn-warning w-100 py-3 fw-bold mt-4"
            onClick={() => navigate("/home")}
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 py-5 bg-light">
      <div className="payment-page-container container">
        <div
          className="payment-card shadow-sm border-0 bg-white p-4 rounded-4 mx-auto"
          style={{ maxWidth: 600 }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="h4 m-0 fw-bold">Ödeme Seçenekleri</h2>
            <span className="badge bg-success px-3 py-2 fs-6">{totalAmount} ₺</span>
          </div>

          {orderError && (
            <div className="alert alert-danger py-2 mb-3">{orderError}</div>
          )}

          <div className="payment-tabs d-flex gap-2 mb-4">
            <button
              className={`btn flex-grow-1 py-2 ${paymentMethod === "card" ? "btn-dark" : "btn-outline-dark"}`}
              onClick={() => setPaymentMethod("card")}
            >
              💳 Kart
            </button>
            <button
              className={`btn flex-grow-1 py-2 ${paymentMethod === "door" ? "btn-dark" : "btn-outline-dark"}`}
              onClick={() => setPaymentMethod("door")}
            >
              🏠 Kapıda
            </button>
          </div>

          <form onSubmit={handlePayment}>
            {paymentMethod === "card" ? (
              <div className="card-payment-content fade-in">
                {savedCards.length > 0 && (
                  <div className="card-selection-area mb-4">
                    <label className="small fw-bold text-muted">
                      Ödeme Yapılacak Kart
                    </label>
                    <select
                      className="modern-select"
                      value={selectedCardId}
                      onChange={e => setSelectedCardId(e.target.value)}
                    >
                      <option value="new">+ Yeni Kart Kullan</option>
                      {savedCards.map(card => (
                        <option key={card.id} value={card.id}>
                          Kayıtlı Kart (**** {card.lastFour}) — {card.expiry}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="card-form-grid row g-3">
                  <div className="col-12">
                    <label className="small fw-bold">Kart Üzerindeki İsim</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ad Soyad"
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                      disabled={selectedCardId !== "new"}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="small fw-bold">Kart Numarası</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      disabled={selectedCardId !== "new"}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="small fw-bold">Son Kullanma</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="AA/YY"
                      value={expiryDate}
                      onChange={handleExpiryChange}
                      disabled={selectedCardId !== "new"}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="small fw-bold">CVV</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="***"
                      maxLength="3"
                      value={cvv}
                      onChange={e => setCvv(e.target.value)}
                      required
                    />
                  </div>
                  {selectedCardId === "new" && (
                    <div className="col-12 mt-3">
                      <label
                        className="save-card-check"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          cursor: "pointer"
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={saveThisCard}
                          onChange={e => setSaveThisCard(e.target.checked)}
                        />
                        Bu kartı sonraki alışverişlerim için güvenle kaydet.
                      </label>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="door-info p-4 border rounded-3 bg-light text-center">
                💡 Ödemenizi kapıda{" "}
                <strong>Nakit</strong> veya{" "}
                <strong>Kredi Kartı</strong> ile yapabilirsiniz.
              </div>
            )}

            <button
              type="submit"
              className="btn btn-warning w-100 mt-4 py-3 fw-bold shadow-sm"
              disabled={isProcessing}
            >
              {isProcessing
                ? "İşleniyor..."
                : paymentMethod === "card"
                  ? `Ödemeyi Tamamla (${totalAmount} ₺)`
                  : `Siparişi Onayla (${totalAmount} ₺)`}
            </button>
          </form>
        </div>

        {/* ─── İşlem Spinner ─── */}
        {isProcessing && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(255,255,255,0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000
            }}
          >
            <div className="text-center">
              <div
                className="spinner-border text-success mb-3"
                role="status"
              ></div>
              <p className="fw-bold">Ödemeniz güvenli şekilde işleniyor...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;