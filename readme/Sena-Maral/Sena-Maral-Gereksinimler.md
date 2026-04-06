## 🎬 Çalışma Videoları

| # | Başlık | Bağlantı |
|---|---|---|
| 1 | Frontend Demosu | [https://youtu.be/MF3a_1A90T0?si=jHhgz2ukCYrTXJsU]
| 2 | Postman Demosu | [https://youtu.be/4B3HCzjBGHc?si=HKfaNiVEyK-alWh7]

---

## 🔑 Postman Collecitons

Postman Collections JSON -> [➥ Aç - gereksinimler.postman_collection.json](https://senaao-3709628.postman.co/workspace/Sena's-Workspace~0b4f3bc9-53e7-4072-860e-b9bbc5b4d98e/collection/53402253-18e4ba3e-0eeb-4af3-b4af-74a139a08423?action=share&source=copy-link&creator=53402253)

<br/>

| # | Başlık | Bağlantı |
|---|---|---|
| 1 | Postman Documenter | [➥ Git-](https://documenter.getpostman.com/view/53402253/2sBXiqFUqu) |
| 2 | Postman Collection | [➥ Git - postman.co/workspace](https://senaao-3709628.postman.co/workspace/0b4f3bc9-53e7-4072-860e-b9bbc5b4d98e/collection/53402253-18e4ba3e-0eeb-4af3-b4af-74a139a08423?action=share&source=copy-link&creator=53402253) |

---

<br/>
<br/>

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
