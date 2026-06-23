FROM node:20-alpine

WORKDIR /app

# package.json ve lock dosyasını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install --production

# Kaynak kodları kopyala
COPY . .

# Port aç
EXPOSE 3000

# .env dosyası docker-compose'dan gelecek
CMD ["node", "src/server.js"]
