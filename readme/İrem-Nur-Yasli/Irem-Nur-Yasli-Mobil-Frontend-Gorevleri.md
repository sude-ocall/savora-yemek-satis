# İrem Nur Yaşlı - Mobil Frontend Görevleri

Mobil uygulama **React Native + Expo** ile geliştirildi. Aşağıdaki 6 gereksinimin tamamı kodlandı ve gerçek backend'e (JWT'li) bağlandı.

## 🎬 Mobil Frontend Kanıt Videosu

| Kanıt | Bağlantı |
|---|---|
| Mobil Frontend Demo Videosu (6 gereksinim) | [▶ İzle](https://youtube.com/shorts/O2xSCYzmwHI) |

> Giriş (Login) ekranı da uygulamada mevcuttur; korumalı işlemler için JWT token buradan alınır.

---

### 1. Üye Olma (Kayıt) Ekranı
* **UI Bileşenleri:** Ad Soyad, E-posta, Telefon, Şifre input alanları; "Üye Ol" butonu; "Zaten hesabın var mı? Giriş Yap" linki; işlem sırasında loading indicator.
* **Form Validasyonu:** Şifre kuralı (min 8 karakter, büyük + küçük harf); boş alan kontrolü; hatalar input altında gösterilir.
* **Kullanıcı Deneyimi:** Başarılı kayıt sonrası otomatik giriş; keyboard dismiss.

### 2. Kullanıcı Profil Görüntüleme Ekranı
* **UI Bileşenleri:** Profil fotoğrafı alanı (baş harf avatar placeholder); ad, e-posta, telefon ve adres bilgileri; alt kısımda kırmızı "Hesabımı Sil" butonu.
* **Kullanıcı Deneyimi:** Veri yüklenirken loading; **pull-to-refresh** ile yenileme.

### 3. Şifre Güncelleme Ekranı
* **UI Bileşenleri:** Mevcut Şifre ve Yeni Şifre alanları; "Şifreyi Güncelle" butonu.
* **Form Validasyonu:** Yeni şifre kuralı (min 8, büyük + küçük harf); mevcut şifre yanlışsa sunucu hatası kullanıcıya gösterilir.

### 4. Hesap Silme
* **UI:** Profil ekranının altında kırmızı "Hesabımı Sil" butonu.
* **Akış:** Onay penceresi (Alert) → silme → oturum kapatılır ve giriş ekranına dönülür.

### 5. Adres Tanımlama Ekranı
* **UI Bileşenleri:** Başlık (Ev/İş), Açık Adres, İlçe, Şehir alanları; "Adresi Kaydet" butonu; kayıtlı adres listesi.
* **Kullanıcı Deneyimi:** Boş alan kontrolü; başarı mesajı ve güncel adres listesi gösterimi.

### 6. Satıcı Yorumları Ekranı
* **UI Bileşenleri:** Satıcı listesi; bir satıcıya dokununca o satıcının yorumları (yıldız puanı, yorum metni, kullanıcı adı, tarih) kart kart listelenir.
* **Kullanıcı Deneyimi:** Liste yüklenirken loading; yorum yoksa bilgilendirme mesajı.

---

**Teknoloji:** React Native (Expo), React Navigation (native-stack), axios, AsyncStorage (JWT token saklama). Tasarım grubun web arayüzüyle uyumlu (yeşil/amber/krem palet).
