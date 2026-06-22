# Video Sunum

## Sunum Videosu

> **Video Linki:** [Sunum videosu linki buraya eklenecek](https://example.com)

---

---

## 📹 Sudegül Öçal - Bireysel Kanıt Videoları

| # | Teknoloji | Video |
|---|---|---|
| 1 | Redis & RabbitMQ | [▶ İzle](https://youtu.be/MOw9BcBovcw) |
| 2 | Docker & CI/CD | [▶ İzle](https://youtu.be/sein5XOiVD8) |

---

## Sunum Yapısı

### 1. Grup Lideri - Açılış Konuşması (1-2 dakika)

**Konuşma İçeriği:**
- Grup adının tanıtılması
- Projenin genel tanıtımı
- Projenin amacı ve kapsamı
- Sunumun yapısının kısaca açıklanması

**Örnek Konuşma:**
> "Merhaba, ben [Grup Lideri İsmi]. [Grup Adı] ekibi olarak [Proje Adı] projesini geliştirdik. Bu proje [kısa proje açıklaması]. Bugün sizlere projemizi ve ekibimizin çalışmalarını sunacağız. Her ekip üyesi kendini tanıtacak ve sorumlu olduğu gereksinimleri gösterecek."

---

### 2. Ekip Üyeleri - Kişisel Tanıtım ve Gereksinim Sunumu

Her ekip üyesi için aşağıdaki yapı takip edilecektir:

#### Format (Her üye için 4-6 dakika)

**A) Kişisel Tanıtım (30-45 saniye)**
- Yüz görünecek şekilde kamera karşısında
- İsim ve soyisim
- Ekipteki rolü
- Sorumlu olduğu alan (Backend/Frontend/Mobil vb.)

**B) Gereksinim Sunumu (3.5-5 dakika)**
- Sorumlu olduğu gereksinimlerin listesi
- Her gereksinimin kısa açıklaması
- Canlı demo (ekran kaydı ile)
- Her gereksinimin çalışır durumda olduğunun detaylı gösterilmesi
- Her gereksinim için yeterli süre ayrılmalı (yaklaşık 1-1.5 dakika/gereksinim)

---

### 3. Ekip Üyeleri Sunum Sırası

#### Ali Tutar
**Kişisel Tanıtım:**
- İsim: Ali Tutar

**Gereksinimler:**
1. **Üye Olma**
   - API Metodu: `POST /auth/register`
   - Demo: Kullanıcı kayıt işleminin gösterilmesi

2. **Profil Görüntüleme**
   - API Metodu: `GET /users/{userId}`
   - Demo: Kullanıcı profil bilgilerinin görüntülenmesi

3. **Profil Güncelleme**
   - API Metodu: `PUT /users/{userId}`
   - Demo: Profil bilgilerinin güncellenmesi

4. **Hesap Silme**
   - API Metodu: `DELETE /users/{userId}`
   - Demo: Hesap silme işleminin gösterilmesi

---

#### Veli Yılmaz
**Kişisel Tanıtım:**
- İsim: Veli Yılmaz
- Rol: [Rol belirtilecek]

**Gereksinimler:**
- [Gereksinim 1]
- [Gereksinim 2]
- [Gereksinim 3]
- [Gereksinim 4]

---

#### Alara Kökbudak
**Kişisel Tanıtım:**
- İsim: Alara Kökbudak
- Rol: Sipariş ve Ödeme Sistemi Sorumlusu

**Gereksinimler:**
1. **Sipariş Oluşturma**
   - API Metodu: `POST /orders`
   - Demo: Sepetten sipariş oluşturma işleminin gösterilmesi

2. **Sipariş Geçmişini Görüntüleme**
   - API Metodu: `GET /orders`
   - Demo: Kullanıcının geçmiş siparişlerinin listelenmesi

3. **Sipariş Durumu Güncelleme**
   - API Metodu: `PUT /orders/{orderId}/status`
   - Demo: Satıcı tarafından sipariş durumunun güncellenmesi (Hazırlanıyor → Yola Çıktı → Teslim Edildi)

4. **Sipariş İptal Etme**
   - API Metodu: `DELETE /orders/{orderId}`
   - Demo: Yeni durumdaki siparişin iptal edilmesi

5. **Aktif Sipariş Detayı**
   - API Metodu: `GET /orders/{orderId}`
   - Demo: Sipariş takip ekranında detayların ve durum çizelgesinin gösterilmesi

6. **Ödeme Yöntemi Kaydetme**
   - API Metodu: `POST /payments`
   - Demo: Kredi kartı bilgilerinin şifrelenmiş olarak kaydedilmesi

---

### 4. Grup Lideri - Kapanış Konuşması (1 dakika)

**Konuşma İçeriği:**
- Tüm gereksinimlerin tamamlandığının özeti
- Projenin başarıyla tamamlandığının vurgulanması

**Örnek Konuşma:**
> "Bugün sizlere [Proje Adı] projemizi sunduk. Tüm ekip üyelerimiz sorumlu oldukları gereksinimleri başarıyla tamamladılar ve çalışır durumda gösterdiler. Projemiz [kısa özet]. Teşekkürler!"

---

### 5. CI/CD ve Docker Gösterimi (Grup Görevi - 7. Madde)

> **CI/CD ve Docker Kanıt Video Linki:** [▶ İzle](https://youtu.be/sein5XOiVD8)

**Gereksinimler (15 Puan):**
- Jenkinsfile üzerinden CI/CD aşamalarının (Checkout, Build, Test, Deploy) başarıyla çalıştığının gösterilmesi.
- `docker-compose up` komutuyla Frontend ve REST API'nin Docker üzerinde lokalde ayağa kaldırılması.
- Konteynerlerin çalıştığının (`docker ps` veya Docker Desktop üzerinden) ve uygulamanın lokal portlarda (Frontend: 5173, Backend: 3000) erişilebilir olduğunun kanıtlanması.

---

## Sunum Hazırlık Kontrol Listesi

### Genel Hazırlık
- [ ] Grup lideri açılış konuşmasını hazırladı
- [ ] Her ekip üyesi kendi sunumunu hazırladı
- [ ] Tüm gereksinimler çalışır durumda
- [ ] Demo senaryoları hazırlandı
- [ ] Test verileri ve hesaplar hazırlandı

### Teknik Hazırlık
- [ ] Video kayıt cihazı/kamera hazır
- [ ] Mikrofon kalitesi test edildi
- [ ] Işıklandırma uygun
- [ ] Arka plan düzenlendi
- [ ] Ekran kayıt yazılımı hazır (demo için)

### Kişisel Hazırlık
- [ ] Her ekip üyesi kendi bölümünü prova etti
- [ ] Konuşma süreleri kontrol edildi
- [ ] Gereksinimler ezberlendi veya notlar hazırlandı
- [ ] Demo akışı prova edildi

---

## Video Çekim Teknikleri

### Kişisel Tanıtım Bölümü
- **Kamera Açısı:** Yüz net görünecek şekilde
- **Işık:** Yüzün iyi aydınlatıldığından emin olun
- **Arka Plan:** Temiz ve profesyonel görünüm
- **Görüntü:** Omuz üstü çekim
- **Göz Teması:** Kameraya bakarak konuşun

### Demo Bölümü
- **Ekran Kaydı:** Net ve yüksek çözünürlükte
- **Ses:** Demo sırasında açıklama yapın
- **Hız:** Yavaş ve anlaşılır hareket edin
- **Vurgu:** Önemli noktaları işaret edin

---

## Zaman Yönetimi

- **Grup Lideri Açılış:** 1-2 dakika
- **Her Ekip Üyesi:** 4-6 dakika
  - Kişisel tanıtım: 30-45 saniye
  - Gereksinim sunumu: 3.5-5 dakika
    - Her gereksinim için: yaklaşık 1-1.5 dakika
- **Grup Lideri Kapanış:** 1-2 dakika
- **Toplam Süre:** Yaklaşık 30-40 dakika (5 kişilik ekip için)
