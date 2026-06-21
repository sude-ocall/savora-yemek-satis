# Sudegül Öçal - Mobil Ön Uç Görevleri

1. **Yemek İlanı Oluşturma Formu** *(Gereksinim 1: Yemek İlanı Ekleme)*
   - **Açıklama:** Satıcı; yemek adı, fiyat ve açıklama bilgilerini girer, "Kaydet" butonuyla backend'e gönderir. *(Not: Porsiyon bu ekranda girilmiyor — ürün 0 porsiyonla oluşturulur, miktar menü ekranından ayrıca girilir.)*

2. **Aktif Menü / Stok Takip Listesi** *(Gereksinim 2: Aktif Menü Listeleme)*
   - **Açıklama:** Satıcının backend'den `GET /api/products` ile çektiği ürünler `FlatList` ile listelenir; her kartta ürün adı, fiyatı, kategorisi ve açıklaması gösterilir.

3. **Porsiyon Güncelleme** *(Gereksinim 3: Porsiyon Adedi Güncelleme)*
   - **Açıklama:** Her ürün kartında +/- butonlarıyla porsiyon miktarı yerel olarak değiştirilir; "Güncelle" butonuna basıldığında `PUT /api/products/:id` ile sunucuya kaydedilir ve kart anında güncellenir.

4. **Ürün Silme** *(Gereksinim 4: Yemek İlanı Kaldırma)*
   - **Açıklama:** Menü ekranındaki her kartta bulunan "Sil" butonu, `DELETE /api/products/:id` isteğiyle ilgili ürünü kaldırır ve listeyi anında günceller.

5. **Kategori Seçimi** *(Gereksinim 5: Yemek Kategorilerini Listeleme)*
   - **Açıklama:** ⚠️ İlan oluşturma ekranında kategori, chip butonlarıyla (Ana Yemek, Çorba, Tatlı, İçecek, Salata) seçilir; ancak bu liste backend'den dinamik çekilmiyor, koda sabit (hardcoded) yazılmış durumda — backend'de kategori endpoint'i tamamlanınca buradan beslenecek.

6. **Görsel Seçme ve Önizleme** *(Gereksinim 6: Yemek Görseli Yükleme)*
   - **Açıklama:** `expo-image-picker` ile galeriden fotoğraf seçilir (gerekirse galeri izni istenir), seçilen görsel ekranda önizlenir ve "Görseli kaldır" ile kaldırılabilir. *(Mevcut sürümde galeriden seçim var; kamerayla anlık çekim henüz eklenmedi.)*

7. **Satıcı Girişi ve Yükleniyor/Hata/Boş Durumları**
   - **Açıklama:** Ekleme/güncelleme/silme öncesi test satıcı hesabıyla otomatik giriş yapılır (token alınır). Menü ekranı; yükleniyor (`ActivityIndicator`), hata (backend'e erişilemediğinde IP/bağlantı uyarısı) ve boş liste ("Henüz ürün eklenmemiş.") durumlarını ayrı ayrı kullanıcıya gösterir.
