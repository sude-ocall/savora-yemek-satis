Sena Maral – Web Ön Uç (Frontend) Görevleri
Bu doküman, Talep (İstek) ve Geri Bildirim Sistemi için geliştirilecek web tabanlı yönetim ve izleme arayüzlerini tanımlar. Web arayüzü, sistemdeki genel akışın kontrol edilmesi, moderasyon işlemlerinin yürütülmesi ve raporlamaların takip edilmesinden sorumludur.

1. Sistem Genel Kontrol Paneli (Admin Dashboard)
Görev: Sistemdeki toplam hareketliliğin (aktif talepler, yeni teklifler ve kullanıcı sayısı) üst düzey bir özetinin sunulması.

İşleyiş: Web uygulaması açıldığında GET /stats (istatistik) verilerini çeker. Aktif olan tüm yemek talepleri ve verilen teklifler grafiksel şemalarla görselleştirilir.

Teknik Detaylar:

Veri Görselleştirme: Chart.js veya Recharts kütüphanesi ile günlük talep yoğunluğu grafikleri.

State Management: Tüm sistem verilerinin güncelliğini korumak için Context API veya Redux kullanımı.

2. Talep ve Teklif Moderasyon Ekranı
Görev: Açılan yemek taleplerinin ve satıcıların verdiği tekliflerin listelenmesi, uygunsuz içeriklerin kontrol edilmesi.

İşleyiş: Yönetici, tüm aktif talepleri bir tablo üzerinde görüntüler. Hatalı veya sahte olduğu düşünülen talepler için DELETE /requests/{requestId} tetiklenerek içerik yayından kaldırılır.

Teknik Detaylar:

Filtreleme: Taleplerin "Açık", "Beklemede" veya "Tamamlandı" durumuna göre listelenmesi.

Responsive Tasarım: Tablo yapılarının tablet ve masaüstü ekranlara tam uyumlu (Flexbox/Grid) olması.

3. Yorum ve Şikayet Yönetim Arayüzü
Görev: Kullanıcıların satıcılar hakkında yaptığı yorumların ve şikayetlerin incelenerek onaylanması veya reddedilmesi.

İşleyiş: GET /reviews ile gelen tüm yorumlar listelenir. Şikayet edilen veya düşük puanlı yorumlar vurgulanarak yöneticinin dikkatine sunulur.

Teknik Detaylar:

Kullanıcı Etkileşimi: İşlem sonuçlarını (Onaylandı/Silindi) yöneticiye bildirmek için Toast (bildirim) mesajları.

Modal Pencereler: Yorum detaylarının ana sayfadan ayrılmadan açılan pencerelerde gösterilmesi.

4. Gelişmiş Bölgesel Raporlama ve Filtreleme
Görev: Hangi bölgelerde daha fazla yemek talebi olduğunun ve en popüler yemek türlerinin raporlanması.

İşleyiş: Konum bazlı veriler harita üzerinde kümelenerek gösterilir. Yönetici, belirli tarih aralıklarını seçerek sistemin performans çıktısını alır.

Teknik Detaylar:

Harita Entegrasyonu: Google Maps API üzerinden yoğunluk haritası oluşturulması.

Performans: Veritabanı yükünü azaltmak için istemci taraflı (client-side) filtreleme işlemleri.
