const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
// KESİNLİKLE DİĞER TÜM İŞLEMLERDEN ÖNCE CORS ÇAĞIRILMALIDIR!
app.use(cors());
app.use(express.json());

// --- VERİTABANI BAĞLANTISI ---
async function connectDB() {
    try {
        let uri = process.env.MONGO_URI;
        
        if (!uri) {
            console.log("MONGO_URI bulunamadı, geçici MongoDB (memory-server) başlatılıyor...");
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongoServer = await MongoMemoryServer.create();
            uri = mongoServer.getUri();
        }
        
        await mongoose.connect(uri);
        console.log(`MongoDB'ye başarıyla bağlanıldı: ${uri}`);
    } catch (err) {
        console.error("MongoDB bağlantı hatası:", err);
    }
}
connectDB();

// --- MONGOOSE SCHEMAS VE MODELLER ---
// Frontend uyumluluğu için _id'yi id olarak dönüştüren ayarlar
const schemaOptions = {
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: function (doc, ret) {   delete ret._id;  }
    }
};

const OrderSchema = new mongoose.Schema({
    items: { type: Array, required: true },
    totalAmount: { type: Number, required: true },
    customerInfo: { type: Object },
    status: { type: String, default: 'Hazırlanmıyor' },
    createdAt: { type: Date, default: Date.now }
}, schemaOptions);

const PaymentSchema = new mongoose.Schema({
    cardHolderName: { type: String, required: true },
    maskedCardNumber: { type: String, required: true },
    expiryDate: { type: String, required: true }
}, schemaOptions);

const Order = mongoose.model('Order', OrderSchema);
const Payment = mongoose.model('Payment', PaymentSchema);

// --- SİPARİŞ İŞLEMLERİ ---

// 1. POST: Sipariş Oluşturma
app.post('/api/orders', async (req, res) => {
    try {
        const { items, totalAmount, customerInfo } = req.body;
        
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Sipariş içeriği boş olamaz.' });
        }

        const newOrder = new Order({
            items,
            totalAmount,
            customerInfo,
            status: 'Hazırlanmıyor'
        });
        
        await newOrder.save();
        res.status(201).json({ message: 'Sipariş başarıyla oluşturuldu.', order: newOrder });
    } catch (error) {
        res.status(500).json({ error: 'Sunucu hatası', details: error.message });
    }
});

// 2. GET: Sipariş Geçmişini Görüntüleme
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find();
        res.json({ orders });
    } catch (error) {
        res.status(500).json({ error: 'Sunucu hatası', details: error.message });
    }
});

// 3. GET: Aktif Sipariş Detayı
app.get('/api/orders/active', async (req, res) => {
    try {
        // İptal edilen ve Tamamlanan dışındakileri getir
        const activeOrders = await Order.find({ status: { $nin: ['İptal Edildi', 'Tamamlandı'] } });
        res.json({ activeOrders });
    } catch (error) {
        res.status(500).json({ error: 'Sunucu hatası', details: error.message });
    }
});

// 4. PUT: Sipariş Durumu Güncelleme
app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        if (!updatedOrder) {
            return res.status(404).json({ error: 'Sipariş bulunamadı.' });
        }

        res.json({ message: 'Sipariş durumu güncellendi.', order: updatedOrder });
    } catch (error) {
        res.status(500).json({ error: 'Sunucu hatası', details: error.message });
    }
});

// 5. DELETE: Sipariş İptal Etme (Sadece hazırlanmayanlar)
app.delete('/api/orders/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ error: 'Sipariş bulunamadı.' });
        }
        
        if (order.status !== 'Hazırlanmıyor') {
            return res.status(400).json({ error: 'Sipariş hazırlanmaya başlandığı veya tamamlandığı için iptal edilemez.' });
        }

        order.status = 'İptal Edildi';
        await order.save();
        
        res.json({ message: 'Sipariş başarıyla iptal edildi.', order });
    } catch (error) {
        res.status(500).json({ error: 'Sunucu hatası', details: error.message });
    }
});


// --- ÖDEME İŞLEMLERİ ---

// 6. POST: Ödeme Yöntemi Kaydetme (Kredi kartı maskelenmeli)
app.post('/api/payments', async (req, res) => {
    try {
        const { cardHolderName, cardNumber, expiryDate, cvv } = req.body;

        if (!cardNumber || cardNumber.length < 16) {
            return res.status(400).json({ error: 'Geçersiz kredi kartı numarası.' });
        }

        // Kart numarasını maskeleme (Sadece son 4 haneyi göster)
        const maskedCardNumber = '*'.repeat(cardNumber.length - 4) + cardNumber.slice(-4);

        const newPayment = new Payment({
            cardHolderName,
            maskedCardNumber,
            expiryDate
        });

        await newPayment.save();
        res.status(201).json({ message: 'Ödeme yöntemi başarıyla kaydedildi (Kart maskeli).', payment: newPayment });
    } catch (error) {
        res.status(500).json({ error: 'Sunucu hatası', details: error.message });
    }
});

// Sunucuyu başlatma
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});

module.exports = app;
