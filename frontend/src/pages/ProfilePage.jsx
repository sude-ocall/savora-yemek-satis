import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("profile");

    // --- State Yönetimi ---
    const [userInfo, setUserInfo] = useState({
        fullName: "İrem Yaşlı",
        email: "iremyasli@savora.com",
        phone: "0555 123 45 67"
    });

    const [addresses, setAddresses] = useState([
        { id: 1, title: "Ev Adresi", detail: "İstanbul, Kadıköy, Caferağa Mah. Moda Cad. No: 34" },
        { id: 2, title: "İş Adresi", detail: "İstanbul, Beşiktaş, Vişnezade Mah. Süleyman Seba Cad. No: 40" },
        { id: 3, title: "Yazlık", detail: "Muğla, Bodrum, Yalıkavak Mah. Günbatımı Sok. No: 12" }
    ]);

    const [orders] = useState([
        { id: "#SV9821", date: "12 Mart 2026", total: "450.00 TL", status: "Tamamlandı", items: "Vegan Burger, Lime Soda" },
        { id: "#SV9745", date: "05 Mart 2026", total: "210.00 TL", status: "Yolda", items: "Kinoa Salatası" },
        { id: "#SV9612", date: "01 Mart 2026", total: "185.00 TL", status: "Tamamlandı", items: "Avokado Toast" }
    ]);

    const [cards, setCards] = useState([
        { id: 1, brand: "Visa", lastFour: "4242", expiry: "12/28" }
    ]);

    // --- Modal & Form State'leri ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showCardModal, setShowCardModal] = useState(false);
    
    // Şifre State
    const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
    
    // Yeni Kart State
    const [newCard, setNewCard] = useState({ holder: "", number: "", expiry: "", cvc: "" });

    // --- Profil Düzenleme ---
    const [isEditing, setIsEditing] = useState(false);
    const [tempUserInfo, setTempUserInfo] = useState({ ...userInfo });

    const handleUpdatePassword = (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            alert("Yeni şifreler eşleşmiyor!");
            return;
        }
        alert("Şifreniz başarıyla güncellendi!");
        setPasswords({ current: "", new: "", confirm: "" });
    };

    const handleAddCard = (e) => {
        e.preventDefault();
        const lastFour = newCard.number.slice(-4);
        setCards([...cards, { id: Date.now(), brand: "Mastercard", lastFour, expiry: newCard.expiry }]);
        setShowCardModal(false);
        setNewCard({ holder: "", number: "", expiry: "", cvc: "" });
    };

    return (
        <div className="profile-page-container container py-5 min-vh-100">
            <div className="row">
                {/* SOL SİDEBAR */}
                <div className="col-md-4 col-lg-3">
                    <div className="profile-sidebar shadow-sm bg-white rounded-4 p-4 mb-4">
                        <div className="text-center mb-4">
                            <div className="avatar-circle bg-success text-white mx-auto mb-2 d-flex align-items-center justify-content-center fw-bold" style={{width:60, height:60, borderRadius:'50%', fontSize:20}}>IY</div>
                            <h5 className="mb-0">{userInfo.fullName}</h5>
                            <small className="text-muted">{userInfo.email}</small>
                        </div>
                        <div className="d-flex flex-column gap-1 sidebar-menu">
                            <button className={`btn text-start ${activeTab === "profile" ? "btn-light text-success fw-bold" : ""}`} onClick={() => setActiveTab("profile")}>👤 Profil</button>
                            <button className={`btn text-start ${activeTab === "orders" ? "btn-light text-success fw-bold" : ""}`} onClick={() => setActiveTab("orders")}>📦 Siparişlerim</button>
                            <button className={`btn text-start ${activeTab === "addresses" ? "btn-light text-success fw-bold" : ""}`} onClick={() => setActiveTab("addresses")}>📍 Adreslerim</button>
                            <button className={`btn text-start ${activeTab === "payments" ? "btn-light text-success fw-bold" : ""}`} onClick={() => setActiveTab("payments")}>💳 Ödemeler</button>
                            <button className={`btn text-start ${activeTab === "password" ? "btn-light text-success fw-bold" : ""}`} onClick={() => setActiveTab("password")}>🔑 Güvenlik</button>
                            <hr />
                            <button className="btn text-start text-danger" onClick={() => setShowDeleteModal(true)}>🗑️ Hesabı Sil</button>
                        </div>
                    </div>
                </div>

                {/* SAĞ İÇERİK */}
                <div className="col-md-8 col-lg-9">
                    <div className="profile-content-card shadow-sm bg-white rounded-4 p-4">
                        
                        {/* PROFİL */}
                        {activeTab === "profile" && (
                            <div className="fade-in">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="m-0">Profil Bilgileri</h4>
                                    {!isEditing ? (
                                        <button className="btn btn-outline-dark btn-sm" onClick={() => setIsEditing(true)}>Düzenle</button>
                                    ) : (
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-success btn-sm" onClick={() => {setUserInfo(tempUserInfo); setIsEditing(false)}}>Kaydet</button>
                                            <button className="btn btn-light btn-sm" onClick={() => setIsEditing(false)}>İptal</button>
                                        </div>
                                    )}
                                </div>
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="small fw-bold">Ad Soyad</label>
                                        <input type="text" className="form-control" value={isEditing ? tempUserInfo.fullName : userInfo.fullName} onChange={(e)=>setTempUserInfo({...tempUserInfo, fullName: e.target.value})} disabled={!isEditing} />
                                    </div>
                                    <div className="col-12">
                                        <label className="small fw-bold">E-posta</label>
                                        <input type="text" className="form-control bg-light" value={userInfo.email} disabled />
                                    </div>
                                    <div className="col-12">
                                        <label className="small fw-bold">Telefon</label>
                                        <input type="text" className="form-control" value={isEditing ? tempUserInfo.phone : userInfo.phone} onChange={(e)=>setTempUserInfo({...tempUserInfo, phone: e.target.value})} disabled={!isEditing} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SİPARİŞ GEÇMİŞİ (SCROLLABLE) */}
                        {activeTab === "orders" && (
                            <div className="fade-in">
                                <h4 className="mb-4">Sipariş Geçmişi</h4>
                                <div className="scrollable-content">
                                    {orders.map(o => (
                                        <div key={o.id} className="border rounded-3 p-3 mb-3">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="fw-bold">{o.id}</span>
                                                <span className="badge bg-light text-dark">{o.status}</span>
                                            </div>
                                            <div className="d-flex justify-content-between small text-muted">
                                                <span>{o.items}</span>
                                                <span className="fw-bold text-dark">{o.total}</span>
                                            </div>
                                            <div className="mt-2 small text-muted">{o.date}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ADRESLER (SCROLLABLE) */}
                        {activeTab === "addresses" && (
                            <div className="fade-in">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="m-0">Adreslerim</h4>
                                    <button className="btn btn-warning btn-sm" onClick={() => setShowAddressModal(true)}>+ Yeni Ekle</button>
                                </div>
                                <div className="scrollable-content">
                                    {addresses.map(a => (
                                        <div key={a.id} className="border rounded-3 p-3 mb-3 d-flex justify-content-between align-items-center">
                                            <div>
                                                <div className="fw-bold">{a.title}</div>
                                                <div className="small text-muted">{a.detail}</div>
                                            </div>
                                            <button className="btn btn-link text-danger btn-sm text-decoration-none" onClick={() => setAddresses(addresses.filter(x => x.id !== a.id))}>Sil</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ÖDEME YÖNTEMLERİ (SCROLLABLE) */}
                        {activeTab === "payments" && (
                            <div className="fade-in">
                                <h4 className="mb-4">Ödeme Yöntemleri</h4>
                                <div className="scrollable-content">
                                    {cards.map(c => (
                                        <div key={c.id} className="payment-card-item">
                                            <div className="d-flex align-items-center gap-3">
                                                <span style={{fontSize:24}}>💳</span>
                                                <div>
                                                    <div className="card-masked-no">**** **** **** {c.lastFour}</div>
                                                    <small className="text-muted">{c.brand} | {c.expiry}</small>
                                                </div>
                                            </div>
                                            <button className="btn btn-sm text-danger" onClick={() => setCards(cards.filter(x => x.id !== c.id))}>Kaldır</button>
                                        </div>
                                    ))}
                                    <button className="btn-add-card-dash mt-2" onClick={() => setShowCardModal(true)}>
                                        + Yeni Kart Ekle
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ŞİFRE DEĞİŞTİRME (2 KEZ İSTEME) */}
                        {activeTab === "password" && (
                            <div className="fade-in">
                                <h4 className="mb-4">Şifre Değiştir</h4>
                                <form onSubmit={handleUpdatePassword}>
                                    <div className="mb-3">
                                        <label className="small fw-bold">Mevcut Şifre</label>
                                        <input type="password" required className="form-control" value={passwords.current} onChange={(e)=>setPasswords({...passwords, current: e.target.value})} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="small fw-bold">Yeni Şifre</label>
                                        <input type="password" required className="form-control" value={passwords.new} onChange={(e)=>setPasswords({...passwords, new: e.target.value})} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="small fw-bold">Yeni Şifre (Tekrar)</label>
                                        <input type="password" required className="form-control" value={passwords.confirm} onChange={(e)=>setPasswords({...passwords, confirm: e.target.value})} />
                                    </div>
                                    <button type="submit" className="btn btn-warning w-100 mt-2 fw-bold">Güncelle</button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* YENİ KART MODALI */}
            {showCardModal && (
                <div className="modal-overlay d-flex align-items-center justify-content-center" style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', backgroundColor:'rgba(0,0,0,0.6)', zIndex:1050}}>
                    <div className="bg-white p-4 rounded-4 shadow-lg fade-in" style={{width:'100%', maxWidth:400}}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="m-0">Yeni Kart Ekle</h5>
                            <button className="btn-close" onClick={() => setShowCardModal(false)}></button>
                        </div>
                        <form onSubmit={handleAddCard}>
                            <div className="mb-3">
                                <label className="small fw-bold">Kart Üzerindeki İsim</label>
                                <input type="text" className="form-control" required placeholder="İREM YAŞLI" value={newCard.holder} onChange={(e)=>setNewCard({...newCard, holder: e.target.value.toUpperCase()})} />
                            </div>
                            <div className="mb-3">
                                <label className="small fw-bold">Kart Numarası</label>
                                <input type="text" className="form-control" required placeholder="0000 0000 0000 0000" maxLength="16" value={newCard.number} onChange={(e)=>setNewCard({...newCard, number: e.target.value})} />
                            </div>
                            <div className="row">
                                <div className="col-6 mb-3">
                                    <label className="small fw-bold">S.K.T (AA/YY)</label>
                                    <input type="text" className="form-control" required placeholder="12/28" value={newCard.expiry} onChange={(e)=>setNewCard({...newCard, expiry: e.target.value})} />
                                </div>
                                <div className="col-6 mb-3">
                                    <label className="small fw-bold">CVC</label>
                                    <input type="text" className="form-control" required placeholder="***" maxLength="3" value={newCard.cvc} onChange={(e)=>setNewCard({...newCard, cvc: e.target.value})} />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-warning w-100 fw-bold py-2">Kaydet</button>
                        </form>
                    </div>
                </div>
            )}

            {/* HESAP SİLME MODALI */}
            {showDeleteModal && (
                <div className="modal-overlay d-flex align-items-center justify-content-center" style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', backgroundColor:'rgba(0,0,0,0.6)', zIndex:1050}}>
                    <div className="bg-white p-4 rounded-4 text-center shadow" style={{maxWidth:350}}>
                        <h5 className="text-danger">Hesabını Sil?</h5>
                        <p className="small text-muted">Bu işlem tüm verilerini kalıcı olarak silecektir.</p>
                        <div className="d-grid gap-2">
                            <button className="btn btn-danger" onClick={() => navigate("/")}>Evet, Sil</button>
                            <button className="btn btn-light" onClick={() => setShowDeleteModal(false)}>Vazgeç</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;