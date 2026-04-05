# Alara Kökbudak - Web Ön Uç (Frontend) Görevleri

### 1. Satıcı Sipariş Kontrol Paneli (Dashboard)
* **Görev:** Restoran sahiplerinin yeni gelen siparişleri anlık olarak görebileceği arayüzün tasarımı.
* **İşleticiler:**
    * Yeni sipariş düştüğünde sesli veya görsel uyarı mekanizmasının kurulması.
    * Siparişlerin önem sırasına veya geliş zamanına göre tablolanması.
* **Teknik Detaylar:**
    * Responsive (mobil uyumlu) tablo yapıları.
    * State Management (Redux/Context API) ile verinin güncel tutulması.
---
### 2. Sipariş Durum Yönetim Arayüzü
* **Görev:** Satıcının siparişleri "Hazırla", "Yola Çıkar" ve "Teslim Et" butonlarıyla yönetmesi.
* **İşleticiler:**
    * Butonlara tıklandığında `PUT /orders/{orderId}` isteğinin tetiklenmesi.
    * İşlem başarılı olduğunda listenin anlık güncellenmesi.
* **Teknik Detaylar:**
    * Kullanıcı etkileşimi için Toast mesajları ve bildirim balonları.

---

### 3. Gelişmiş Sipariş Raporlama ve Filtreleme
* **Görev:** Geçmiş siparişlerin detaylı dökümünün yapıldığı web ekranı.
* **İşleticiler:**
    * Tarih aralığına, tutara veya sipariş durumuna göre filtreleme seçenekleri.
    * Sipariş detaylarının (yemekler, kullanıcı adresi) modal pencerelerde gösterimi.
* **Teknik Detaylar:**
    * Veritabanı yükünü azaltmak için istemci taraflı (client-side) filtreleme.
