# Alara Kökbudak - Mobil Arka Uç (BFF) Görevleri

### 1. Sipariş Oluşturma Servisi
* **API Uç Noktası:** `POST /orders`
* **Görev:** Kullanıcının sepetindeki ürünleri siparişe dönüştürme işlemini gerçekleştirmek
* **İşleticiler:**
    * Sepet verilerinin (ürün ID, adet) toplanması
    * Stok kontrolü ve toplam tutar hesaplama
    * API'ye POST isteği gönderme
    * Başarılı işlem sonrası sipariş onay sayfasına yönlendirme
* **Teknik Detaylar:**
    * HTTP İstemcisi kullanımı (Retrofit/OkHttp)
    * İstek/Yanıt modeli sınıfları oluşturma
    * Hata işleme (400 Bad Request, 401 Yetkisiz)
---

### 2. Ödeme Yöntemi Kaydetme Servisi
* **API Uç Noktası:** `POST /payments`
* **Görev:** Kullanıcı kart bilgilerini güvenli şekilde sisteme kaydetme
* **İşleticiler:**
    * Kart bilgilerinin (No, SKT, CVV) formdan alınması
    * İstemci tarafı maskeleme ve doğrulama
    * Şifrelenmiş verinin API'ye iletilmesi
* **Teknik Detaylar:**
    * Veri güvenliği ve şifreleme protokolleri
    * Bearer Token ile kimlik doğrulama
