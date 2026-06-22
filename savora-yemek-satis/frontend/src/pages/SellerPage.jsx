import React, { useState, useMemo } from "react";

const MOCK_SELLER = {
    id: 1,
    name: "Happy Burger & Pizza",
    rating: 4.8,
    image: "H",
};

const CATEGORIES = ["Tümü", "Burger", "Pizza", "Tatlı", "İçecek", "Yan Ürün"];

const ALL_DB_PRODUCTS = [
    { id: 1, sellerId: 1, name: "Savora Gurme Burger", category: "Burger", price: 220, description: "Ateş ızgarasında pişmiş dana köfte, karamelize soğan ve özel sos.", status: "available", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500" },
    { id: 2, sellerId: 1, name: "İtalyan Margherita", category: "Pizza", price: 180, description: "Orijinal İtalyan tarifiyle odun ateşinde pişirilmiş, taze mozzarella.", status: "available", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=500" },
    { id: 3, sellerId: 1, name: "Brownie Sufle", category: "Tatlı", price: 120, description: "Akışkan çikolatalı ve dondurma eşliğinde sıcak sufle.", status: "out_of_stock", image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=500" },
];

const SellerPage = () => {
    const [menu, setMenu] = useState(() =>
        ALL_DB_PRODUCTS.filter(product => product.sellerId === MOCK_SELLER.id)
    );

    const [activeTab, setActiveTab] = useState("Tümü");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ open: false, id: null });
    const [formData, setFormData] = useState({ name: "", category: "Burger", price: "", description: "", imageURL: "", file: null, previewImage: "" });
    const [imageTab, setImageTab] = useState("url");

    const filteredMenu = useMemo(() => {
        if (activeTab === "Tümü") return menu;
        return menu.filter(item => item.category === activeTab);
    }, [menu, activeTab]);

    const handleSave = (e) => {
        e.preventDefault();
        const imageValue = formData.previewImage || "";

        const newItem = {
            id: editingItem ? editingItem.id : Date.now(),
            sellerId: MOCK_SELLER.id,
            name: formData.name,
            category: formData.category,
            price: formData.price,
            description: formData.description,
            status: editingItem ? editingItem.status : "available",
            image: imageValue,
        };

        if (editingItem) {
            setMenu(prev => prev.map(item => item.id === editingItem.id ? newItem : item));
        } else {
            setMenu(prev => [newItem, ...prev]);
        }

        setIsFormOpen(false);
    };

    return (
        <div className="sl-page">
            <header className="sl-header">
                <div className="sl-header-inner">
                    <div className="sl-header-profile">
                        <div className="sl-avatar">{MOCK_SELLER.image}</div>
                        <div className="sl-info">
                            <h1>{MOCK_SELLER.name}</h1>
                            <div className="sl-meta">
                                <span><i className="fa-solid fa-star"></i> {MOCK_SELLER.rating}</span>
                                <span><i className="fa-solid fa-utensils"></i> {menu.length} İlan</span>
                            </div>
                        </div>
                    </div>
                    <button className="sl-add-btn" onClick={() => {
                        setEditingItem(null);
                        setFormData({ name: "", category: "Burger", price: "", description: "", imageURL: "", file: null, previewImage: "" });
                        setImageTab("url");
                        setIsFormOpen(true);
                    }}>
                        + Yeni Ürün Ekle
                    </button>
                </div>
            </header>

            <div className="sl-container">
                <nav className="sl-tabs">
                    {CATEGORIES.map(cat => (
                        <button key={cat} className={`sl-tab ${activeTab === cat ? "active" : ""}`} onClick={() => setActiveTab(cat)}>{cat}</button>
                    ))}
                </nav>

                <div className="sl-menu-grid">
                    {filteredMenu.map(item => (
                        <div key={item.id} className={`sl-menu-card ${item.status === "out_of_stock" ? "muted" : ""}`}>
                            <div className="sl-card-img-wrap">
                                {item.image ? <img src={item.image} alt={item.name} /> : <div className="sl-no-img"><i className="fa-solid fa-image"></i></div>}
                            </div>
                            <div className="sl-card-content">
                                <div className="sl-card-top-info">
                                    <span className="sl-item-cat-label">{item.category}</span>
                                    <span className="sl-item-rating"><i className="fa-solid fa-star"></i> {MOCK_SELLER.rating}</span>
                                </div>
                                <h4 className="sl-item-title">{item.name}</h4>
                                <p className="sl-item-desc">{item.description}</p>

                                <div className="sl-card-action-row">
                                    <div className="sl-item-price">{item.price} ₺</div>
                                    <div className="sl-admin-btns">
                                        <button className="sl-mini-btn" onClick={() => setMenu(prev => prev.map(m => m.id === item.id ? { ...m, status: m.status === 'available' ? 'out_of_stock' : 'available' } : m))}>
                                            <i className={`fa-solid ${item.status === "available" ? "fa-eye" : "fa-eye-slash"}`}></i>
                                        </button>
                                        <button className="sl-mini-btn" onClick={() => { setEditingItem(item); setFormData({ ...item, imageURL: item.image, file: null, previewImage: item.image }); setImageTab("url"); setIsFormOpen(true); }}>
                                            <i className="fa-regular fa-pen-to-square"></i>
                                        </button>
                                        <button className="sl-mini-btn sl-btn-del" onClick={() => setConfirmModal({ open: true, id: item.id })}>
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL */}
            {isFormOpen && (
                <div className="sl-custom-modal">
                    <div className="sl-modal-backdrop" onClick={() => setIsFormOpen(false)} />
                    <div className="sl-modal-content" style={{ maxHeight: '80vh', overflowY: 'auto', padding: '20px' }}>
                        <div className="sl-modal-header">
                            <h3>{editingItem ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</h3>
                            <button className="close-x" onClick={() => setIsFormOpen(false)}>&times;</button>
                        </div>

                        {/* Sekme başlıkları */}
                        <div className="sl-image-tabs" style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
                            <button className={`tab-btn ${imageTab === "url" ? "active" : ""}`} onClick={() => setImageTab("url")}>URL</button>
                            <button className={`tab-btn ${imageTab === "file" ? "active" : ""}`} onClick={() => setImageTab("file")}>Dosya</button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="sl-form-group">
                                {formData.previewImage && (
                                    <div className="sl-img-preview">
                                        <img src={formData.previewImage} alt="Önizleme" style={{ width: '100%', borderRadius: '6px', marginBottom: '10px' }} />
                                    </div>
                                )}

                                {imageTab === "url" && (
                                    <input
                                        type="text"
                                        placeholder="https://..."
                                        value={formData.imageURL}
                                        onChange={(e) => setFormData({ ...formData, imageURL: e.target.value, file: null, previewImage: e.target.value })}
                                        className="sl-input"
                                    />
                                )}

                                {imageTab === "file" && (
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => setFormData({ ...formData, file, previewImage: reader.result, imageURL: "" });
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="sl-input"
                                    />
                                )}
                            </div>

                            <div className="sl-form-group">
                                <label>Ürün Adı</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="sl-input" />
                            </div>

                            <div className="sl-form-row">
                                <div className="sl-form-group">
                                    <label>Kategori</label>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="sl-input">
                                        {CATEGORIES.filter(c => c !== "Tümü").map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="sl-form-group">
                                    <label>Fiyat</label>
                                    <input type="number" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="sl-input" />
                                </div>
                            </div>

                            <div className="sl-form-group">
                                <label>Açıklama</label>
                                <textarea rows="2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="sl-input" />
                            </div>

                            <div className="sl-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                                <button type="button" className="sl-btn-secondary" style={{ padding: '8px 16px', borderRadius: '6px' }} onClick={() => setIsFormOpen(false)}>İptal</button>
                                <button type="submit" className="sl-btn-primary" style={{ padding: '8px 16px', borderRadius: '6px' }}>Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {confirmModal.open && (
                <div className="sl-custom-modal">
                    <div className="sl-modal-backdrop" onClick={() => setConfirmModal({ open: false, id: null })} />
                    <div className="sl-confirm-card">
                        <div className="sl-confirm-icon-wrap">
                            <i className="fa-solid fa-trash-can"></i>
                        </div>
                        <h3>Ürünü Silmek İstiyor Musunuz?</h3>
                        <p>Bu işlem geri alınamaz. Ürün menünüzden kalıcı olarak kaldırılacaktır.</p>
                        <div className="sl-confirm-actions">
                            <button className="sl-btn-cancel" onClick={() => setConfirmModal({ open: false, id: null })}>
                                Vazgeç
                            </button>
                            <button className="sl-btn-delete" onClick={() => {
                                setMenu(menu.filter(m => m.id !== confirmModal.id));
                                setConfirmModal({ open: false, id: null });
                            }}>
                                Evet, Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerPage;