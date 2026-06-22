import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const totalAmount = location.state?.amount || 0;

    const [paymentMethod, setPaymentMethod] = useState("card");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // --- Kart State'leri ---
    const [savedCards, setSavedCards] = useState([
        { id: 1, title: "Maaş Kartım (Visa)", lastFour: "4242", expiry: "12/28", name: "İrem Yaşlı" },
        { id: 2, title: "Bonus Genç (Master)", lastFour: "9012", expiry: "05/27", name: "İrem Yaşlı" }
    ]);
    
    const [selectedCardId, setSelectedCardId] = useState("new"); // "new" veya kart ID'si
    const [saveThisCard, setSaveThisCard] = useState(false);

    // Form State'leri
    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cardName, setCardName] = useState("");
    const [cvv, setCvv] = useState("");

    // Kayıtlı kart seçildiğinde formu doldur/temizle
    useEffect(() => {
        if (selectedCardId !== "new") {
            const card = savedCards.find(c => c.id === parseInt(selectedCardId));
            setCardNumber(`**** **** **** ${card.lastFour}`);
            setExpiryDate(card.expiry);
            setCardName(card.name);
            setCvv(""); // Güvenlik gereği CVV boş kalır
        } else {
            setCardNumber("");
            setExpiryDate("");
            setCardName("");
            setCvv("");
        }
    }, [selectedCardId, savedCards]);

    const handleCardNumberChange = (e) => {
        if (selectedCardId !== "new") return; // Kayıtlı kartsa müdahale etme
        let value = e.target.value.replace(/\D/g, "");
        let formattedValue = value.match(/.{1,4}/g)?.join(" ") || "";
        if (formattedValue.length <= 19) setCardNumber(formattedValue);
    };

    const handleExpiryChange = (e) => {
        if (selectedCardId !== "new") return;
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 4) value = value.substring(0, 4);
        let formatted = value;
        if (value.length > 2) formatted = value.substring(0, 2) + "/" + value.substring(2);
        setExpiryDate(formatted);
    };

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
            if (selectedCardId === "new") {
                if (!validateExpiry(expiryDate)) {
                    alert("Lütfen geçerli bir son kullanma tarihi giriniz.");
                    return;
                }

                // KART KAYITLI MI KONTROLÜ
                const lastFour = cardNumber.replace(/\s/g, "").slice(-4);
                const isAlreadySaved = savedCards.some(c => c.lastFour === lastFour);

                if (saveThisCard && isAlreadySaved) {
                    alert("Bu kart zaten kayıtlı kartlarınız arasında bulunuyor.");
                } else if (saveThisCard) {
                    console.log("Yeni kart sisteme kaydedildi...");
                    // Burada gerçek bir senaryoda API'ye kayıt isteği atılır.
                }
            }
        }

        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
        }, 2500);
    };

    if (isSuccess) {
        return (
            <div className="payment-success-container min-vh-100 d-flex align-items-center justify-content-center">
                <div className="success-card text-center shadow-lg p-5 rounded-4 bg-white" style={{maxWidth: 450}}>
                    <div className="success-icon fs-1 mb-3">✅</div>
                    <h2 className="fw-bold">Siparişiniz Alındı!</h2>
                    <p className="text-muted">Lezzetli yemeğiniz hazırlanmaya başlandı bile.</p>
                    <button className="btn btn-warning w-100 py-3 fw-bold mt-4" onClick={() => navigate("/")}>
                        Ana Sayfaya Dön
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 py-5 bg-light">
            <div className="payment-page-container container">
                <div className="payment-card shadow-sm border-0 bg-white p-4 rounded-4 mx-auto" style={{maxWidth: 600}}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="h4 m-0 fw-bold">Ödeme Seçenekleri</h2>
                        <span className="badge bg-success px-3 py-2 fs-6">{totalAmount} ₺</span>
                    </div>

                    <div className="payment-tabs d-flex gap-2 mb-4">
                        <button 
                            className={`btn flex-grow-1 py-2 ${paymentMethod === "card" ? "btn-dark" : "btn-outline-dark"}`}
                            onClick={() => setPaymentMethod("card")}
                        > 💳 Kart </button>
                        <button 
                            className={`btn flex-grow-1 py-2 ${paymentMethod === "door" ? "btn-dark" : "btn-outline-dark"}`}
                            onClick={() => setPaymentMethod("door")}
                        > 🏠 Kapıda </button>
                    </div>

                    <form onSubmit={handlePayment}>
                        {paymentMethod === "card" ? (
                            <div className="card-payment-content fade-in">
                                {/* Kayıtlı Kart Seçimi Dropdown */}
                                <div className="card-selection-area mb-4">
                                    <label className="small fw-bold text-muted">Ödeme Yapılacak Kart</label>
                                    <select 
                                        className="modern-select" 
                                        value={selectedCardId}
                                        onChange={(e) => setSelectedCardId(e.target.value)}
                                    >
                                        <option value="new">+ Yeni Kart Kullan</option>
                                        {savedCards.map(card => (
                                            <option key={card.id} value={card.id}>
                                                {card.title} (**** {card.lastFour})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="card-form-grid row g-3">
                                    <div className="col-12">
                                        <label className="small fw-bold">Kart Üzerindeki İsim</label>
                                        <input type="text" className="form-control" placeholder="Ad Soyad" value={cardName} onChange={(e) => setCardName(e.target.value)} disabled={selectedCardId !== "new"} required />
                                    </div>
                                    <div className="col-12">
                                        <label className="small fw-bold">Kart Numarası</label>
                                        <input type="text" className="form-control" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={handleCardNumberChange} disabled={selectedCardId !== "new"} required />
                                    </div>
                                    <div className="col-6">
                                        <label className="small fw-bold">Son Kullanma</label>
                                        <input type="text" className="form-control" placeholder="AA/YY" value={expiryDate} onChange={handleExpiryChange} disabled={selectedCardId !== "new"} required />
                                    </div>
                                    <div className="col-6">
                                        <label className="small fw-bold">CVV</label>
                                        <input type="password" className="form-control" placeholder="***" maxLength="3" value={cvv} onChange={(e) => setCvv(e.target.value)} required />
                                    </div>

                                    {/* Yeni Kart Kaydetme Checkbox'ı */}
                                    {selectedCardId === "new" && (
                                        <div className="col-12 mt-3">
                                            <label className="save-card-check">
                                                <input 
                                                    type="checkbox" 
                                                    checked={saveThisCard} 
                                                    onChange={(e) => setSaveThisCard(e.target.checked)} 
                                                />
                                                Bu kartı sonraki alışverişlerim için güvenle kaydet.
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="door-info p-4 border rounded-3 bg-light text-center">
                                💡 Ödemenizi kapıda <strong>Nakit</strong> veya <strong>Kredi Kartı</strong> ile yapabilirsiniz.
                            </div>
                        )}

                        <button type="submit" className="btn btn-warning w-100 mt-4 py-3 fw-bold shadow-sm" disabled={isProcessing}>
                            {isProcessing ? "İşleniyor..." : (paymentMethod === "card" ? `Ödemeyi Tamamla (${totalAmount} ₺)` : `Siparişi Onayla (${totalAmount} ₺)`)}
                        </button>
                    </form>
                </div>

                {isProcessing && (
                    <div className="processing-overlay shadow-lg" style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(255,255,255,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000}}>
                        <div className="text-center">
                            <div className="spinner-border text-success mb-3" role="status"></div>
                            <p className="fw-bold">Ödemeniz güvenli şekilde işleniyor...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentPage;