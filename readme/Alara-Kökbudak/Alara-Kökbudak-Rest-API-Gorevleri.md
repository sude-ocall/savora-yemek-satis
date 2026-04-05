# Alara Kökbudak - REST API (Arka Uç) Görevleri

### 1. Sipariş Yönetimi Servisleri
* **API Uç Noktaları:** `POST /orders`, `GET /orders`, `DELETE /orders/{orderId}`
* **Görev:** Sipariş oluşturma, listeleme ve iptal mantığının sunucu tarafında kurgulanması.
* **İşleticiler:**
    * Sipariş verilerinin doğrulanması ve veritabanına kaydedilmesi.
    * Kullanıcının sadece kendi siparişlerini görebileceği SQL/NoSQL sorgularının yazılması.
    * İptal isteği geldiğinde sipariş durumunun (Hazırlanıyor/Yola Çıktı) kontrol edilmesi.
* **Teknik Detaylar:**
    * HTTP durum kodlarının yönetimi (201 Created, 403 Forbidden).
    * İşlem güvenliği için veritabanı Transaction yönetimi.
---
### 2. Sipariş Durumu ve Yetkilendirme
* **API Uç Noktası:** `PUT /orders/{orderId}`
* **Görev:** Sipariş aşamalarının sadece yetkili satıcılar tarafından güncellenmesi.
* **İşleticiler:**
    * İstek atan kullanıcının "Satıcı" (Seller) rolüne sahip olup olmadığının kontrolü.
    * Geçersiz durum geçişlerinin (örn: Teslim Edildi -> Hazırlanıyor) engellenmesi.
* **Teknik Detaylar:**
    * Role-Based Access Control (RBAC) middleware entegrasyonu.
    * JSON Web Token (JWT) üzerinden kimlik doğrulama.

---

### 3. Ödeme Sistemleri ve Güvenlik
* **API Uç Noktası:** `POST /payments`
* **Görev:** Ödeme yöntemlerinin güvenli bir şekilde kaydedilmesi ve yönetilmesi.
* **İşleticiler:**
    * Kredi kartı verilerinin alınması ve PCI-DSS standartlarına uygun işlenmesi.
    * Kart bilgilerinin veritabanına açık metin olarak değil, şifrelenmiş (encrypted) olarak yazılması.
* **Teknik Detaylar:**
    * AES-256 veya benzeri simetrik şifreleme algoritmalarının kullanımı.
    * Hassas verilerin güvenliği için Salt/Hash mekanizmaları.
