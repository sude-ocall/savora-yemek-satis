# SAVORA
Evden gönlünüzce yemek satışı yapabileceğiniz, güvenilir bir platform.
![Savora Proje Görseli](readme/savora-arayuz.jpg)

## 🍲 Proje Hakkında (Savora)
Savora, evinde yemek yapan yetenekli aşçılar ile lezzetli ev yemeği özlemi çeken kullanıcıları güvenilir bir ortamda buluşturan yenilikçi bir yemek satış platformudur. Amacımız, evden gönlünüzce yemek satışı yapabileceğiniz ve sipariş verebileceğiniz dijital bir pazar yeri yaratmaktır.

## Proje Bağlantıları
* **Rest API Adresi:** https://raw.githubusercontent.com/alarakokbudak/savora-yemek-satis/refs/heads/main/SavoraAPI.yaml
* **Web Ön Yüz Adresi:**

## 👥 Geliştirici Ekip
Bu proje, aşağıdaki 4 kişilik geliştirici ekip tarafından tasarlanıp kodlanmaktadır:

| Geliştirici | Gereksinimler | REST API | Web Front-End | Mobil Front-End | Mobil Backend |
|---|---|---|---|---|---|
| Sudegül Öçal | [📄](readme/Sudegül%20Öçal/Sudegül-Öçal-Gereksinimler.md) | [📄](readme/Sudegül%20Öçal/Sudegül-Öçal-Rest-API-Gorevleri.md) | [📄](readme/Sudegül%20Öçal/Sudegül-Öçal-Web-Frontend-Gorevleri.md) | [📄](readme/Sudegül%20Öçal/Sudegül-Öçal-Mobil-Frontend-Gorevleri.md) | [📄](readme/Sudegül%20Öçal/Sudegül-Öçal-Mobil-Backend-Gorevleri.md) |
| Alara Kökbudak | [📄](readme/Alara-Kökbudak/Alara-Kökbudak-Gereksinimler.md) | [📄](readme/Alara-Kökbudak/Alara-Kökbudak-Rest-API-Gorevleri.md) | [📄](readme/Alara-Kökbudak/Alara-Kökbudak-Web-Frontend-Gorevleri.md) | [📄](readme/Alara-Kökbudak/Alara-Kökbudak-Mobil-Frontend-Gorevleri.md) | [📄](readme/Alara-Kökbudak/Alara-Kökbudak-Mobil-Backend-Gorevleri.md) |
| İrem Nur Yaslı | [📄](readme/İrem-Nur-Yasli/Irem-Nur-Yasli-Gereksinimler.md) | [📄](readme/İrem-Nur-Yasli/Irem-Nur-Yasli-Rest-API-Gorevleri.md) | [📄](readme/İrem-Nur-Yasli/Irem-Nur-Yasli-Web-Frontend-Gorevleri.md) | [📄](readme/İrem-Nur-Yasli/Irem-Nur-Yasli-Mobil-Frontend-Gorevleri.md) | [📄](readme/İrem-Nur-Yasli/Irem-Nur-Yasli-Mobil-Backend-Gorevleri.md) |
| Sena Maral | [📄](readme/Sena-Maral/Sena-Maral-Gereksinimler.md) | [📄](readme/Sena-Maral/Sena-Maral-Rest-API-Gorevleri.md) | [📄](readme/Sena-Maral/Sena-Maral-Web-Frontend-Gorevleri.md) | [📄](readme/Sena-Maral/Sena-Maral-Mobil-Frontend-Gorevleri.md) | [📄](readme/Sena-Maral/Sena-Maral-Mobil-Backend-Gorevleri.md) |


## 📌 Ana Gereksinimler ve İşlevler
Sistemimiz, Alıcı ve Satıcı rolleri üzerinden aşağıdaki temel gereksinimleri ve CRUD (Oluşturma, Okuma, Güncelleme, Silme) işlemlerini sağlamaktadır:
* **Kullanıcı İşlemleri:** Güvenli kayıt olma, giriş yapma ve profil yönetimi.
* **Menü ve Yemek Yönetimi:** Satıcıların sisteme yeni yemekler eklemesi, porsiyon/fiyat güncellemesi ve yayından kaldırması.
* **Sipariş Yönetimi:** Alıcıların ürünleri sepete eklemesi, sipariş oluşturması ve sipariş durumunu (hazırlanıyor, yolda vb.) takip etmesi.
* **Listeleme ve Keşfetme:** Satışta olan aktif yemeklerin kullanıcılar tarafından görüntülenmesi.

## 🔗 Temel API Yolları (Endpoints)
Projenin arka planında iletişim kuracağımız temel API yollarından bazıları şunlardır:
* `GET /api/yemekler` : Satıştaki tüm aktif yemekleri listeler.
* `POST /api/yemekler` : Satıcının sisteme yeni bir yemek eklemesini sağlar.
* `PUT /api/yemekler/{id}` : Satıcının mevcut bir yemeğin bilgilerini güncellemesini sağlar.
* `DELETE /api/yemekler/{id}` : İlgili yemeği menüden siler.
* `POST /api/siparisler` : Alıcının yeni bir sipariş oluşturmasını sağlar.

## Dokümantasyon
Proje dokümantasyonuna aşağıdaki linklerden erişebilirsiniz:
1. [Gereksinim Analizi](readme/Gereksinimler.md)
2. [REST API Tasarımı](readme/API-Tasarimi.md)
3. [Web Front-End](readme/WebFrontEnd.md)
4. [Mobil Front-End](readme/MobilFrontEnd.md)
5. [Mobil Backend](readme/MobilBackEnd.md)
6. [Video Sunum](readme/Sunum.md)