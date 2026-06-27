# SAVORA
Evden gönlünüzce yemek satışı yapabileceğiniz, güvenilir bir platform.

![Savora Proje Görseli](savora-arayuz.jpg)

---

## 🚀 Canlı Uygulama (Production)

> Backend deployment, cloud servis entegrasyonu ve Android APK build: **Sudegül Öçal** tarafından yapılmıştır.

| Servis | URL |
|---|---|
| 🌐 Web Uygulaması | [savora-yemek-satis-frontend.vercel.app](https://savora-yemek-satis-frontend.vercel.app) |
| ⚙️ Backend API | [savora-yemek-satis-backend.vercel.app](https://savora-yemek-satis-backend.vercel.app) |
| 🗄️ Veritabanı | MongoDB Atlas |
| 📦 Redis Cache | Upstash (serverless) |
| 🐇 Message Queue | CloudAMQP (RabbitMQ) |

## 📱 Android APK

Android telefonunuza direkt yükleyebilirsiniz:

**[⬇️ APK İndir](https://expo.dev/accounts/sudegl_ocal/projects/savora-mobile/builds/c2011879-85c6-4367-a8da-b6b5aac42272)**

> Sayfadaki QR kodu okutun veya "Install" butonuna basın.

---

## 🍲 Proje Hakkında

Savora, evinde yemek yapan yetenekli aşçılar ile lezzetli ev yemeği özlemi çeken kullanıcıları güvenilir bir ortamda buluşturan yenilikçi bir yemek satış platformudur.

## 👥 Geliştirici Ekip

| Geliştirici | Gereksinimler | REST API | Web Front-End | Mobil Front-End | Mobil Backend |
|---|---|---|---|---|---|
| Sudegül Öçal | [📄](readme/Sudegül-Öçal/Sudegül-Öçal-Gereksinimler.md) | [📄](readme/Sudegül-Öçal/Sudegül-Öçal-Rest-API-Gorevleri.md) | [📄](readme/Sudegül-Öçal/Sudegül-Öçal-Web-Frontend-Gorevleri.md) | [📄](readme/Sudegül-Öçal/Sudegül-Öçal-Mobil-Frontend-Gorevleri.md) | [📄](readme/Sudegül-Öçal/Sudegül-Öçal-Mobil-Backend-Gorevleri.md) |
| Alara Kökbudak | [📄](readme/Alara-Kökbudak/Alara-Kökbudak-Gereksinimler.md) | [📄](readme/Alara-Kökbudak/Alara-Kökbudak-Rest-API-Gorevleri.md) | [📄](readme/Alara-Kökbudak/Alara-Kökbudak-Web-Frontend-Gorevleri.md) | [📄](readme/Alara-Kökbudak/Alara-Kökbudak-Mobil-Frontend-Gorevleri.md) | [📄](readme/Alara-Kökbudak/Alara-Kökbudak-Mobil-Backend-Gorevleri.md) |
| İrem Nur Yaslı | [📄](readme/İrem-Nur-Yasli/Irem-Nur-Yasli-Gereksinimler.md) | [📄](readme/İrem-Nur-Yasli/Irem-Nur-Yasli-Rest-API-Gorevleri.md) | [📄](readme/İrem-Nur-Yasli/Irem-Nur-Yasli-Web-Frontend-Gorevleri.md) | [📄](readme/İrem-Nur-Yasli/Irem-Nur-Yasli-Mobil-Frontend-Gorevleri.md) | [📄](readme/İrem-Nur-Yasli/Irem-Nur-Yasli-Mobil-Backend-Gorevleri.md) |
| Sena Maral | [📄](readme/Sena-Maral/Sena-Maral-Gereksinimler.md) | [📄](readme/Sena-Maral/Sena-Maral-Rest-API-Gorevleri.md) | [📄](readme/Sena-Maral/Sena-Maral-Web-Frontend-Gorevleri.md) | [📄](readme/Sena-Maral/Sena-Maral-Mobil-Frontend-Gorevleri.md) | [📄](readme/Sena-Maral/Sena-Maral-Mobil-Backend-Gorevleri.md) |

## 📌 Temel Özellikler

- Kullanıcı & Satıcı kayıt/giriş sistemi
- Yemek ilanı ekleme, porsiyon ve fiyat yönetimi
- Sipariş oluşturma ve durum takibi
- Özel yemek talebi ve teklif sistemi
- Redis ile cache, RabbitMQ ile mesajlaşma

## 📖 Dokümantasyon

1. [Gereksinim Analizi](readme/Gereksinimler.md)
2. [REST API Tasarımı](API-Tasarimi.md)
3. [REST API (YAML)](SavoraAPI.yaml)
4. [Web Front-End](WebFrontEnd.md)
5. [Mobil Front-End](MobilFrontEnd.md)
6. [Mobil Backend](MobilBackEnd.md)
7. [Video Sunum](readme/Sunum.md)
