# Alara Kökbudak - Mobil Ön Uç (Frontend) Görevleri

### 1. Sipariş Onay ve Tamamlama Ekranı Tasarımı
* **Görev:** Sepetteki ürünlerin son kontrolünün yapıldığı ve siparişin resmileştirildiği arayüzün geliştirilmesi.
* **İşleticiler:**
    * Seçilen yemeklerin listesi, adetleri ve birim fiyatlarının dinamik olarak listelenmesi.
    * Toplam tutarın (yemek bedeli + gönderim ücreti) anlık hesaplanarak kullanıcıya gösterilmesi.
    * Teslimat adresi seçimi veya yeni adres giriş alanı tasarımı.
    * "Siparişi Onayla" butonu ve tıklama sonrası API'ye (`POST /orders`) veri gönderimi.
* **Teknik Detaylar:**
    * Dinamik veri bağlama (Data Binding) ile sepet içeriğinin güncellenmesi.
    * Kullanıcıyı bekletirken gösterilecek "Yükleniyor" animasyonları.

---

### 2. Sipariş Geçmişi Listeleme Arayüzü
* **Görev:** Kullanıcının geçmiş siparişlerini kronolojik olarak listeleyen ekranın oluşturulması.
* **İşleticiler:**
    * Siparişlerin kart (CardView) tasarımı şeklinde; tarih, restoran adı ve toplam tutar bilgileriyle sunulması.
    * Siparişlerin "Tamamlandı" veya "İptal Edildi" gibi durum etiketleriyle (Badge) görselleştirilmesi.
    * Geçmiş bir siparişe tıklandığında detay sayfasına (`GET /orders/{orderId}`) yönlendirme yapılması.
* **Teknik Detaylar:**
    * Performans için kaydırılabilir liste (RecyclerView/ListView) optimizasyonu.
    * Veri çekme hatası durumunda gösterilecek "Tekrar Dene" ekranları.

---

### 3. Güvenli Ödeme ve Kart Kayıt Formu
* **Görev:** Kullanıcının ödeme bilgilerini güvenli bir şekilde girebileceği form arayüzünün tasarlanması.
* **İşleticiler:**
    * Kredi kartı numarası, son kullanma tarihi ve CVV için maskelenmiş giriş alanları.
    * Kart numarasına göre otomatik kart tipi (Visa/Mastercard) ikonu gösterimi.
    * "Bu kartı sonraki alışverişlerim için kaydet" seçeneği (Switch/Checkbox).
* **Teknik Detaylar:**
    * Form doğrulama (Validation); eksik veya hatalı numara girildiğinde anlık uyarı verme.
    * Güvenlik odaklı giriş alanı (Secure Text Entry) kullanımı.

---

### 4. Görsel Sipariş Durum Takip Sistemi
* **Görev:** Siparişin anlık aşamasını kullanıcıya interaktif bir zaman çizelgesi üzerinden sunmak.
* **İşleticiler:**
    * Siparişin durumuna göre (`PUT /orders/{orderId}` verisiyle) ilerleyen bir "Progress Bar" tasarımı.
    * Durum "Yola Çıktı" olduğunda kurye ikonunun görsel olarak hareket ettirilmesi veya aktif hale getirilmesi.
    * Her durum değişikliğinde (Hazırlanıyor, Yola Çıktı, Teslim Edildi) kullanıcıya görsel geri bildirim verilmesi.
* **Teknik Detaylar:**
    * Durumlar arası geçişler için akıcı animasyonlar (Transition Animations).
    * Durum bilgisini belirli aralıklarla API'den kontrol eden (Polling) yapı.
