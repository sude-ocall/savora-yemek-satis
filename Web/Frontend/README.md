# Savora Frontend (Önyüz) Dokümantasyonu
**Geliştirici:** Sena Maral
**Yayın Adresi:** `https://web.savora.com`

Bu doküman, Savora web uygulamasında üstlendiğim 6 görevin kullanıcı arayüzü (UI) davranışlarını ve REST API ile olan entegrasyon süreçlerini açıklamaktadır.

---

## 1. Özel Yemek Talebi Açma
*   **Arayüz (UI) Bileşenleri:** Kullanıcı ana ekranda bulunan "Özel Yemek Talep Et" butonuna tıklar ve karşına bir Modal form açılır. Bu formda; *Yemek Adı (Input)*, *Bütçe (Number Input)*, *Teslim Zamanı (Date Picker)* ve *Bölge (Dropdown)* gibi kontrol elemanları yer alır.
*   **API Entegrasyonu:** Müşteri "Talebi Gönder" butonuna tıkladığında form kontrolünden (validation) geçen veriler JSON formatında paketlenip HTTPS üzerinden `POST https://api.savora.com/v1/custom-requests` uç noktasına iletilir. Sunucudan yanıt döndüğünde ekranda "Talebiniz başarıyla alındı" şeklinde yeşil bir Toast mesajı (bildirim) gösterilir ve form kapatılır.

---

## 2. Bölgesel Talepler Listeleme
*   **Arayüz (UI) Bileşenleri:** Satıcılar kendi panellerine giriş yaptığında "Bölgemdeki Talepler" sayfasına yönlendirilir. Burada her bir müşteri talebi özel tasarım bir *Card (Kart)* bileşeni içerisinde listelenir. Üst kısımda ise il/ilçe seçimi yapılabilen filtreleme barı bulunur.
*   **API Entegrasyonu:** Sayfa ilk yüklendiğinde, satıcının mevcut bölgesi parametre olarak alınarak `GET https://api.savora.com/v1/custom-requests?location={bolge}&status=PENDING` uç noktasına istek atılır. Dönen JSON dizisi ekrandaki kart bileşenlerine render edilir. 

---

## 3. Talep Teklifi Güncelleme
*   **Arayüz (UI) Bileşenleri:** Satıcı, "Verdiğim Teklifler" menüsünde listelenen taleplerinin yanındaki kalem ikonuna (Düzenle) tıklar. Ekranda küçük bir Pop-up (Dialog) açılır. Bu dialog içerisinde satıcı yeni bir fiyat belirleyeceği ve kısa mesaj ekleyebileceği form alanlarıyla karşılaşır.
*   **API Entegrasyonu:** Kaydet butonuna tıklandığında form verisi alınıp `PUT https://api.savora.com/v1/custom-requests/{request_id}/offers/{offer_id}` adresine gönderilir. İstek başarıyla tamamlandığında DOM(Ekran) güncellenerek listedeki tutar anında değişir.

---

## 4. Talebi Geri Çekme
*   **Arayüz (UI) Bileşenleri:** Müşterinin "Taleplerim" sayfasında, henüz onaylanmamış taleplerinin hizasında kırmızı renkli bir "İptal Et" (Çöp Kutusu ikonu) butonu bulunur. Buna tıklandığında ekranda "Talebinizi geri çekmek istediğinizden emin misiniz?" yazan bir onay kutusu (Confirm Alert) belirir.
*   **API Entegrasyonu:** Müşteri onayladığında `DELETE https://api.savora.com/v1/custom-requests/{request_id}` endpointine istek fırlatılır. Başarılı HTTP 200 kodu alındığında, o talep satırı arayüzden sayfa yenilenmeden silinir.

---

## 5. Satıcıya Yorum Yapma
*   **Arayüz (UI) Bileşenleri:** Yemek siparişi "Teslim Edildi" olduğunda kullanıcının ekranında "Satıcıyı Değerlendir" adında bir form belirir. Puanlama için dinamik yıldızlar (Star Rating) ve yorum için boş bir yorum kutusu (Textarea) bulunur.
*   **API Entegrasyonu:** "Gönder" dendiğinde veriler `POST https://api.savora.com/v1/sellers/{seller_id}/reviews` uç noktasına yollanır. Başarılı yanıtta form onay tikine dönüşerek kaybolur.

---

## 6. Yorum ve Şikayetler Listeleme
*   **Arayüz (UI) Bileşenleri:** Savora platformundaki bir satıcının profilinde "Değerlendirmeler" bölümü yer alır. Yorumlar; profil fotoğrafı, müşteri adı, bırakılan yıldız sayısı ve metin dizilimiyle beraber listelenir.
*   **API Entegrasyonu:** Yorumlar tab'i açıldığında `GET https://api.savora.com/v1/sellers/{seller_id}/reviews` isteği çalıştırılır ve arayüze veri olarak yansıtılır. Yöneticiler için şikayetlerin filtrelemesi API tarafındaki ek parametreler ile (ör: `?rating=1`) yönetilebilir.

---

## Arayüz (UI) Ekran Tasarımları
*Not: İlgili arayüz ekranlarının tasarımları aşağıda verilmiştir.*

![Özel Talep Açma Ekranı](https://placehold.co/800x400/e2e8f0/1e293b?text=Ozel+Talep+Acma+Ekrani)

![Bölgesel Talepler Listesi Arayüzü](https://placehold.co/800x400/e2e8f0/1e293b?text=Bolgesel+Talepler+Listesi)

![Teklif Güncelleme Modalı](https://placehold.co/800x400/e2e8f0/1e293b?text=Teklif+Guncelleme+Modali)

![Talebi Geri Çekme Onayı](https://placehold.co/800x400/e2e8f0/1e293b?text=Talebi+Geri+Cekme+Onayi)

![Satıcı Puanlama ve Yorum Yapma](https://placehold.co/800x400/e2e8f0/1e293b?text=Satici+Puanlama+ve+Yorum+Yapma)

![Satıcı Profili ve Şikayet Listesi](https://placehold.co/800x400/e2e8f0/1e293b?text=Satici+Profili+ve+Sikayet+Listesi)
