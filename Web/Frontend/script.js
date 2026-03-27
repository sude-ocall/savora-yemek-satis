const BASE_URL = 'http://localhost:3000/api';


async function talepGonder() {
    const veri = {
        kullaniciAdi: document.getElementById('isim').value,
        istenenYemek: document.getElementById('yemek').value,
        ozelNot: document.getElementById('not').value
    };
    const cevap = await fetch(`${BASE_URL}/talep-ac`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(veri)
    });
    const sonuc = await cevap.json();
    alert(sonuc.mesaj);
}



async function yorumYap() {
    const veri = {
        kullaniciAdi: document.getElementById('yorumIsim').value,
        yorum: document.getElementById('yorumMetni').value,
        puan: document.getElementById('puan').value
    };
    const cevap = await fetch(`${BASE_URL}/yorum-yap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(veri)
    });
    const sonuc = await cevap.json();
    alert(sonuc.mesaj);
}


async function yorumlariListele() {
    const cevap = await fetch(`${BASE_URL}/yorumlar`);
    const sonuc = await cevap.json();
    document.getElementById('yorumListesi').innerText = JSON.stringify(sonuc, null, 2);
}

async function talepGuncelle() {
    const id = document.getElementById('guncelleId').value;
    const veri = { ozelNot: document.getElementById('yeniNot').value };
    const cevap = await fetch(`${BASE_URL}/talep-guncelle/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(veri)
    });
    const sonuc = await cevap.json();
    alert(sonuc.mesaj);
}


async function taleplerimFiltrele() {
    const isim = document.getElementById('filtreIsim').value;
    const cevap = await fetch(`${BASE_URL}/taleplerim/${isim}`);
    const sonuc = await cevap.json();
    document.getElementById('filtreSonuc').innerText = JSON.stringify(sonuc, null, 2);
}

async function talepIptal() {
    const id = document.getElementById('iptalId').value;
    const cevap = await fetch(`${BASE_URL}/talep-iptal/${id}`, { method: 'DELETE' });
    const sonuc = await cevap.json();
    alert(sonuc.mesaj);
}