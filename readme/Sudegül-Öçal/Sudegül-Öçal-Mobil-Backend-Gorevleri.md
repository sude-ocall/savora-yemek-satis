# Sudegül Öçal - Mobil Arka Uç Görevleri

## 🎬 Kanıt Videosu

| # | Başlık | Bağlantı |
|---|---|---|
| 1 | Mobil Backend Demosu | [▶ İzle](https://youtu.be/MOw9BcBovcw) |

---

1. **Ürün Oluşturma Endpoint'i** *(Gereksinim 1: Yemek İlanı Ekleme)*
   - **Açıklama:** `POST /api/products`, satıcı girişi yapılmadan çağrılamaz (`protectSeller` middleware); ürünün `sellerId`'si gönderilen JWT token'dan otomatik alınır, body'den tekrar istenmez.

2. **Aktif Menü Listeleme + Redis Önbellek** *(Gereksinim 2: Aktif Menü Listeleme)*
   - **Açıklama:** `GET /api/products`, satıcı bilgisini `populate` ederek tüm ürünleri döner. Sonuç 60 saniyeliğine Redis'te (`products` anahtarı) önbelleğe alınır; Redis'e bağlanılamazsa sistem önbelleksiz çalışmaya devam eder (graceful degrade).

3. **Porsiyon Güncelleme Endpoint'i** *(Gereksinim 3: Porsiyon Adedi Güncelleme)*
   - **Açıklama:** `PUT /api/products/:id`, satıcının mobil ekrandan değiştirdiği porsiyon adedini yazar. Sadece ürünün sahibi olan satıcı (JWT'deki sellerId eşleşmesi) güncelleme yapabilir; aksi halde 403 döner. İşlem sonrası `products` önbelleği geçersiz kılınır.

4. **Ürün Silme Endpoint'i** *(Gereksinim 4: Yemek İlanı Kaldırma)*
   - **Açıklama:** `DELETE /api/products/:id`, sahiplik kontrolünden geçtikten sonra ürünü siler, satıcının `products` listesinden çıkarır ve önbelleği geçersiz kılar.

5. **Kategori Listeleme Endpoint'i** *(Gereksinim 5: Yemek Kategorilerini Listeleme)*
   - **Açıklama:** ⚠️ Henüz implement edilmedi. Şu an `category` alanı serbest metin olarak ürüne kaydediliyor; backend'de ayrı bir `GET /api/categories` (veya benzeri) uç noktası yok. Mobil tarafta kategori listesi geçici olarak sabit (hardcoded) tutuluyor — planlanan iş.

6. **Görsel Verisinin Saklanması (Base64)** *(Gereksinim 6: Yemek Görseli Yükleme)*
   - **Açıklama:** Mobil uygulamada galeriden seçilen fotoğraf, ayrı bir dosya/bulut depolama servisine yüklenmeden base64 string'e çevrilip doğrudan ürünün `imgURL` alanında MongoDB'ye kaydedilir. Büyük görselleri kabul edebilmek için Express'in JSON gövde limiti 50MB'a çıkarılmıştır.

7. **Satıcı Girişi (JWT) ve Mobil Erişim**
   - **Açıklama:** Mobil uygulama her yazma işleminden önce `POST /api/sellers/login` ile JWT token alır ve isteklerde `Authorization: Bearer` başlığında kullanır. React Native istekleri tarayıcı `Origin` başlığı taşımadığından mevcut CORS yapılandırması bu istekleri otomatik kabul eder.
