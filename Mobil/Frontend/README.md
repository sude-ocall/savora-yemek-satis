# Savora Mobil Uygulama (Önyüz) Dokümantasyonu
**Geliştirici:** Sena Maral
**Yayın Adresi:** `https://mobil.savora.com`

Bu doküman, Savora iOS/Android mobil uygulamasında üstlendiğim 6 görevin yerel (native) arayüz bileşenleri ve mobil REST API entegrasyon süreçlerini açıklamaktadır.

---

## 1. Özel Yemek Talebi Açma
*   **Arayüz (UI) Bileşenleri:** Müşteri ana ekrandaki sekmelerden veya alt kısımdaki belirgin *Floating Action Button (FAB)* ikonuna dokunarak "Yeni Talep" ekranını açar. Formda tarih seçimi için yerel *Date Picker* kullanılarak kullanım kolaylığı sağlanır. Bütçe ve isim gibi değerler standart *TextInput* bileşenleriyle alınır.
*   **API Entegrasyonu:** Müşteri "Talebi Gönder" butonuna dokunduğunda cihazın internet (Wi-Fi/Hücresel) durumu kontrol edilir. Veriler `POST https://api.mobil.savora.com/v1/custom-requests` uç noktasına fırlatılır. Başarılı HTTP 201 yanıtı döndüğünde kullanıcı ekranın altından yukarı doğru hafifçe çıkan uyarıcı bir *Snackbar (veya native Toast)* ile bilgilendirilir.

---

## 2. Bölgesel Talepler Listeleme
*   **Arayüz (UI) Bileşenleri:** Satıcı uygulamaya girdiğinde ekran dilerse *Google/Apple Maps* harita görünümü (Map View) ya da klasik sonsuz kaydırmalı liste (*RecyclerView / FlatList*) şeklinde açılır. Her talep gölgeli bir *Card* bileşeni içinde ve "1.2 km uzaklıkta" gibi uzaklık logolarıyla zenginleştirilmiştir. Ekranı yukarıdan aşağıya çekerek (Pull-to-Refresh) liste yenilenebilir.
*   **API Entegrasyonu:** Satıcının cihazından cihaz konumu (GPS) izni alınarak o anki lokasyonuyla `GET https://api.mobil.savora.com/v1/custom-requests?location={satıcı_gps}&status=PENDING` endpoint'ine istek atılıp asenkron olarak liste render edilir.

---

## 3. Talep Teklifi Güncelleme
*   **Arayüz (UI) Bileşenleri:** Satıcı "Tekliflerim" listesindeki bir karta dokunduğunda ekranın altından yukarı doğru bir *Bottom Sheet Dialog* açılır (ekranın geri kalanı kararır). Satıcı buradan klavyeyi açarak teklif tutarını ve mesajını hızlıca günceller.
*   **API Entegrasyonu:** Satıcının "Güncelle" butonuna dokunmasıyla `PUT https://api.mobil.savora.com/v1/custom-requests/{request_id}/offers/{offer_id}` isteği tetiklenir. Başarılı yanıtta Bottom Sheet aşağı doğru kayarak kapanır ve state yönetimi (ör: Redux/Riverpod) sayesinde listedeki fiyat yeniden istek atmadan güncellenir.

---

## 4. Talebi Geri Çekme
*   **Arayüz (UI) Bileşenleri:** Mobil "Taleplerim" sayfasında, müşteri ilgili talep kartını parmağıyla sola veya sağa doğru kaydırdığında (Swipe-to-Delete) arkasından kırmızı renkli bir "Sil" (Çöp Kutusu) butonu görünür. Sildiğinde mobil cihaza özel bir onay penceresi native *Alert Dialog* (Emin misiniz? Evet / Hayır) çıkar.
*   **API Entegrasyonu:** Kullanıcı Evet seçeneğine dokunduğunda arka planda `DELETE https://api.mobil.savora.com/v1/custom-requests/{request_id}` endpoint'ine istek atılır. Eleman listeden arayüzsel (UI) bir animasyonla eriyerek kaybolur.

---

## 5. Satıcıya Yorum Yapma
*   **Arayüz (UI) Bileşenleri:** Yemek teslim edildikten sonra müşteriye bir push notification (bildirim) gelir. Dokunduğunda direkt "Satıcı Değerlendirme" ekranı açılır. Kullanıcı, dokunarak doldurduğu 5 yıldızlı bir *Star Rating Bar* kullanarak veya parmağını kaydırarak puan verir, *Multiline TextInput* öğesine dilerse deneyimini yazar.
*   **API Entegrasyonu:** Gönderildiğinde `POST https://api.mobil.savora.com/v1/sellers/{seller_id}/reviews` isteği gerçekleşir ve ekranda başarılı lottie animasyonu (hareketli grafik) oynatılarak değerlendirme kapatılır.

---

## 6. Yorum ve Şikayetler Listeleme
*   **Arayüz (UI) Bileşenleri:** Satıcının Savora uygulamasındaki profil sayfasına girildiğinde bir *Top Tab Navigator* (Örn: Menüler | Yorumlar) bulunur. Yorumlar sekmesine geçildiğinde müşteri resimleri yuvarlak *Avatar* bileşenleriyle, yıldızlar ve yorumlar listelenir.
*   **API Entegrasyonu:** Sayfa açılır açılmaz `GET https://api.mobil.savora.com/v1/sellers/{seller_id}/reviews?page=1` isteği yollanır. Kullanıcı aşağı doğru listeyi kaydırdıkça "Pagination" (Sayfalama) tekniğiyle sayfa numarası arttırılarak API'ye yeni istekler atılır ve bellek yorulmaz.

---

## Mobil Arayüz (UI) Ekran Tasarımları

![Mobil Özel Talep Ekrani](mobil-ozel-talep.png)
![Haritalı Bölgesel Talepler](mobil-bolgesel-talepler-harita.png)
![Teklif Güncelleme Bottom Sheet](mobil-teklif-guncelleme.png)
![Talebi Kaydırarak Geri Çekme](mobil-swipe-to-delete.png)
![Mobil Satıcı Puanlama](mobil-yorum-yapma.png)
![Mobil Satıcı Profili Yorumlar](mobil-profil-yorumlari.png)
