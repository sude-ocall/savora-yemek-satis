
# REST API Görevleri

## Talep Yönetimi

### Talep Oluşturma

Endpoint: POST /requests
Kullanıcıların yeni yemek talepleri oluşturmasını sağlar.

### Talepleri Listeleme

Endpoint: GET /requests
Sistemde bulunan yemek taleplerini listeler.

### Talep Detayı Görüntüleme

Endpoint: GET /requests/{requestId}
Belirli bir talebin detaylarını görüntüler.

### Talep Silme

Endpoint: DELETE /requests/{requestId}
Kullanıcının oluşturduğu talebi iptal etmesini sağlar.

## Teklif Yönetimi

### Teklif Güncelleme

Endpoint: PUT /requests/{requestId}/offer
Satıcıların talebe verdikleri fiyat teklifini günceller.

## Yorum Yönetimi

### Yorum Ekleme

Endpoint: POST /reviews
Kullanıcıların satıcıya yorum yapmasını sağlar.

### Yorumları Listeleme

Endpoint: GET /reviews/{sellerId}
Belirli bir satıcıya yapılan yorumları listeler.
