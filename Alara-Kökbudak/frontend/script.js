// Doğrudan canlı API adresi (localhost kullanılmaz)
const API_URL = 'https://savora-yemek-satis-alaras-projects-44e3d712.vercel.app/api';

// Toast Notification System
const showToast = (message, isError = false) => {
    const toast = document.getElementById('toastNotification');
    toast.textContent = message;
    toast.style.background = isError ? 'var(--danger)' : 'var(--success)';
    toast.classList.remove('hidden');
    setTimeout(() => { toast.classList.add('hidden'); }, 3000);
};

// 1. POST /orders: Sipariş Oluşturma
document.getElementById('createOrderBtn').addEventListener('click', async () => {
    const customerName = document.getElementById('customerName').value;
    const orderTotal = document.getElementById('orderTotal').value;

    if (!customerName || !orderTotal) {
        showToast('Lütfen müşteri adı ve tutar bilgisini doldurun.', true);
        return;
    }

    const btn = document.getElementById('createOrderBtn');
    btn.textContent = 'Oluşturuluyor...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                kullaniciId: 1, // Örnek hardcoded veri
                yemekler: [{ ad: 'Savora Menü', miktar: 1 }],
                toplamTutar: Number(orderTotal)
            })
        });
        
        if (response.ok) {
            showToast('Sipariş başarıyla oluşturuldu!');
            document.getElementById('customerName').value = '';
            document.getElementById('orderTotal').value = '';
            fetchActiveOrders();
        } else {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.message || errData.error || response.statusText || 'Bilinmeyen hata';
            console.error('POST /orders Failed. Status:', response.status, 'Error:', errMsg);
            alert(`Sipariş oluşturulamadı:\n${errMsg}`);
        }
    } catch (error) {
        console.error('Fetch System Error:', error);
        alert(`Ağ/Bağlantı hatası:\n${error.message}`);
    } finally {
        btn.textContent = 'Sipariş Oluştur';
        btn.disabled = false;
    }
});

// 2. GET /orders: Tüm Sipariş Geçmişi
const fetchAllOrders = async () => {
    const btn = document.getElementById('refreshAllOrdersBtn');
    btn.textContent = 'Yükleniyor...';
    try {
        const response = await fetch(`${API_URL}/orders`);
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.message || errData.error || response.statusText || 'Bilinmeyen hata';
            console.error('GET /orders Failed. Status:', response.status, 'Error:', errMsg);
            throw new Error(errMsg);
        }
        const data = await response.json();
        const listConfig = document.getElementById('allOrdersList');
        if (data.orders || data.length >= 0) {
            renderOrders(data.orders || data, listConfig, false);
            showToast('Sipariş geçmişi yüklendi.');
        } else {
            alert('Sunucudan geçersiz veri formatı döndü.');
        }
    } catch (error) {
        alert(`Sipariş geçmişi alınamadı:\n${error.message}`);
    } finally {
        btn.textContent = 'Geçmişi Getir';
    }
};

document.getElementById('refreshAllOrdersBtn').addEventListener('click', fetchAllOrders);

// 3. GET /orders/active: Aktif Sipariş Detayı
const fetchActiveOrders = async () => {
    const btn = document.getElementById('refreshActiveOrdersBtn');
    const OriginalText = btn.textContent;
    btn.textContent = 'Yenileniyor...';
    try {
        const response = await fetch(`${API_URL}/orders/active`);
        if(!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.message || errData.error || response.statusText || 'Bilinmeyen hata';
            console.error('GET /orders/active Failed. Status:', response.status, 'Error:', errMsg);
            throw new Error(errMsg);
        }
        const data = await response.json();
        const listConfig = document.getElementById('activeOrdersList');
        renderOrders(data.activeOrders || data || [], listConfig, true);
        showToast('Aktif siparişler başarılı.');
    } catch (error) {
        alert(`Aktif siparişler alınamadı:\n${error.message}`);
    } finally {
        btn.textContent = OriginalText;
    }
};

document.getElementById('refreshActiveOrdersBtn').addEventListener('click', fetchActiveOrders);

// Orders renderer helper
const renderOrders = (orders, container, isActiveView) => {
    container.innerHTML = '';
    if (orders.length === 0) {
        container.innerHTML = '<p>Liste boş. Hiç sipariş bulunamadı.</p>';
        return;
    }
    
    // Most recent first
    [...orders].reverse().forEach(o => {
        const div = document.createElement('div');
        div.className = 'order-item';
        div.innerHTML = `
            <p><strong>Sipariş #${o.id || o._id || '?'}</strong> - Kullanıcı: ${o.kullaniciId || o.customerInfo?.name || 'Müşteri'}</p>
            <p>Tutar: ${o.toplamTutar || o.totalAmount} ₺</p>
            <p>Durum: <strong>${o.status || o.durum || 'Bilinmiyor'}</strong></p>
            <p>Tarih: ${new Date(o.createdAt || o.tarih || Date.now()).toLocaleString('tr-TR')}</p>
        `;

        if (isActiveView) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'order-actions';
            
            // PUT /orders/1/status
            const select = document.createElement('select');
            select.innerHTML = `
                <option value="Hazırlanmıyor" ${o.status === 'Hazırlanmıyor' ? 'selected' : ''}>Hazırlanmıyor</option>
                <option value="Hazırlanıyor" ${o.status === 'Hazırlanıyor' ? 'selected' : ''}>Hazırlanıyor</option>
                <option value="Tamamlandı" ${o.status === 'Tamamlandı' ? 'selected' : ''}>Tamamlandı</option>
            `;
            
            const updateBtn = document.createElement('button');
            updateBtn.className = 'action-btn';
            updateBtn.textContent = 'Güncelle';
            updateBtn.onclick = () => updateOrderStatus(o.id, select.value);

            // DELETE /orders/1
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'action-btn danger-btn';
            cancelBtn.style.marginTop = '0';
            cancelBtn.textContent = 'İptal Et';
            cancelBtn.onclick = () => cancelOrder(o.id);
            if(o.status !== 'Hazırlanmıyor') cancelBtn.style.display = 'none';

            actionsDiv.appendChild(select);
            actionsDiv.appendChild(updateBtn);
            if (o.status === 'Hazırlanmıyor') {
                actionsDiv.appendChild(cancelBtn);
            }
            div.appendChild(actionsDiv);
        }
        
        container.appendChild(div);
    });
};

// 4. PUT: Sipariş Durumu Güncelleme
const updateOrderStatus = async (id, status) => {
    try {
        const response = await fetch(`${API_URL}/orders/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (response.ok) {
            showToast(`Durum "${status}" yapıldı.`);
            fetchActiveOrders();
            fetchAllOrders(); // Geçmişi de hemen güncelleyelim.
        } else {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.message || errData.error || response.statusText || 'Bilinmeyen hata';
            console.error(`PUT /orders/${id}/status Failed. Status:`, response.status, 'Error:', errMsg);
            alert(`Durum güncellenemedi:\n${errMsg}`);
        }
    } catch (e) {
        console.error('Fetch System Error:', e);
        alert(`Bağlantı hatası (Durum Güncelleme):\n${e.message}`);
    }
};

// 5. DELETE: Sipariş İptal Etme
const cancelOrder = async (id) => {
    if(!confirm(`Sipariş #${id} iptal edilecek! Emin misiniz?`)) return;
    try {
        const response = await fetch(`${API_URL}/orders/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showToast(`Sipariş iptali başarılı.`);
            fetchActiveOrders();
            fetchAllOrders();
        } else {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.message || errData.error || response.statusText || 'Bilinmeyen hata';
            console.error(`DELETE /orders/${id} Failed. Status:`, response.status, 'Error:', errMsg);
            alert(`Sipariş iptal edilemedi:\n${errMsg}`);
        }
    } catch (e) {
        console.error('Fetch System Error:', e);
        alert(`Bağlantı hatası (Sipariş İptali):\n${e.message}`);
    }
};

// 6. POST: Ödeme Yöntemi Kaydetme
document.getElementById('savePaymentBtn').addEventListener('click', async () => {
    const cardHolderName = document.getElementById('cardHolder').value;
    const cardNumber = document.getElementById('cardNumber').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;

    if (!cardNumber || cardNumber.length < 16) {
        showToast('Lütfen geçerli bir 16 haneli kart numarası girin.', true);
        return;
    }

    const btn = document.getElementById('savePaymentBtn');
    btn.textContent = 'Kaydediliyor...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kartSahibi: cardHolderName, kartNumarasi: cardNumber })
        });
        
        if (response.ok) {
            showToast('Ödeme yöntemi başarıyla kaydedildi!');
            document.getElementById('cardHolder').value = '';
            document.getElementById('cardNumber').value = '';
            document.getElementById('expiryDate').value = '';
            document.getElementById('cvv').value = '';
        } else {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.message || errData.error || response.statusText || 'Bilinmeyen hata';
            console.error('POST /payments Failed. Status:', response.status, 'Error:', errMsg);
            alert(`Ödeme kaydedilemedi:\n${errMsg}`);
        }
    } catch (error) {
        console.error('Fetch System Error:', error);
        alert(`Bağlantı hatası (Ödeme):\n${error.message}`);
    } finally {
        btn.textContent = 'Kartı Kaydet';
        btn.disabled = false;
    }
});

// Initial startup load
document.addEventListener('DOMContentLoaded', fetchActiveOrders);
