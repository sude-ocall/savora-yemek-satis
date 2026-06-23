## 🎬 Çalışma Videoları

| # | Başlık | Açıklama | Bağlantı |
|---|---|---|---|
| 1 | Mobil Frontend Demosu | React Native + Expo ile 6 gereksinimin (üye kaydı, profil görüntüleme, şifre güncelleme, hesap silme, adres tanımlama, satıcı yorumları) telefonda çalışması | [▶ İzle](https://youtube.com/shorts/O2xSCYzmwHI) |
| 2 | Mobil Backend Demosu | Mobil uygulamadan JWT'li REST API'ye yapılan 6 servis bağlantısının (register, login, profile, password, account, addresses) canlı gösterimi | [▶ İzle](https://youtu.be/uJzC2ts0PK8) |
| 3 | Docker, Redis & RabbitMQ Demosu | Servislerin Docker konteynerleri olarak ayağa kaldırılması; Redis önbellekleme ve RabbitMQ mesaj kuyruğunun canlı çalışması | [▶ İzle](https://youtu.be/G5v-lcQy7nU) |

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

 1. Üye Kaydı Oluşturma


   * API Metodu: `POST /auth/register`

   * Açıklama: Yeni kullanıcıların ad, soyad ve e-posta bilgilerini alarak sisteme kayıt olmasını sağlar.

2. Profil Bilgilerini Görüntüleme

   
 * API Metodu: `GET /users/{userId}`

  * Açıklama:Giriş yapmış kullanıcının kendi iletişim ve adres bilgilerini görüntülemesini sağlar.

 3. Şifre Güncelleme

    
  * API Metodu: `PUT /users/{userId}/password`

  * Açıklama: Güvenlik amacıyla mevcut şifrenin doğrulanmasının ardından yeni şifre ile değiştirilmesini sağlar.

4. Hesap Silme

   
 * API Metodu: `DELETE /users/{userId}`

 * Açıklama: Kullanıcının verilerinin sistemden tamamen kaldırılmasını sağlar.

5. Adres Tanımlama

    
  * PI Metodu:`POST /users/{userId}/addresses` 
  
  * Açıklama: Teslimat için yeni bir ev veya iş adresi eklenmesini sağlar.

 6. Satıcı Puanlarını Listeleme

     
 * API Metodu: `GET /vendors/{vendorId}/ratings`

* Açıklama: Alıcının, güvenilirlik için satıcının geçmiş puanlarını görmesini sağlar.