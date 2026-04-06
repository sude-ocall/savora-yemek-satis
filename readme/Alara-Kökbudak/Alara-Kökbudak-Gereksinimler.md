# Alara Kökbudak - Sipariş ve Ödeme Sistemi Gereksinimleri

## 🎬 Çalışma Videoları

| # | Başlık | Bağlantı |
|---|---|---|
| 1 | Frontend Demosu | [▶ İzle](https://youtu.be/zJbpzKOvJRs) |
| 2 | Postman Demosu | [▶ İzle](https://youtu.be/kkpDatfP44k) |

---

## 🔑 Postman Collecitons

Postman Collections JSON -> [➥ Aç - gereksinimler.postman_collection.json](./gereksinimler.postman_collection.json)

<br/>

| # | Başlık | Bağlantı |
|---|---|---|
| 1 | Postman Documenter | [➥ Git - documenter.getpostman.com]() |
| 2 | Postman Collection | [➥ Git - postman.co/workspace]() |

---

<br/>
<br/>



1. **Sipariş Oluşturma**
   - **API Metodu:** POST /orders
   - **Açıklama:** Kullanıcının sepetine eklediği yemekleri onaylayarak sipariş oluşturmasını sağlar. Sistem toplam tutarı hesaplar ve veritabanına ekler.

2. **Sipariş Geçmişini Görüntüleme**
   - **API Metodu:** GET /orders
   - **Açıklama:** Kullanıcının geçmiş siparişlerini (tarih, tutar, durum) listelemesini sağlar.

3. **Sipariş Durumu Güncelleme**
   - **API Metodu:** PUT /orders/{orderId}
   - **Açıklama:** Satıcının sipariş durumunu "Hazırlanıyor", "Yola Çıktı" veya "Teslim Edildi" olarak güncellemesini sağlar.

4. **Sipariş İptal Etme**
    - **API Metodu:** DELETE /orders/{orderId}
    - **Açıklama:** Hazırlanmaya başlanmamış siparişlerin iptal edilmesini sağlar.

5. **Aktif Sipariş Detayı**
    - **API Metodu:** GET /orders/{orderId}
    - **Açıklama:** Aktif siparişin içeriğini, adetlerini ve durumunu görüntüler.

6. **Ödeme Yöntemi Kaydetme**
    - **API Metodu:** POST /payments
    - **Açıklama:** Kredi kartı bilgilerinin sonraki alışverişler için şifrelenerek kaydedilmesini sağlar.