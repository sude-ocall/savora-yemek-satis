# Sena Maral – Mobil Backend Görevleri

Bu doküman, mobil uygulama tarafından kullanılacak Talep (İstek) ve Geri Bildirim Sistemi backend servislerinin görevlerini açıklamaktadır. Mobil backend, mobil uygulama ile sunucu arasındaki veri iletişimini sağlayarak taleplerin oluşturulması, görüntülenmesi, güncellenmesi ve kullanıcı yorumlarının yönetilmesi gibi işlemleri gerçekleştirir.

---

## 1. Özel Yemek Talebi Oluşturma Servisi

**API Endpoint:** POST /requests

Bu servis, mobil uygulama üzerinden kullanıcıların özel yemek talebi oluşturmasını sağlar. Kullanıcılar ihtiyaç duydukları yemek için bir ilan açarak satıcılardan teklif alabilir.

Mobil uygulamadan gönderilen talep bilgileri backend tarafından doğrulanır ve veritabanına kaydedilir. Bu bilgiler yemek adı, miktar, teslim tarihi, teslim konumu ve ek açıklama gibi alanları içerir.

Backend sistemi bu işlem sırasında kullanıcının kimlik doğrulamasını kontrol eder ve talebin geçerli olup olmadığını doğrular. Talep başarıyla oluşturulduktan sonra sistem talebe ait benzersiz bir talep kimliği üretir ve mobil uygulamaya geri döndürür.

---

## 2. Bölgesel Talepleri Listeleme Servisi

**API Endpoint:** GET /requests

Bu servis, satıcıların kendi bölgelerinde bulunan yemek taleplerini görüntüleyebilmesini sağlar.

Mobil uygulama konum bilgisi veya bölge filtresi gönderdiğinde backend sistemi veritabanında bulunan talepleri filtreleyerek ilgili satıcılara gösterir. Böylece satıcılar kendi yakınlarında bulunan talepleri kolayca görebilir ve bu taleplere teklif verebilir.

Backend sistemi talepleri listelerken talep tarihi, yemek adı, talep edilen miktar ve talep durumu gibi bilgileri mobil uygulamaya gönderir.

---

## 3. Talep Teklifi Güncelleme Servisi

**API Endpoint:** PUT /requests/{requestId}/offer

Bu servis, satıcıların daha önce bir talep için verdikleri fiyat teklifini güncelleyebilmesini sağlar.

Satıcı mobil uygulama üzerinden yeni fiyat bilgisini gönderdiğinde backend sistemi ilgili talebi ve satıcının teklifini kontrol eder. Eğer teklif mevcutsa sistem fiyat bilgisini günceller ve veritabanına kaydeder.

Bu işlem sırasında sistem, teklifin ilgili talep ile eşleştiğini ve satıcının yetkili olduğunu doğrular. Güncelleme işlemi tamamlandıktan sonra yeni teklif bilgisi mobil uygulamaya geri iletilir.

---

## 4. Talebi Geri Çekme Servisi

**API Endpoint:** DELETE /requests/{requestId}

Bu servis, talep sahibi kullanıcının daha önce oluşturduğu yemek talebini iptal etmesini sağlar.

Kullanıcı mobil uygulama üzerinden talebi geri çekmek istediğinde backend sistemi talebin mevcut olup olmadığını kontrol eder. Eğer talep aktif durumdaysa sistem talebi veritabanından siler veya iptal durumuna getirir.

Bu işlem sayesinde kullanıcılar ihtiyaçları karşılandığında veya talepten vazgeçtiklerinde ilanlarını sistemden kaldırabilir.

---

## 5. Satıcıya Yorum Yapma Servisi

**API Endpoint:** POST /reviews

Bu servis, kullanıcıların sipariş tamamlandıktan sonra satıcı hakkında değerlendirme yapabilmesini sağlar.

Mobil uygulama üzerinden gönderilen yorum metni, puan bilgisi ve satıcı kimliği backend sistemi tarafından alınır ve veritabanına kaydedilir. Sistem yorumun ilgili satıcıya ait olduğunu kontrol eder ve yorumun geçerli olup olmadığını doğrular.

Kaydedilen yorumlar daha sonra diğer kullanıcılar tarafından görüntülenebilir.

---

## 6. Yorum ve Şikayetleri Listeleme Servisi

**API Endpoint:** GET /reviews/{sellerId}

Bu servis, belirli bir satıcı hakkında yapılmış tüm yorumların ve değerlendirmelerin listelenmesini sağlar.

Mobil uygulama belirli bir satıcıya ait yorumları görüntülemek istediğinde backend sistemi veritabanında bulunan yorumları sorgular ve mobil uygulamaya iletir.

Listelenen bilgiler yorum metni, kullanıcı puanı, yorum tarihi ve kullanıcı adı gibi alanları içerebilir. Bu özellik kullanıcıların satıcı hakkında fikir edinmesine yardımcı olur.

---

## Veri Yönetimi

Mobil backend sistemi talepler, teklifler ve yorumlarla ilgili tüm verileri veritabanında saklar. Backend servisleri bu verilerin güvenli şekilde saklanmasını, güncellenmesini ve mobil uygulama ile senkronize edilmesini sağlar.

Ayrıca sistem kullanıcı doğrulama, veri doğrulama ve hata yönetimi gibi işlemleri de gerçekleştirerek sistemin güvenli ve kararlı çalışmasını sağlar.
