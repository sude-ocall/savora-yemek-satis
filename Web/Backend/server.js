const express = require('express');
const cors = require('cors');
const app = express();

// --- ARA YAZILIMLAR (GÜVENLİK VE VERİ OKUMA) ---
app.use(cors()); // CORS hatasını engeller
app.use(express.json()); // Gelen JSON verilerini okumamızı sağlar

// --- GEÇİCİ HAFIZA (VERİTABANI NİYETİNE) ---
let talepler = [];
let yorumlar = [];

// ----------------------------------------------------
// GÖREV 1: Özel Yemek Talebi Açma (POST)
// ----------------------------------------------------
app.post('/api/talep-ac', (req, res) => {
    const yeniTalep = {
        id: talepler.length + 1,
        ...req.body
    };
    talepler.push(yeniTalep);
    console.log("Yeni talep alındı:", yeniTalep);
    res.status(201).json({ mesaj: "Talep başarıyla oluşturuldu.", talep: yeniTalep });
});

// ----------------------------------------------------
// GÖREV 2: Talebi Geri Çekme/İptal Etme (DELETE)
// ----------------------------------------------------
app.delete('/api/talep-iptal/:id', (req, res) => {
    const iptalId = parseInt(req.params.id);
    const eskiBoyut = talepler.length;
    talepler = talepler.filter(t => t.id !== iptalId);

    if (talepler.length < eskiBoyut) {
        res.json({ mesaj: `${iptalId} numaralı talebiniz başarıyla geri çekildi.` });
    } else {
        res.status(404).json({ mesaj: "İptal edilecek talep bulunamadı." });
    }
});

// ----------------------------------------------------
// GÖREV 3: Yemeğe Yorum Yapma (POST)
// ----------------------------------------------------
app.post('/api/yorum-yap', (req, res) => {
    const yeniYorum = {
        id: yorumlar.length + 1,
        ...req.body,
        tarih: new Date().toLocaleString('tr-TR')
    };
    yorumlar.push(yeniYorum);
    res.status(201).json({ mesaj: "Yorumunuz için teşekkürler!", eklenenYorum: yeniYorum });
});

// ----------------------------------------------------
// GÖREV 4: Tüm Yorumları Listeleme (GET)
// ----------------------------------------------------
app.get('/api/yorumlar', (req, res) => {
    res.json(yorumlar);
});

// ----------------------------------------------------
// GÖREV 5: Özel Talebi Güncelleme (PUT)
// ----------------------------------------------------
app.put('/api/talep-guncelle/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = talepler.findIndex(t => t.id === id);
    if (index !== -1) {
        talepler[index] = { ...talepler[index], ...req.body };
        res.json({ mesaj: "Talebiniz güncellendi!", guncelHali: talepler[index] });
    } else {
        res.status(404).json({ mesaj: "Güncellenecek talep bulunamadı." });
    }
});

// ----------------------------------------------------
// GÖREV 6: Kullanıcı Adına Göre Talepleri Filtrele (GET)
// ----------------------------------------------------
app.get('/api/taleplerim/:isim', (req, res) => {
    const isim = req.params.isim;
    const sonuc = talepler.filter(t => t.kullaniciAdi.toLowerCase() === isim.toLowerCase());
    res.json({ kullanıcı: isim, bulunanTalepler: sonuc });
});

// --- SUNUCUYU BAŞLAT ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`SAVORA BACKEND SİSTEMİ HAZIR!`);
    console.log(`Adres: http://localhost:${PORT}`);
    console.log(`-----------------------------------------`);
});