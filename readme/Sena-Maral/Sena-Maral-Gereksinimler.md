## 🎬 Çalışma Videoları

| # | Başlık | Bağlantı |
|---|---|---|
| 1 | Frontend Demosu | |
| 2 | Postman Demosu | |

---

**Sena Maral – Talep (İstek) ve Geri Bildirim Sistemi Gereksinimleri**

**Özel Yemek Talebi Oluşturma**

API Metodu: **POST /requests**
Açıklama: Kullanıcının belirli bir yemek için özel talep oluşturmasını sağlar. Kullanıcı yemek adı, miktar, teslim tarihi ve açıklama girerek talep oluşturabilir.

**Bölgesel Talepleri Listeleme**

API Metodu: **GET /requests**
Açıklama: Satıcıların kendi bölgelerindeki kullanıcı taleplerini görüntülemesini sağlar. Satıcılar bu talepleri inceleyerek teklif verebilir.

**Talebe Fiyat Teklifi Güncelleme**

API Metodu: **PUT /requests/{requestId}/offer**
Açıklama: Satıcının daha önce verdiği fiyat teklifini güncellemesini sağlar.

**Talebi Geri Çekme**

API Metodu: **DELETE /requests/{requestId}**
Açıklama: Talep sahibi kullanıcının oluşturduğu yemek talebini iptal etmesini veya sistemden kaldırmasını sağlar.

**Satıcıya Yorum Yapma**

API Metodu: **POST /reviews**
Açıklama: Kullanıcının sipariş tamamlandıktan sonra satıcı hakkında değerlendirme ve yorum yapmasını sağlar.

**Yorum ve Şikayetleri Listeleme**

API Metodu: **GET /reviews/{sellerId}**
Açıklama: Belirli bir satıcıya yapılan tüm kullanıcı yorumlarını ve şikayetlerini listeleyerek diğer kullanıcıların görmesini sağlar.