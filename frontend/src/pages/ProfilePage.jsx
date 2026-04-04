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
        { id: 1, title: "Ev Adresi", detail: "İstanbul, Kadıköy, Caferağa Mah. Moda Cad. No: 34 (Mavi kapılı bina)" },
        { id: 2, title: "İş Adresi", detail: "İstanbul, Beşiktaş, Vişnezade Mah. Süleyman Seba Cad. No: 40 (B blok Kat:4)" }
    ]);

    // --- Modal State'leri ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState(null);

    // --- Düzenleme State'leri ---
    const [isEditing, setIsEditing] = useState(false);
    const [tempUserInfo, setTempUserInfo] = useState({ ...userInfo });
    
    // Yeni Adres için detaylı state
    const [newAddress, setNewAddress] = useState({ 
        title: "", 
        city: "", 
        district: "", 
        neighborhood: "", 
        street: "", 
        no: "", 
        description: "" 
    });

    // --- Profil Düzenleme Fonksiyonları ---
    const handleEditClick = () => {
        setTempUserInfo({ ...userInfo });
        setIsEditing(true);
    };

    const handleSaveProfile = () => {
        setUserInfo({ ...tempUserInfo });
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleUpdatePassword = (e) => {
        e.preventDefault();
        alert("Şifreniz başarıyla değiştirildi!");
    };

    const handleDeleteAccount = () => {
        setShowDeleteModal(false);
        alert("Hesabınız kalıcı olarak silindi.");
        navigate("/");
    };

    const handleAddAddress = (e) => {
        e.preventDefault();
        if (newAddress.title && newAddress.city && newAddress.district) {
            // Girilen tüm alanları tek bir string (detail) haline getiriyoruz
            const fullDetail = `${newAddress.city}, ${newAddress.district}, ${newAddress.neighborhood} Mah. ${newAddress.street} Sok. No: ${newAddress.no} (${newAddress.description})`;
            
            setAddresses([...addresses, { 
                id: Date.now(), 
                title: newAddress.title, 
                detail: fullDetail 
            }]);
            
            // State'i temizle
            setNewAddress({ title: "", city: "", district: "", neighborhood: "", street: "", no: "", description: "" });
            setShowAddressModal(false);
        }
    };

    const confirmDeleteAddress = (id) => {
        setAddressToDelete(id);
    };

    const handleAddressDelete = () => {
        setAddresses(addresses.filter(addr => addr.id !== addressToDelete));
        setAddressToDelete(null);
    };

    return (
        <div className="profile-page-container container min-vh-100">
            <div className="profile-grid row">
                <div className="col-md-4 col-lg-3 mb-4 mb-md-0">
                    <div className="profile-sidebar shadow-sm">
                        <div className="user-brief">
                            <div className="avatar-circle">IY</div>
                            <h3>{userInfo.fullName}</h3>
                            <p>{userInfo.email}</p>
                        </div>
                        <div className="sidebar-menu">
                            <button className={activeTab === "profile" ? "active" : ""} onClick={() => {setActiveTab("profile"); setIsEditing(false)}}>👤 Profil</button>
                            <button className={activeTab === "addresses" ? "active" : ""} onClick={() => setActiveTab("addresses")}>📍 Adresler</button>
                            <button className={activeTab === "password" ? "active" : ""} onClick={() => setActiveTab("password")}>🔑 Güvenlik</button>
                            <hr />
                            <button className="delete-acc-btn text-danger" onClick={() => setShowDeleteModal(true)}>🗑️ Hesabı Sil</button>
                        </div>
                    </div>
                </div>

                <div className="col-md-8 col-lg-9">
                    <div className="profile-content-card shadow-sm">
                        {activeTab === "profile" && (
                            <div className="tab-content fade-in">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h2 className="m-0">Profil Bilgileri</h2>
                                    {!isEditing ? (
                                        <button className="btn-edit-profile" onClick={handleEditClick}>Değiştir</button>
                                    ) : (
                                        <div className="d-flex gap-2">
                                            <button className="btn-save-profile" onClick={handleSaveProfile}>Kaydet</button>
                                            <button className="profile-btn-cancel" onClick={handleCancelEdit}>İptal</button>
                                        </div>
                                    )}
                                </div>
                                <form>
                                    <div className="input-group">
                                        <label>Ad Soyad</label>
                                        <input type="text" value={isEditing ? tempUserInfo.fullName : userInfo.fullName} onChange={(e) => setTempUserInfo({...tempUserInfo, fullName: e.target.value})} disabled={!isEditing} required />
                                    </div>
                                    <div className="input-group">
                                        <label>E-posta</label>
                                        <input type="email" value={userInfo.email} disabled />
                                        <small className="text-muted">E-posta adresi değiştirilemez.</small>
                                    </div>
                                    <div className="input-group">
                                        <label>Telefon</label>
                                        <input type="text" value={isEditing ? tempUserInfo.phone : userInfo.phone} onChange={(e) => setTempUserInfo({...tempUserInfo, phone: e.target.value})} disabled={!isEditing} />
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === "addresses" && (
                            <div className="tab-content fade-in">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h2 className="m-0">Adreslerim</h2>
                                    <button className="btn-hero-yellow" onClick={() => setShowAddressModal(true)}>+ Yeni Ekle</button>
                                </div>
                                <div className="address-list">
                                    {addresses.map(addr => (
                                        <div key={addr.id} className="address-item shadow-sm">
                                            <div>
                                                <strong>{addr.title}</strong>
                                                <p className="m-0 mt-1">{addr.detail}</p>
                                            </div>
                                            <button className="btn-delete-small text-danger" onClick={() => confirmDeleteAddress(addr.id)}>Sil</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "password" && (
                            <div className="tab-content fade-in">
                                <h2 className="mb-4">Şifre Değiştir</h2>
                                <form onSubmit={handleUpdatePassword}>
                                    <div className="input-group">
                                        <label>Mevcut Şifre</label>
                                        <input type="password" required />
                                    </div>
                                    <div className="input-group">
                                        <label>Yeni Şifre</label>
                                        <input type="password" required />
                                    </div>
                                    <div className="input-group">
                                        <label>Yeni Şifre (Tekrar)</label>
                                        <input type="password" required />
                                    </div>
                                    <button type="submit" className="btn-hero-yellow mt-3 w-100">Şifreyi Güncelle</button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modallar */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-container delete-modal fade-in shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setShowDeleteModal(false)}>&times;</button>
                        <div className="modal-header d-flex flex-column text-center">
                            <div className="modal-logo">🌿 Sav<span>ora</span></div>
                            <h2 className="mt-3">Hesabınızı Silin</h2>
                            <p className="text-danger fw-bold">DİKKAT: Bu işlem kalıcıdır ve geri alınamaz!</p>
                        </div>
                        <div className="modal-body text-center mt-3">
                            <p>Tüm sipariş geçmişiniz ve profil bilgileriniz silinecektir.</p>
                        </div>
                        <div className="modal-footer d-flex flex-column gap-2 mt-4">
                            <button className="btn-modal-delete-confirm" onClick={handleDeleteAccount}>🗑️ Evet, Hesabı Sil</button>
                            <button className="btn-hero-outline" onClick={() => setShowDeleteModal(false)}>İptal</button>
                        </div>
                    </div>
                </div>
            )}

            {addressToDelete && (
                <div className="modal-overlay" onClick={() => setAddressToDelete(null)}>
                    <div className="modal-container text-center fade-in" onClick={(e) => e.stopPropagation()}>
                        <h3 className="mb-3">Adresi Sil</h3>
                        <p>Bu adresi silmek istediğinize emin misiniz?</p>
                        <div className="d-flex gap-2 mt-4">
                            <button className="btn-hero-yellow w-100" onClick={handleAddressDelete}>Sil</button>
                            <button className="profile-add-btn-cencel w-100" onClick={() => setAddressToDelete(null)}>Vazgeç</button>
                        </div>
                    </div>
                </div>
            )}

            {showAddressModal && (
                <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
                    <div className="modal-container address-modal fade-in shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setShowAddressModal(false)}>&times;</button>
                        <div className="modal-header d-flex flex-column text-center">
                            <div className="modal-logo">🌿 Sav<span>ora</span></div>
                            <h2 className="mt-2">Yeni Adres Ekle</h2>
                            <p>Siparişleriniz için yeni bir konum belirleyin.</p>
                        </div>
                        <form onSubmit={handleAddAddress} className="mt-4">
                            <div className="input-group">
                                <label>Adres Başlığı</label>
                                <input type="text" value={newAddress.title} onChange={(e) => setNewAddress({...newAddress, title: e.target.value})} placeholder="Ev, İş vb." required />
                            </div>
                            
                            <div className="row">
                                <div className="col-6">
                                    <div className="input-group">
                                        <label>İl</label>
                                        <input type="text" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} placeholder="Örn: İstanbul" required />
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="input-group">
                                        <label>İlçe</label>
                                        <input type="text" value={newAddress.district} onChange={(e) => setNewAddress({...newAddress, district: e.target.value})} placeholder="Örn: Kadıköy" required />
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-8">
                                    <div className="input-group">
                                        <label>Mahalle</label>
                                        <input type="text" value={newAddress.neighborhood} onChange={(e) => setNewAddress({...newAddress, neighborhood: e.target.value})} placeholder="Örn: Caferağa" required />
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="input-group">
                                        <label>No</label>
                                        <input type="text" value={newAddress.no} onChange={(e) => setNewAddress({...newAddress, no: e.target.value})} placeholder="34/1" required />
                                    </div>
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Sokak / Cadde</label>
                                <input type="text" value={newAddress.street} onChange={(e) => setNewAddress({...newAddress, street: e.target.value})} placeholder="Örn: Moda Caddesi" required />
                            </div>

                            <div className="input-group">
                                <label>Adres Tarifi (Opsiyonel)</label>
                                <textarea className="modern-textarea" style={{height: '80px'}} value={newAddress.description} onChange={(e) => setNewAddress({...newAddress, description: e.target.value})} placeholder="Bina rengi, dükkan üstü vb. tarifler..." />
                            </div>

                            <button type="submit" className="btn-hero-yellow w-100 mt-3">Adresi Kaydet</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;