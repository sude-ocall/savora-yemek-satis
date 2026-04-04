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
        { id: 1, title: "Ev Adresi", city: "İstanbul", district: "Kadıköy", detail: "Caferağa Mah. Moda Cad. No: 34" },
        { id: 2, title: "İş Adresi", city: "İstanbul", district: "Beşiktaş", detail: "Vişnezade Mah. Süleyman Seba Cad. No: 40" }
    ]);

    const [orders] = useState([
        { id: "#SV9821", date: "12 Mart 2026", total: "450.00 TL", status: "Tamamlandı", items: "Vegan Burger, Lime Soda" },
    ]);

    const [cards, setCards] = useState([
        { id: 1, brand: "Visa", lastFour: "4242", expiry: "12/28" }
    ]);

    // --- Modal & Form State'leri ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showCardModal, setShowCardModal] = useState(false);
    
    // Adres Düzenleme State'leri
    const [editingAddress, setEditingAddress] = useState(null);
    const [newAddress, setNewAddress] = useState({ title: "", city: "", district: "", detail: "" });

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

    // --- Adres İşlemleri ---
    const openAddressModal = (address = null) => {
        if (address) {
            setEditingAddress(address);
            setNewAddress({ 
                title: address.title, 
                city: address.city, 
                district: address.district, 
                detail: address.detail 
            });
        } else {
            setEditingAddress(null);
            setNewAddress({ title: "", city: "", district: "", detail: "" });
        }
        setShowAddressModal(true);
    };

    const handleSaveAddress = (e) => {
        e.preventDefault();
        if (editingAddress) {
            setAddresses(addresses.map(a => 
                a.id === editingAddress.id ? { ...a, ...newAddress } : a
            ));
        } else {
            setAddresses([...addresses, { id: Date.now(), ...newAddress }]);
        }
        setShowAddressModal(false);
    };

    return (
        <div className="profile-page-container container py-5 min-vh-100">
            <div className="row">
                {/* SOL SİDEBAR */}
                <div className="col-md-4 col-lg-3">
                    <div className="profile-sidebar shadow-sm bg-white rounded-4 p-4 mb-4">
                        <div className="text-center mb-4">
                            <div className="avatar-circle bg-success text-white mx-auto mb-2 d-flex align-items-center justify-content-center fw-bold" style={{width:60, height:60, borderRadius:'50%', fontSize:20}}>IY</div>
                            <h5 className="mb-0 fw-bold">{userInfo.fullName}</h5>
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
                        
                        {/* PROFİL SEKMESİ */}
                        {activeTab === "profile" && (
                            <div className="fade-in">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="m-0 fw-bold">Profil Bilgileri</h4>
                                    {!isEditing ? (
                                        <button className="btn btn-outline-dark btn-sm rounded-pill px-3" onClick={() => setIsEditing(true)}>Düzenle</button>
                                    ) : (
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-success btn-sm rounded-pill px-3" onClick={() => {setUserInfo(tempUserInfo); setIsEditing(false)}}>Kaydet</button>
                                            <button className="btn btn-light btn-sm rounded-pill px-3" onClick={() => setIsEditing(false)}>İptal</button>
                                        </div>
                                    )}
                                </div>
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="small fw-bold text-secondary">Ad Soyad</label>
                                        <input type="text" className="form-control" value={isEditing ? tempUserInfo.fullName : userInfo.fullName} onChange={(e)=>setTempUserInfo({...tempUserInfo, fullName: e.target.value})} disabled={!isEditing} />
                                    </div>
                                    <div className="col-12">
                                        <label className="small fw-bold text-secondary">E-posta</label>
                                        <input type="text" className="form-control bg-light" value={userInfo.email} disabled />
                                    </div>
                                    <div className="col-12">
                                        <label className="small fw-bold text-secondary">Telefon</label>
                                        <input type="text" className="form-control" value={isEditing ? tempUserInfo.phone : userInfo.phone} onChange={(e)=>setTempUserInfo({...tempUserInfo, phone: e.target.value})} disabled={!isEditing} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SİPARİŞLER SEKMESİ */}
                        {activeTab === "orders" && (
                            <div className="fade-in">
                                <h4 className="mb-4 fw-bold">Sipariş Geçmişi</h4>
                                <div className="scrollable-content">
                                    {orders.map(o => (
                                        <div key={o.id} className="border rounded-4 p-3 mb-3 bg-light border-0">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="fw-bold">{o.id}</span>
                                                <span className="badge bg-white text-dark shadow-sm">{o.status}</span>
                                            </div>
                                            <div className="d-flex justify-content-between small text-muted">
                                                <span>{o.items}</span>
                                                <span className="fw-bold text-dark">{o.total}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ADRESLER SEKMESİ */}
                        {activeTab === "addresses" && (
                            <div className="fade-in">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="m-0 fw-bold">Adreslerim</h4>
                                    <button className="btn btn-warning btn-sm fw-bold rounded-pill px-3 shadow-sm" onClick={() => openAddressModal()}>+ Yeni Ekle</button>
                                </div>
                                <div className="scrollable-content">
                                    {addresses.map(a => (
                                        <div key={a.id} className="border rounded-4 p-3 mb-3 d-flex justify-content-between align-items-center bg-white shadow-sm border-0">
                                            <div>
                                                <div className="fw-bold text-dark">{a.title}</div>
                                                <div className="small text-muted">{a.city}, {a.district}</div>
                                                <div className="small text-muted opacity-75">{a.detail}</div>
                                            </div>
                                            <div className="d-flex gap-1">
                                                <button className="btn btn-link text-primary btn-sm text-decoration-none fw-bold" onClick={() => openAddressModal(a)}>Düzenle</button>
                                                <button className="btn btn-link text-danger btn-sm text-decoration-none" onClick={() => setAddresses(addresses.filter(x => x.id !== a.id))}>Sil</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ÖDEMELER SEKMESİ */}
                        {activeTab === "payments" && (
                            <div className="fade-in">
                                <h4 className="mb-4 fw-bold">Ödeme Yöntemleri</h4>
                                <div className="scrollable-content">
                                    {cards.map(c => (
                                        <div key={c.id} className="payment-card-item bg-white shadow-sm border-0 rounded-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <span style={{fontSize:24}}>💳</span>
                                                <div>
                                                    <div className="card-masked-no fw-bold text-dark">**** **** **** {c.lastFour}</div>
                                                    <small className="text-muted">{c.brand} | {c.expiry}</small>
                                                </div>
                                            </div>
                                            <button className="btn btn-sm text-danger fw-bold" onClick={() => setCards(cards.filter(x => x.id !== c.id))}>Kaldır</button>
                                        </div>
                                    ))}
                                    <button className="btn-add-card-dash mt-2" onClick={() => setShowCardModal(true)}>
                                        + Yeni Kart Ekle
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* GÜVENLİK SEKMESİ */}
                        {activeTab === "password" && (
                            <div className="fade-in">
                                <h4 className="mb-4 fw-bold">Şifre Değiştir</h4>
                                <form onSubmit={handleUpdatePassword}>
                                    <div className="mb-3">
                                        <label className="small fw-bold text-secondary">Mevcut Şifre</label>
                                        <input type="password" required className="form-control" value={passwords.current} onChange={(e)=>setPasswords({...passwords, current: e.target.value})} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="small fw-bold text-secondary">Yeni Şifre</label>
                                        <input type="password" required className="form-control" value={passwords.new} onChange={(e)=>setPasswords({...passwords, new: e.target.value})} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="small fw-bold text-secondary">Yeni Şifre (Tekrar)</label>
                                        <input type="password" required className="form-control" value={passwords.confirm} onChange={(e)=>setPasswords({...passwords, confirm: e.target.value})} />
                                    </div>
                                    <button type="submit" className="btn btn-warning w-100 mt-2 fw-bold rounded-pill py-2 shadow-sm">Güncelle</button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ADRES MODALI */}
            {showAddressModal && (
                <div className="modal-overlay d-flex align-items-center justify-content-center" style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', backgroundColor:'rgba(0,0,0,0.6)', zIndex:1050}}>
                    <div className="bg-white p-4 rounded-4 shadow-lg fade-in" style={{width:'100%', maxWidth:480}}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="m-0 fw-bold">{editingAddress ? "Adresi Düzenle" : "Yeni Adres Ekle"}</h5>
                            <button className="btn-close" onClick={() => setShowAddressModal(false)}></button>
                        </div>
                        <form onSubmit={handleSaveAddress}>
                            <div className="mb-3">
                                <label className="small fw-bold text-dark mb-1">Adres Başlığı</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    required 
                                    placeholder="Örn: Ev, İş, Okul" 
                                    value={newAddress.title} 
                                    onChange={(e)=>setNewAddress({...newAddress, title: e.target.value})} 
                                />
                            </div>

                            <div className="address-grid">
                                <div>
                                    <label className="small fw-bold text-dark mb-1">İl</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        required 
                                        placeholder="Şehir" 
                                        value={newAddress.city} 
                                        onChange={(e)=>setNewAddress({...newAddress, city: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label className="small fw-bold text-dark mb-1">İlçe</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        required 
                                        placeholder="İlçe" 
                                        value={newAddress.district} 
                                        onChange={(e)=>setNewAddress({...newAddress, district: e.target.value})} 
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="small fw-bold text-dark mb-1">Adres Detayı</label>
                                <textarea 
                                    className="form-control" 
                                    required 
                                    rows="3" 
                                    placeholder="Mahalle, sokak, bina ve daire no..." 
                                    value={newAddress.detail} 
                                    onChange={(e)=>setNewAddress({...newAddress, detail: e.target.value})}
                                ></textarea>
                            </div>

                            <div className="d-flex gap-2 mt-4">
                                <button type="button" className="btn btn-light w-50 fw-bold rounded-pill py-2" onClick={() => setShowAddressModal(false)}>İptal</button>
                                <button type="submit" className="btn btn-warning w-50 fw-bold rounded-pill py-2 shadow-sm">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* YENİ KART MODALI */}
            {showCardModal && (
                <div className="modal-overlay d-flex align-items-center justify-content-center" style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', backgroundColor:'rgba(0,0,0,0.6)', zIndex:1050}}>
                    <div className="bg-white p-4 rounded-4 shadow-lg fade-in" style={{width:'100%', maxWidth:400}}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="m-0 fw-bold">Yeni Kart Ekle</h5>
                            <button className="btn-close" onClick={() => setShowCardModal(false)}></button>
                        </div>
                        <form onSubmit={handleAddCard}>
                            <div className="mb-3">
                                <label className="small fw-bold mb-1">Kart Üzerindeki İsim</label>
                                <input type="text" className="form-control text-uppercase" required placeholder="AD SOYAD" value={newCard.holder} onChange={(e)=>setNewCard({...newCard, holder: e.target.value})} />
                            </div>
                            <div className="mb-3">
                                <label className="small fw-bold mb-1">Kart Numarası</label>
                                <input type="text" className="form-control" required placeholder="0000 0000 0000 0000" maxLength="16" value={newCard.number} onChange={(e)=>setNewCard({...newCard, number: e.target.value})} />
                            </div>
                            <div className="row g-2">
                                <div className="col-6 mb-3">
                                    <label className="small fw-bold mb-1">S.K.T (AA/YY)</label>
                                    <input type="text" className="form-control" required placeholder="MM/YY" value={newCard.expiry} onChange={(e)=>setNewCard({...newCard, expiry: e.target.value})} />
                                </div>
                                <div className="col-6 mb-3">
                                    <label className="small fw-bold mb-1">CVC</label>
                                    <input type="text" className="form-control" required placeholder="***" maxLength="3" value={newCard.cvc} onChange={(e)=>setNewCard({...newCard, cvc: e.target.value})} />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-warning w-100 fw-bold rounded-pill py-2 shadow-sm">Kaydet</button>
                        </form>
                    </div>
                </div>
            )}

            {/* HESAP SİLME MODALI */}
            {showDeleteModal && (
                <div className="modal-overlay d-flex align-items-center justify-content-center" style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', backgroundColor:'rgba(0,0,0,0.6)', zIndex:1050}}>
                    <div className="bg-white p-4 rounded-4 text-center shadow fade-in" style={{maxWidth:350}}>
                        <h5 className="text-danger fw-bold">Hesabını Sil?</h5>
                        <p className="small text-muted">Bu işlem tüm verilerini kalıcı olarak silecektir.</p>
                        <div className="d-grid gap-2 mt-4">
                            <button className="btn btn-danger fw-bold rounded-pill py-2" onClick={() => navigate("/")}>Evet, Sil</button>
                            <button className="btn btn-light fw-bold rounded-pill py-2" onClick={() => setShowDeleteModal(false)}>Vazgeç</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;