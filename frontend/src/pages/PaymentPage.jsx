import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const totalAmount = location.state?.amount || 0;

    const [paymentMethod, setPaymentMethod] = useState("card");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Form State'leri
    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cardName, setCardName] = useState("");
    const [cvv, setCvv] = useState("");

    // Kart Numarası Formatlama (1111 2222 3333 4444)
    const handleCardNumberChange = (e) => {
        let value = e.target.value.replace(/\D/g, ""); // Sadece rakamlar
        let formattedValue = value.match(/.{1,4}/g)?.join(" ") || "";
        if (formattedValue.length <= 19) {
            setCardNumber(formattedValue);
        }
    };

    // Tarih Formatlama (MM/YY)
    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 4) value = value.substring(0, 4);

        let formatted = value;
        if (value.length > 2) {
            formatted = value.substring(0, 2) + "/" + value.substring(2);
        }
        setExpiryDate(formatted);
    };

    // Tarih Doğrulama Mantığı
    const validateExpiry = (date) => {
        if (date.length !== 5) return false;
        
        const [month, year] = date.split("/").map(Number);
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = parseInt(now.getFullYear().toString().slice(-2));

        if (month < 1 || month > 12) return false;
        if (year < currentYear) return false;
        if (year === currentYear && month < currentMonth) return false;

        return true;
    };

    const handlePayment = (e) => {
        e.preventDefault();

        if (paymentMethod === "card") {
            if (!validateExpiry(expiryDate)) {
                alert("Lütfen geçerli bir son kullanma tarihi giriniz (Gelecek bir tarih olmalı).");
                return;
            }
        }

        setIsProcessing(true);
        // Ödeme simülasyonu
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
        }, 2500);
    };

    if (isSuccess) {
        return (
            <div className="payment-success-container min-vh-100">
                <div className="success-card">
                    <div className="success-icon">✅</div>
                    <h2>Siparişiniz Alındı!</h2>
                    <p>Lezzetli yemeğiniz hazırlanmaya başlandı bile.</p>
                    <button className="btn-hero-yellow w-100" onClick={() => navigate("/home")}>
                        Ana Sayfaya Dön
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100">
            <div className="payment-page-container container">
                <div className="payment-card">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="m-0">Ödeme Seçenekleri</h2>
                        <span className="badge bg-success fs-6">{totalAmount} ₺</span>
                    </div>

                    <div className="payment-tabs mb-4">
                        <button
                            className={`payment-tab ${paymentMethod === "card" ? "active" : ""}`}
                            onClick={() => setPaymentMethod("card")}
                        >
                            💳 Kart ile Öde
                        </button>
                        <button
                            className={`payment-tab ${paymentMethod === "door" ? "active" : ""}`}
                            onClick={() => setPaymentMethod("door")}
                        >
                            🏠 Kapıda Öde
                        </button>
                    </div>

                    <form onSubmit={handlePayment}>
                        {paymentMethod === "card" ? (
                            <div className="card-form-grid">
                                <div className="input-group full">
                                    <label>Kart Üzerindeki İsim</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ad Soyad" 
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="input-group full">
                                    <label>Kart Numarası</label>
                                    <input 
                                        type="text" 
                                        placeholder="0000 0000 0000 0000" 
                                        value={cardNumber}
                                        onChange={handleCardNumberChange}
                                        required 
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Son Kullanma</label>
                                    <input 
                                        type="text" 
                                        placeholder="AA/YY" 
                                        value={expiryDate}
                                        onChange={handleExpiryChange}
                                        required 
                                    />
                                </div>
                                <div className="input-group">
                                    <label>CVV</label>
                                    <input 
                                        type="password" 
                                        placeholder="***" 
                                        maxLength="3" 
                                        value={cvv}
                                        onChange={(e) => setCvv(e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="door-info">
                                <div className="info-box">
                                    💡 Ödemenizi kapıda nakit veya kredi kartı ile yapabilirsiniz.
                                </div>
                            </div>
                        )}

                        <button type="submit" className="btn-checkout mt-4">
                            {paymentMethod === "card" ? `Ödemeyi Tamamla (${totalAmount} ₺)` : `Siparişi Onayla (${totalAmount} ₺)`}
                        </button>
                    </form>
                </div>

                {isProcessing && (
                    <div className="processing-overlay">
                        <div className="loader-box">
                            <div className="spinner"></div>
                            <p>Ödemeniz işleniyor, lütfen bekleyin...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentPage;