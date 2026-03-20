// --- GLOBAL / SHARED AYARLAR ---
const API_URL = 'https://savora-yemek-satis-alaras-projects-44e3d712.vercel.app/api';

// Sepet durumu localStorage üzerinden taşınıyor
let cart = JSON.parse(localStorage.getItem('savoraCart')) || [];

// Toast Bildirim Sistemi
const showToast = (message, isError = false) => {
    const toast = document.getElementById('toastNotification');
    if(!toast) return;
    toast.textContent = message;
    toast.style.background = isError ? 'var(--danger)' : 'var(--success)';
    toast.classList.remove('hidden');
    setTimeout(() => { toast.classList.add('hidden'); }, 3000);
};

const formatPrice = (price) => `${price} ₺`;

// --- INDEX.HTML: MENÜ VE SEPET MANTIĞI ---
if (document.getElementById('menuGrid')) {
    
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalPriceEl = document.getElementById('cartTotalPrice');
    const checkoutBtn = document.getElementById('checkoutBtn');

    const updateCartUI = () => {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Sepetiniz şu an boş. Hemen lezzetli bir şeyler seçin!</div>';
            cartTotalPriceEl.textContent = formatPrice(0);
            checkoutBtn.disabled = true;
            return;
        }

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${item.quantity} x ${formatPrice(item.price)}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });

        cartTotalPriceEl.textContent = formatPrice(total);
        
        // Sepette ürün varsa buton aktif
        checkoutBtn.disabled = cart.length === 0;
        
        // localStorage'a kaydet
        localStorage.setItem('savoraCart', JSON.stringify(cart));
    };

    // Global fonksiyonlar eklendi
    window.updateQty = (index, change) => {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        updateCartUI();
    };

    // 'Sepete Ekle' Butonları
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const name = e.target.getAttribute('data-name');
            const price = parseFloat(e.target.getAttribute('data-price'));

            const existing = cart.find(i => i.id === id);
            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push({ id, name, price, quantity: 1 });
            }
            
            showToast(`${name} sepete eklendi.`);
            updateCartUI();
        });
    });

    // Ödemeye Geç Butonu
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('Lütfen sepeti doldurun.', true);
            return;
        }
        window.location.href = 'payment.html';
    });

    // İlk yüklemede sepeti çiz
    updateCartUI();
}


// --- PAYMENT.HTML: ÖDEME VE API MANTIĞI ---
if (document.getElementById('paymentForm')) {
    
    const summaryItemsBlock = document.getElementById('summaryItems');
    const summaryTotalEl = document.getElementById('summaryTotal');
    const completePaymentBtn = document.getElementById('completePaymentBtn');

    // Eğer sepet boşsa başa dön
    if (cart.length === 0) {
        window.location.href = 'index.html';
    }

    // Sipariş Özeti Çizimi
    let totalAmount = 0;
    summaryItemsBlock.innerHTML = '';
    cart.forEach(item => {
        totalAmount += item.price * item.quantity;
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.marginBottom = '0.5rem';
        div.innerHTML = `
            <span>${item.quantity}x ${item.name}</span>
            <span style="font-weight: 500;">${formatPrice(item.price * item.quantity)}</span>
        `;
        summaryItemsBlock.appendChild(div);
    });
    summaryTotalEl.textContent = formatPrice(totalAmount);

    // Kredi Kartı Görsel Dinamizmi
    const cardNameInput = document.getElementById('cardName');
    const cardNumberInput = document.getElementById('cardNumber');
    const cardExpiryInput = document.getElementById('cardExpiry');
    
    // Görsel Elementler
    const ccVisualName = document.getElementById('ccVisualName');
    const ccVisualNumber = document.getElementById('ccVisualNumber');
    const ccVisualExpiry = document.getElementById('ccVisualExpiry');

    cardNameInput.addEventListener('input', (e) => {
        ccVisualName.textContent = e.target.value.toUpperCase() || 'AD SOYAD';
    });

    cardNumberInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        let formattedStr = '';
        for (let i = 0; i < val.length; i++) {
            if (i > 0 && i % 4 === 0) formattedStr += ' ';
            formattedStr += val[i];
        }
        e.target.value = formattedStr;
        ccVisualNumber.textContent = formattedStr || '**** **** **** ****';
    });

    cardExpiryInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 2) {
            val = val.substring(0,2) + '/' + val.substring(2,4);
        }
        e.target.value = val;
        ccVisualExpiry.textContent = val || 'AA/YY';
    });

    // Formun default gönderimini engelle
    document.getElementById('paymentForm').addEventListener('submit', (e) => {
        e.preventDefault();
    });

    // "Ödemeyi Tamamla" Akışı
    completePaymentBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        const cvv = document.getElementById('cardCvv').value;
        const cNum = cardNumberInput.value.replace(/\s+/g, '');
        const cName = cardNameInput.value;
        const cExp = cardExpiryInput.value;

        if (!cName || cNum.length < 16 || cExp.length < 5 || cvv.length < 3) {
            showToast('Lütfen kart verilerini eksiksiz girin.', true);
            return;
        }

        completePaymentBtn.textContent = 'İşleniyor...';
        completePaymentBtn.disabled = true;

        try {
            // ADIM 1: Ödemeyi Kaydet (/api/payments)
            console.log('1. API İsteği: Ödeme alınıyor...');
            const paymentRes = await fetch('https://savora-yemek-satis-alaras-projects-44e3d712.vercel.app/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cardHolderName: cName,
                    cardNumber: cNum,
                    expiryDate: cExp,
                    cvv: cvv
                })
            });

            if (!paymentRes.ok) {
                const pErr = await paymentRes.json();
                throw new Error(pErr.error || 'Ödeme reddedildi.');
            }

            console.log('Ödeme başarılı. Sipariş oluşturuluyor...');

            // ADIM 2: Siparişi Oluştur (/api/orders)
            const orderRes = await fetch('https://savora-yemek-satis-alaras-projects-44e3d712.vercel.app/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    totalAmount: totalAmount,
                    kullaniciId: 'demo_user_123'
                })
            });

            if (!orderRes.ok) {
                const oErr = await orderRes.json();
                throw new Error(oErr.error || 'Siparişiniz kaydedilemedi.');
            }

            // Başarılı Senaryo
            localStorage.removeItem('savoraCart'); // Sepeti temizle
            
            showToast('Siparişiniz yola çıktı! 🎉');
            
            // 3 saniye sonra menüye dön
            setTimeout(() => {
                alert('Ödemeniz alındı, yemeğiniz yakında kapınızda! Afiyet olsun.');
                window.location.href = 'index.html';
            }, 1000);

        } catch (err) {
            console.error('Akış Hatası:', err);
            showToast(`Hata: ${err.message}`, true);
            completePaymentBtn.textContent = 'Tekrar Dene';
            completePaymentBtn.disabled = false;
        }
    });
}
