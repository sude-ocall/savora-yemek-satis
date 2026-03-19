# Savora Mobil REST API Dokümantasyonu
**Geliştirici:** Sena Maral
**Base URL:** `https://api.mobil.savora.com/v1`

Aşağıda Savora mobil projesi (iOS/Android) kapsamında geliştirilen 6 temel özelliğin RESTful standartlarına uygun API metotları, uç noktaları (endpoint) ve JSON formatındaki Request/Response detayları listelenmiştir.

---

## 1. Özel Yemek Talebi Açma
Müşterilerin mobil uygulama üzerinden kendilerine özel yemek siparişi oluşturmasını sağlar.

*   **Metot:** `POST`
*   **Endpoint:** `/custom-requests`
*   **Request Body:**
    ```json
    {
      "customer_id": "user-9876",
      "device_type": "ios",
      "title": "Vegan Lazanya (Glutensiz)",
      "description": "2 kişilik, glütensiz yufka ile yapılmış vegan lazanya talebi.",
      "target_price": 250.00,
      "delivery_date": "2026-03-21T19:00:00Z",
      "location": "Kadıköy, İstanbul"
    }
    ```
*   **Response Body (201 Created):**
    ```json
    {
      "request_id": "req-1001",
      "status": "PENDING",
      "created_at": "2026-03-19T19:54:00Z",
      "message": "Özel yemek talebiniz başarıyla oluşturuldu."
    }
    ```

---

## 2. Bölgesel Talepler Listeleme
Satıcıların mobil uygulamalarında GPS konumlarına göre çevrelerindeki aktif yemek taleplerini listelemesini sağlar.

*   **Metot:** `GET`
*   **Endpoint:** `/custom-requests?location=Kadıköy&status=PENDING`
*   **Request Body:** (Boş)
*   **Response Body (200 OK):**
    ```json
    {
      "results": 1,
      "requests": [
        {
          "request_id": "req-1001",
          "customer_name": "Ahmet Y.",
          "distance_km": 1.2,
          "title": "Vegan Lazanya (Glutensiz)",
          "target_price": 250.00,
          "delivery_date": "2026-03-21T19:00:00Z"
        }
      ]
    }
    ```

---

## 3. Talep Teklifi Güncelleme
Satıcının, mobil uygulama üzerinden daha önceden verdiği fiyat/içerik teklifini (offer) revize etmesini sağlar.

*   **Metot:** `PUT`
*   **Endpoint:** `/custom-requests/{request_id}/offers/{offer_id}`
*   **Request Body:**
    ```json
    {
      "seller_id": "seller-5432",
      "offered_price": 230.00,
      "message": "Malzeme fiyatları düştüğü için teklifimi güncelliyorum."
    }
    ```
*   **Response Body (200 OK):**
    ```json
    {
      "offer_id": "off-8888",
      "request_id": "req-1001",
      "updated_price": 230.00,
      "status": "UPDATED",
      "updated_at": "2026-03-19T20:15:00Z"
    }
    ```

---

## 4. Talebi Geri Çekme
Müşterinin akıllı telefonundan henüz onaylanmamış özel yemek talebini sistemden iptal etmesini sağlar.

*   **Metot:** `DELETE`
*   **Endpoint:** `/custom-requests/{request_id}`
*   **Request Body:** (Boş)
*   **Response Body (200 OK):**
    ```json
    {
      "request_id": "req-1001",
      "status": "CANCELLED",
      "message": "Talep başarıyla geri çekilmiştir."
    }
    ```

---

## 5. Satıcıya Yorum Yapma
Sipariş tamamlandıktan sonra mobil bildirimle (Push Notification) gelen müşterinin satıcıyı puanlamasını sağlar.

*   **Metot:** `POST`
*   **Endpoint:** `/sellers/{seller_id}/reviews`
*   **Request Body:**
    ```json
    {
      "customer_id": "user-9876",
      "order_id": "ord-5555",
      "rating": 5,
      "comment": "Yemekler çok sıcak ve lezzetli geldi, kurye çok hızlıydı."
    }
    ```
*   **Response Body (201 Created):**
    ```json
    {
      "review_id": "rev-9999",
      "seller_id": "seller-5432",
      "status": "PUBLISHED",
      "message": "Değerlendirmeniz başarıyla kaydedildi."
    }
    ```

---

## 6. Yorum ve Şikayetler Listeleme
Bir satıcının mobil profil sayfasına tıklandığında ona ait tüm yorum ve şikayetlerin sonsuz kaydırma (infinite scroll) ile listelenmesini sağlar.

*   **Metot:** `GET`
*   **Endpoint:** `/sellers/{seller_id}/reviews?sort=newest&page=1`
*   **Request Body:** (Boş)
*   **Response Body (200 OK):**
    ```json
    {
      "seller_id": "seller-5432",
      "average_rating": 4.8,
      "page": 1,
      "total_reviews": 1,
      "reviews": [
        {
          "review_id": "rev-9999",
          "customer_name": "Ahmet Y.",
          "rating": 5,
          "comment": "Yemekler çok sıcak ve lezzetli geldi...",
          "created_at": "2026-03-22T10:30:00Z"
        }
      ]
    }
    ```
