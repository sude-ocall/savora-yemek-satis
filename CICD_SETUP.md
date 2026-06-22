# CI/CD Kurulum Rehberi (Jenkins + Docker)

Bu dokuman, Savora projesinin Jenkins uzerinde CI/CD pipeline'ini lokalde nasil
kuracaginizi adim adim anlatir.

---

## Onkosullar

- Docker Desktop kurulu ve calisiyor olmali
- Git kurulu olmali
- Terminal erisimi olmali

---

## 1. Jenkins'i Docker ile Baslat

```bash
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```

> `-v /var/run/docker.sock` ile Jenkins container'i host'taki Docker'i kullanabilir.

Ilk sifre icin:
```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Tarayicida `http://localhost:8080` adresini ac, sifreyi gir, onerilen eklentileri kur.

---

## 2. Jenkins Container'ina Docker CLI Kur

Jenkins container'i icerisinde Docker CLI olmayabilir. Asagidaki komutlarla ekle:

```bash
docker exec -u root jenkins bash -c "
  apt-get update &&
  apt-get install -y docker.io &&
  chmod 666 /var/run/docker.sock
"
```

Dogrulama:
```bash
docker exec jenkins docker ps
```

---

## 3. Jenkins'te Pipeline Olustur

1. `http://localhost:8080` adresine git
2. **New Item** > Proje adini gir > **Pipeline** sec > OK
3. **Pipeline** sekmesinde:
   - Definition: `Pipeline script from SCM`
   - SCM: `Git`
   - Repository URL: `https://github.com/sude-ocall/savora-yemek-satis.git`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
4. **Save**

---

## 4. Otomatik Tetikleyici (GitHub Webhook)

Pipeline sayfasinda **Configure** > **Build Triggers** sekmesinde:
- `GitHub hook trigger for GITScm polling` kutucugunu isaretle
- **Save**

---

## 5. Cloudflare Tunnel ile GitHub'a Acik URL Olustur

Jenkins localhost'ta calistigi icin GitHub'in webhook gondermesi icin dis erisime acik bir URL gerekir.

```bash
cloudflared tunnel --url http://localhost:8080
```

Cikan `https://xxxx.trycloudflare.com` adresini kopyala.

---

## 6. GitHub Webhook Ekle

1. GitHub reposuna git: `https://github.com/sude-ocall/savora-yemek-satis`
2. **Settings** > **Webhooks** > **Add webhook**
3. Payload URL: `https://xxxx.trycloudflare.com/github-webhook/`
4. Content type: `application/x-www-form-urlencoded`
5. Which events: `Send me everything`
6. **Add webhook**

---

## 7. Testi Dogrula

`main` branch'ine herhangi bir commit push at:

```bash
git commit --allow-empty -m "CI test"
git push origin main
```

`http://localhost:8080` adresinde pipeline'in otomatik tetiklendigini gormelisin.

---

## Pipeline Asamalari

| Asama | Aciklama |
|---|---|
| Checkout | Kaynak kodu git'ten ceker |
| Install Dependencies | Backend ve frontend npm bagimliklarini yukler |
| Build | Backend ve frontend Docker image'larini olusturur |
| Test | Servisleri ayaga kaldirir, health check yapar |
| Deploy | `docker compose up -d --build` ile uygulamayi deploy eder |

---

## Servis Portlari

| Servis | Port |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| RabbitMQ UI | http://localhost:15672 |
| Redis | localhost:6379 |
| Jenkins | http://localhost:8080 |
