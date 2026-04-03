const express = require('express');
const cors = require('cors');

const app = express();
// KESİNLİKLE DİĞER TÜM İŞLEMLERDEN ÖNCE CORS ÇAĞIRILMALIDIR!
app.use(cors());
app.use(express.json());

// In-memory veri deposu
let orders = [];
let payments = [];
let orderIdCounter = 1;

// --- SİPARİŞ İŞLEMLERİ ---

// 1. POST: Sipariş Oluşturma
app.post('/api/orders', (req, res) => {
    const { items, totalAmount, customerInfo } = req.body;
    
    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Sipariş içeriği boş olamaz.' });
    }

    const newOrder = {
        id: orderIdCounter++,
        items,
        totalAmount,
        customerInfo,
        status: 'Hazırlanmıyor', // Örnek statüler: Hazırlanmıyor, Hazırlanıyor, Tamamlandı, İptal Edildi
        createdAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    res.status(201).json({ message: 'Sipariş başarıyla oluşturuldu.', order: newOrder });
});

// 2. GET: Sipariş Geçmişini Görüntüleme
app.get('/api/orders', (req, res) => {
    // Burada istenirse query param ile user'a göre filtrelenebilir.
    res.json({ orders });
});

// 3. GET: Aktif Sipariş Detayı
app.get('/api/orders/active', (req, res) => {
    // Aktif siparişler iptal edilmeyen ve tamamlanmayanlardır
    const activeOrders = orders.filter(
        o => o.status !== 'İptal Edildi' && o.status !== 'Tamamlandı'
    );
    res.json({ activeOrders });
});

// 4. PUT: Sipariş Durumu Güncelleme
app.put('/api/orders/:id/status', (req, res) => {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
        return res.status(404).json({ error: 'Sipariş bulunamadı.' });
    }

    orders[orderIndex].status = status;
    res.json({ message: 'Sipariş durumu güncellendi.', order: orders[orderIndex] });
});

// 5. DELETE: Sipariş İptal Etme (Sadece hazırlanmayanlar)
app.delete('/api/orders/:id', (req, res) => {
    const orderId = parseInt(req.params.id);
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
        return res.status(404).json({ error: 'Sipariş bulunamadı.' });
    }
    
    const order = orders[orderIndex];

    // İptal kuralı: Sadece "Hazırlanmıyor" (veya benzeri bir ilk aşama) durumundaysa iptal edilebilir.
    if (order.status !== 'Hazırlanmıyor') {
        return res.status(400).json({ error: 'Sipariş hazırlanmaya başlandığı veya tamamlandığı için iptal edilemez.' });
    }

    order.status = 'İptal Edildi';
    res.json({ message: 'Sipariş başarıyla iptal edildi.', order });
});


// --- ÖDEME İŞLEMLERİ ---

// 6. POST: Ödeme Yöntemi Kaydetme (Kredi kartı maskelenmeli)
app.post('/api/payments', (req, res) => {
    const { cardHolderName, cardNumber, expiryDate, cvv } = req.body;

    if (!cardNumber || cardNumber.length < 16) {
        return res.status(400).json({ error: 'Geçersiz kredi kartı numarası.' });
    }

    // Kart numarasını maskeleme (Sadece son 4 haneyi göster)
    const maskedCardNumber = '*'.repeat(cardNumber.length - 4) + cardNumber.slice(-4);

    const savedPayment = {
        id: payments.length + 1,
        cardHolderName,
        maskedCardNumber,
        expiryDate
        // CVV gibi hassas veriler kaydedilmez!
    };

    payments.push(savedPayment);
    res.status(201).json({ message: 'Ödeme yöntemi başarıyla kaydedildi (Kart maskeli).', payment: savedPayment });
});

// Sunucuyu başlatma
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});

module.exports = app;
