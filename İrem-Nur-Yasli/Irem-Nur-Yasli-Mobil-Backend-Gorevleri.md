# İrem Nur Yaşlı - Mobil Backend Görevleri

**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** [Link buraya eklenecek]

## 1. Üye Olma (Kayıt) Servisi
* **API Endpoint:** `POST /auth/register`
* **Görev:** Mobil uygulamada kullanıcı kayıt işlemini gerçekleştiren servis entegrasyonu.
* **İşlevler:**
    * Kullanıcı verilerini (email, password, firstName, lastName) toplama.
    * Form validasyonu (email formatı, şifre karmaşıklığı).
    * Başarılı kayıt durumunda kullanıcıyı giriş ekranına yönlendirme.
* **Teknik Detaylar:**
    * Request/Response model sınıflarının oluşturulması.
    * Error handling (409 Conflict, 400 Bad Request).

## 2. Profil Bilgilerini Görüntüleme Servisi
* **API Endpoint:** `GET /users/{userId}`
* **Görev:** Kullanıcı profil bilgilerini API'den çekip mobil uygulamada gösterme.
* **İşlevler:**
    * JWT token ile kimlik doğrulama.
    * Gelen veriyi parse edip UI'da gösterme.
    * Token süresi dolmuşsa refresh token ile yenileme.
* **Teknik Detaylar:**
    * Authentication header ekleme (Bearer Token).
    * Response caching stratejisi.

## 3. Şifre Güncelleme Servisi
* **API Endpoint:** `PUT /users/{userId}/password`
* **Görev:** Kullanıcı şifre değiştirme işlemini gerçekleştirme.
* **İşlevler:**
    * Eski ve yeni şifre verilerini toplama.
    * Başarılı güncelleme sonrası cache temizleme.
