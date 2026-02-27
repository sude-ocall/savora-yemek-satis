# İrem Nur Yaşlı - REST API Metotları

**API Test Videosu:** [Link buraya eklenecek]

## 1. Üye Olma
* **Endpoint:** `POST /auth/register`
* **Request Body:**
```json
{
  "email": "irem@example.com",
  "password": "GuvenliSifre1!",
  "firstName": "İrem Nur",
  "lastName": "Yaşlı"
}

2. Profil Bilgilerini Görüntüleme
Endpoint: GET /users/{userId}

Path Parameters:

userId (string, required) - Kullanıcı ID'si

Authentication: Bearer Token gerekli

Response: 200 OK - Profil bilgileri getirildi.

3. Şifre Güncelleme
Endpoint: PUT /users/{userId}/password

Request Body:

JSON
{
  "currentPassword": "EskiSifre123",
  "newPassword": "YeniSifre456"
}
Response: 200 OK - Şifre güncellendi.

4. Adres Tanımlama
Endpoint: POST /users/{userId}/addresses

Response: 201 Created - Yeni adres başarıyla eklendi.
