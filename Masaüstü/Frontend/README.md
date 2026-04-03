# Savora Masaüstü Uygulama (Önyüz) Dokümantasyonu
**Geliştirici:** Sena Maral
**Yayın Adresi:** `https://desktop.savora.com`

Bu doküman, Savora Windows/macOS masaüstü uygulamasında üstlendiğim 6 görevin gelişmiş arayüz bileşenleri (DataGrid, Form Pencereleri vb.) ve REST API entegrasyon süreçlerini açıklamaktadır.

---

## 1. Özel Yemek Talebi Açma
*   **Arayüz (UI) Bileşenleri:** Müşteri ana menüdeki (Ribbon veya Sidebar) "Yeni Talep" sekmesine tıklar ve bağımsız, sürükle-bırak destekli bir *Form Penceresi (Window)* açılır. Kullanıcı geniş form alanlarını (Zengin Metin Editörü, Gelişmiş Tarih/Saat Seçici) kullanarak detayları doldurur.
*   **API Entegrasyonu:** Müşteri "Kaydet ve Gönder" butonuna tıkladığında veya *Ctrl+S* (Kaydet) kısayolunu kullandığında, masaüstü istemcisi (client) verileri `POST https://api.desktop.savora.com/v1/custom-requests` adresine yollar. Başarılı işlem sonrası, işletim sisteminin native *Sistem Tepsisi Bildirimi* (System Tray Notification) ile "Talebiniz kaydedildi" mesajı gösterilir.

---

## 2. Bölgesel Talepler Listeleme
*   **Arayüz (UI) Bileşenleri:** Bölge taleplerine tıklayan satıcının karşısına tam ekran bir *DataGrid / TableView (Veri Izgarası)* bileşeni gelir. Sütunlara göre artan/azalan sıralama başlık tıklaması ile dinamik yapılır. Listenin başında esnek arama çubukları (Search bar) yer alır.
*   **API Entegrasyonu:** Masaüstü istemci açıldığında veya yenileme tuşuna (F5) basıldığında `GET https://api.desktop.savora.com/v1/custom-requests?location={satıcı_lokasyon}&status=PENDING` uç noktasına istek gönderilir, gelen JSON dizisindeki veriler o *DataGrid* sütunlarına map edilir. 

---

## 3. Talep Teklifi Güncelleme
*   **Arayüz (UI) Bileşenleri:** Teklifler listesindeki (DataGrid) bir satırın üzerine Mouse (Farenin sağ tuşu) ile tıklandığında *Bağlam Menüsü (Context Menu)* açılır. "Teklifi Güncelle" seçildiğinde, satıcının sadece fiyat ve kısa not değiştirebileceği odaklanmış (Modal) küçük bir dialog kutusu ekrana gelir.
*   **API Entegrasyonu:** Güncelle butonuna basıldığında istemci, payload dosyasını paketleyerek `PUT https://api.desktop.savora.com/v1/custom-requests/{request_id}/offers/{offer_id}` çağrısını gerçekleştirir. Yanıt geldikten sonra uygulamadaki sadece o satır API verisine beklemeden güncellenir.

---

## 4. Talebi Geri Çekme
*   **Arayüz (UI) Bileşenleri:** Müşteri listedeki talep satırını fare ile seçili hale getirdikten sonra üst araç çubuğundaki (Toolbar) "Sil" ikonuna tıklar (*veya klavyeden 'Delete' tuşuna basar*). Windows native *MessageBox (Uyarı Kutusu)* çıkarak kullanıcıdan kesin onay ("Emin misiniz?") ister.
*   **API Entegrasyonu:** Evet seçeneği okeylenirse arka planda asenkron olarak `DELETE https://api.desktop.savora.com/v1/custom-requests/{request_id}` bağlantısına istek yollanır. O satır DataGrid veya ListView ekranından kaldırılır.

---

## 5. Satıcıya Yorum Yapma
*   **Arayüz (UI) Bileşenleri:** İşlemi tamamlanan kullanıcının masaüstü ekranında sağ alt köşeden kayarak gelen bir sistem bildirimiyle "Satıcıyı Değerlendir" aksiyonu oluşur. Buna tıkladığında yatayda sıralanmış Yıldız Bileşenleri (*Star Rating Control*) ve yorum yazılabilecek bir *Rich Text Box* alanı gelir.
*   **API Entegrasyonu:** "Gönder" butonuna tıklanınca bu veri `POST https://api.desktop.savora.com/v1/sellers/{seller_id}/reviews` isteği üzerinden aktarılır. İstek başarılı olduğunda form penceresi Fade-Out efektiyle kapanır.

---

## 6. Yorum ve Şikayetler Listeleme
*   **Arayüz (UI) Bileşenleri:** Geniş masaüstü alanı sayesinde satıcılar, sol kısımda genel özet ve pasta grafiklerin (Örn: %80 beş yıldız), sağ tarafta ise yatay şekilde sıralanmış uzun yorum listelerinin bulunduğu *Split Pane (İkiye Bölünmüş Panel)* düzenine sahip bir "Değerlendirmeler" sayfası kullanır.
*   **API Entegrasyonu:** İlgili menüye (Örn: Ağaç görünümü/Tree View menüsüne) geçildiğinde istemci `GET https://api.desktop.savora.com/v1/sellers/{seller_id}/reviews?sort=newest` çağrısını gerçekleştirir ve gelen array veri modelini *MVVM (Model-View-ViewModel)* ya da benzeri bir yaklaşımla arayüze Data-Bind eder (bağlar).


