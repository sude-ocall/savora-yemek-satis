import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379"
});

client.on("error", (err) => {
  // Redis bağlantısı olmazsa (örn. Vercel'de) uygulama çökmez, sadece loglar.
  console.warn("[Redis] Bağlantı hatası, önbellekleme devre dışı:", err.message);
});

let connected = false;

export async function getRedis() {
  if (!connected) {
    try {
      await client.connect();
      connected = true;
      console.log("[Redis] Bağlantı kuruldu");
    } catch (err) {
      console.warn("[Redis] Bağlanamadı:", err.message);
      return null;
    }
  }
  return client;
}

export default client;
