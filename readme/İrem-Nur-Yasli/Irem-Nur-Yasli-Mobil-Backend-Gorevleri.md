# İrem Nur Yaşlı - Mobil Backend (REST API Bağlantısı) Görevleri

Mobil uygulamadan grubun REST API'sine (Express + MongoDB, JWT'li) yapılan bağlantılar. Tüm korumalı isteklerde `Authorization: Bearer <token>` başlığı kullanılır.

## 🎬 Mobil Backend Kanıt Videoları

| # | Servis | Endpoint | Bağlantı |
|---|---|---|---|
| 1 | Üye Kaydı | `POST /api/users/register` | [▶ İzle](LINK_EKLENECEK) |
| 2 | Profil Görüntüleme | `GET /api/users/profile` | [▶ İzle](LINK_EKLENECEK) |
| 3 | Şifre Güncelleme | `PUT /api/users/password` | [▶ İzle](LINK_EKLENECEK) |
| 4 | Hesap Silme | `DELETE /api/users/account` | [▶ İzle](LINK_EKLENECEK) |
| 5 | Adres Tanımlama | `POST /api/users/addresses` | [▶ İzle](LINK_EKLENECEK) |
| 6 | Satıcı Yorumları | `GET /api/reviews/:sellerId` | [▶ İzle](LINK_EKLENECEK) |

> **Not:** Videolarda mobil uygulamadan REST API'ye isteğin gittiği ve işlemin gerçekleştiği net olarak gösterilmelidir. Uygulamada her işlemin altında "Sunucu yanıtını gör (teknik)" bölümü vardır; HTTP durum kodu ve dönen JSON burada görünür.

---

### 1. Üye Kaydı Servisi
* **Endpoint:** `POST /api/users/register`
* **Gövde:** `{ name, email, phone, password }`
* **İşlev:** Form verilerini toplar, API'ye gönderir; başarı (201) sonrası otomatik giriş yapar.
* **Teknik:** axios ile POST; hata yönetimi (400 — e-posta zaten kayıtlı).

### 2. Giriş Servisi (token alma)
* **Endpoint:** `POST /api/users/login`
* **Gövde:** `{ email, password }` → Yanıt: `{ token, user }`
* **İşlev:** Dönen JWT token AsyncStorage'a kaydedilir; axios interceptor ile sonraki isteklere otomatik eklenir.

### 3. Profil Görüntüleme Servisi
* **Endpoint:** `GET /api/users/profile` (Bearer token)
* **İşlev:** Kullanıcının ad, e-posta, telefon ve adres bilgilerini çekip gösterir. URL'de id yoktur; kullanıcı token'dan tespit edilir.

### 4. Şifre Güncelleme Servisi
* **Endpoint:** `PUT /api/users/password` (Bearer token)
* **Gövde:** `{ currentPassword, newPassword }`
* **İşlev:** Mevcut şifre doğrulanır; yanlışsa 400 "Mevcut şifre hatalı." gösterilir.

### 5. Hesap Silme Servisi
* **Endpoint:** `DELETE /api/users/account` (Bearer token)
* **İşlev:** Onay sonrası hesabı siler, token temizlenir, giriş ekranına dönülür.

### 6. Adres Tanımlama Servisi
* **Endpoint:** `POST /api/users/addresses` (Bearer token)
* **Gövde:** `{ title, addressLine, city, district }` → Yanıt: güncel adres listesi.

### 7. Satıcı Yorumlarını Listeleme Servisi
* **Endpoint:** `GET /api/sellers` (satıcı listesi) + `GET /api/reviews/:sellerId` (yorumlar)
* **İşlev:** Satıcı seçilir, o satıcının puan ve yorumları listelenir.

---

**Teknik Detaylar:** axios merkezi instance, request interceptor ile Bearer Token, try/catch ile hata yönetimi (400/401/404), JSON parse ve UI'da gösterim.
