# Sena Maral – Mobil Frontend Görevleri

Mobil frontend kısmı, kullanıcıların mobil uygulama üzerinden yemek taleplerini oluşturmasını, satıcıların bu talepleri görüntülemesini ve kullanıcıların satıcılar hakkında yorum yapmasını sağlayan arayüzleri kapsar. Bu bölümde kullanıcı deneyimi, ekran tasarımı ve kullanıcı etkileşimleri planlanır.

---

## 1. Talep Oluşturma Ekranı

Bu ekran, kullanıcıların özel yemek talepleri oluşturabileceği ana arayüzdür. Kullanıcılar burada ihtiyaç duydukları yemekle ilgili bilgileri girerek bir talep ilanı oluştururlar.

**Ekranda bulunması gereken alanlar:**

* Yemek adı
* İstenen miktar
* Teslim tarihi
* Teslim konumu
* Ek açıklama

Kullanıcı gerekli bilgileri doldurduktan sonra "Talep Oluştur" butonuna basarak talebini sisteme gönderir. Bu işlem backend servisine gönderilir ve başarılı olursa kullanıcıya talebin oluşturulduğuna dair bir bildirim gösterilir.

---

## 2. Bölgesel Talepler Listeleme Ekranı

Bu ekran satıcı kullanıcıların kendi bölgelerinde bulunan yemek taleplerini görüntüleyebilmesini sağlar.

Ekranda talepler bir liste şeklinde gösterilir. Her talep kartında şu bilgiler yer alır:

* Yemek adı
* Talep edilen miktar
* Talep tarihi
* Talebi oluşturan kullanıcı

Satıcılar listede bulunan taleplerden birini seçerek detay sayfasına geçebilir ve talep hakkında daha fazla bilgi görüntüleyebilir.

---

## 3. Talep Detay Ekranı

Bu ekran seçilen yemek talebinin tüm detaylarını gösterir.

Kullanıcı veya satıcı burada şu bilgileri görebilir:

* Yemek adı
* Talep edilen miktar
* Teslim tarihi
* Teslim konumu
* Talep açıklaması

Satıcılar bu ekrandan talebe teklif verebilir veya mevcut tekliflerini güncelleyebilir.

---

## 4. Talep Geri Çekme İşlemi

Talep sahibi kullanıcılar oluşturdukları talepleri iptal edebilir.

Talep detay ekranında bulunan **"Talebi Geri Çek"** butonu kullanılarak bu işlem yapılır. Kullanıcı bu butona bastığında uygulama backend servisine talebin iptal edilmesi için bir istek gönderir.

İşlem başarılı olursa talep listelerden kaldırılır ve kullanıcıya talebin iptal edildiğine dair bir mesaj gösterilir.

---

## 5. Satıcıya Yorum Yapma Ekranı

Sipariş tamamlandıktan sonra kullanıcıların satıcı hakkında değerlendirme yapmasını sağlayan ekrandır.

Bu ekranda kullanıcılar:

* Satıcıya puan verebilir
* Yorum metni yazabilir

Kullanıcı yorumunu gönderdiğinde uygulama bu bilgiyi backend servisine iletir ve yorum sistemde saklanır.

---

## 6. Yorumları Görüntüleme Ekranı

Bu ekran kullanıcıların bir satıcı hakkında yapılan yorumları görüntülemesini sağlar.

Yorumlar liste halinde gösterilir ve her yorumda şu bilgiler bulunur:

* Kullanıcı adı
* Verilen puan
* Yorum metni
* Yorum tarihi

Bu özellik, kullanıcıların satıcı hakkında fikir edinmesine yardımcı olur ve sistemde güven oluşturur.

---

## Kullanıcı Akışı

Mobil uygulamada kullanıcıların temel işlem sırası şu şekildedir:

1. Kullanıcı uygulamaya giriş yapar
2. Talep oluşturma ekranından yemek talebi oluşturur
3. Satıcılar bölgesel talepleri görüntüler
4. Satıcı talebe teklif verir veya teklifini günceller
5. Sipariş tamamlandıktan sonra kullanıcı satıcıya yorum yapar
6. Diğer kullanıcılar satıcı yorumlarını görüntüleyebilir
