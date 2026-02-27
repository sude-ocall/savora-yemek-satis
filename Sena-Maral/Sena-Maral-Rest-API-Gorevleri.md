# Sena Maral – REST API Görevleri

Bu doküman, Talep (İstek) ve Geri Bildirim Sistemi için geliştirilecek REST API servislerini tanımlar. REST API katmanı, mobil ve web uygulamalarının backend ile iletişim kurmasını sağlar ve sistemdeki taleplerin, tekliflerin ve kullanıcı yorumlarının yönetilmesinden sorumludur.

---

## 1. Özel Yemek Talebi Oluşturma

**Endpoint:**
POST /requests

**Amaç:**
Kullanıcıların sistem üzerinden özel yemek talepleri oluşturabilmesini sağlar.

**İşleyiş:**
Kullanıcı mobil veya web uygulaması üzerinden yemek talebi oluşturmak istediğinde gerekli bilgiler API’ye gönderilir. API bu bilgileri doğrular ve veritabanına yeni bir talep kaydı oluşturur.

**Gönderilen Veriler:**

* yemekAdi
* miktar
* teslimTarihi
* teslimKonumu
* aciklama
* kullaniciId

**Dönen Yanıt:**

* talepId
* talepDurumu
* oluşturulma tarihi

---

## 2. Bölgesel Talepleri Listeleme

**Endpoint:**
GET /requests

**Amaç:**
Satıcıların kendi bölgelerindeki yemek taleplerini görüntülemesini sağlar.

**İşleyiş:**
API, veritabanındaki aktif talepleri sorgular ve satıcının konum bilgisine göre filtreleme yaparak uygun talepleri döndürür.

**Dönen Veriler:**

* talepId
* yemekAdi
* miktar
* talepTarihi
* talepDurumu
* kullaniciBilgisi

---

## 3. Talep Teklifi Güncelleme

**Endpoint:**
PUT /requests/{requestId}/offer

**Amaç:**
Satıcıların talep için verdikleri fiyat teklifini güncellemesini sağlar.

**İşleyiş:**
Satıcı yeni teklif fiyatını gönderdiğinde API ilgili talebi ve satıcının teklifini kontrol eder. Teklif mevcutsa veritabanındaki kayıt güncellenir.

**Gönderilen Veri:**

* teklifFiyati
* saticiId

**Dönen Yanıt:**

* teklifDurumu
* güncellenmiş teklif bilgisi

---

## 4. Talebi Geri Çekme

**Endpoint:**
DELETE /requests/{requestId}

**Amaç:**
Kullanıcının oluşturduğu yemek talebini iptal etmesini sağlar.

**İşleyiş:**
API talebin kullanıcıya ait olup olmadığını kontrol eder. Eğer talep aktif durumdaysa sistemden silinir veya iptal olarak işaretlenir.

**Dönen Yanıt:**

* işlemDurumu
* iptalTarihi

---

## 5. Satıcıya Yorum Yapma

**Endpoint:**
POST /reviews

**Amaç:**
Kullanıcıların sipariş tamamlandıktan sonra satıcı hakkında yorum yapmasını sağlar.

**İşleyiş:**
Kullanıcı yorum metni ve puan bilgisini gönderir. API bu bilgileri doğrular ve ilgili satıcıya ait yorum olarak veritabanına kaydeder.

**Gönderilen Veriler:**

* saticiId
* kullaniciId
* puan
* yorumMetni

**Dönen Yanıt:**

* yorumId
* yorumDurumu

---

## 6. Yorum ve Şikayetleri Listeleme

**Endpoint:**
GET /reviews/{sellerId}

**Amaç:**
Bir satıcı hakkında yapılmış tüm yorumların görüntülenmesini sağlar.

**İşleyiş:**
API veritabanındaki yorumları sorgular ve belirtilen satıcıya ait yorumları liste halinde döndürür.

**Dönen Veriler:**

* yorumId
* kullaniciAdi
* puan
* yorumMetni
* yorumTarihi

