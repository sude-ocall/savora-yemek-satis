import Redis from "ioredis";

let redisClient = null;

// ─── Redis Bağlantısı ────────────────────────────────────────────────────────
export const connectRedis = async () => {
  try {
    redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: null,
      retryStrategy: () => null,
      lazyConnect: true
    });

    redisClient.on("error", (err) => {
      console.error("❌ Redis hatası:", err.message);
    });

    await redisClient.connect();
    console.log("✅ Redis bağlantısı kuruldu.");

    return redisClient;
  } catch (error) {
    console.error("❌ Redis bağlantı hatası:", error.message);
    redisClient = null;
    return null;
  }
};

// ─── Sipariş Cache'e Yaz ─────────────────────────────────────────────────────
export const cacheOrder = async (orderId, orderData) => {
  try {
    if (!redisClient) return false;

    const key = `order:${orderId}`;
    await redisClient.setex(key, 300, JSON.stringify(orderData)); // 5 dakika TTL
    console.log(`💾 Sipariş cache'e yazıldı: ${orderId}`);
    return true;
  } catch (error) {
    console.error("❌ Redis cache yazma hatası:", error.message);
    return false;
  }
};

// ─── Sipariş Cache'den Oku ──────────────────────────────────────────────────
export const getCachedOrder = async (orderId) => {
  try {
    if (!redisClient) return null;

    const key = `order:${orderId}`;
    const cached = await redisClient.get(key);

    if (cached) {
      console.log(`⚡ Cache hit: ${orderId}`);
      return JSON.parse(cached);
    }

    console.log(`🔍 Cache miss: ${orderId}`);
    return null;
  } catch (error) {
    console.error("❌ Redis cache okuma hatası:", error.message);
    return null;
  }
};

// ─── Sipariş Cache'den Sil ──────────────────────────────────────────────────
export const invalidateOrderCache = async (orderId) => {
  try {
    if (!redisClient) return false;

    const key = `order:${orderId}`;
    await redisClient.del(key);
    console.log(`🗑️ Sipariş cache'den silindi: ${orderId}`);
    return true;
  } catch (error) {
    console.error("❌ Redis cache silme hatası:", error.message);
    return false;
  }
};

// ─── Kullanıcı Siparişlerini Cache'e Yaz ────────────────────────────────────
export const cacheUserOrders = async (userId, orders) => {
  try {
    if (!redisClient) return false;

    const key = `user_orders:${userId}`;
    await redisClient.setex(key, 120, JSON.stringify(orders)); // 2 dakika TTL
    return true;
  } catch (error) {
    console.error("❌ Redis user orders cache hatası:", error.message);
    return false;
  }
};

// ─── Kullanıcı Siparişlerini Cache'den Oku ─────────────────────────────────
export const getCachedUserOrders = async (userId) => {
  try {
    if (!redisClient) return null;

    const key = `user_orders:${userId}`;
    const cached = await redisClient.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    return null;
  }
};

// ─── Kullanıcı Siparişleri Cache'ini Sil ────────────────────────────────────
export const invalidateUserOrdersCache = async (userId) => {
  try {
    if (!redisClient) return false;

    const key = `user_orders:${userId}`;
    await redisClient.del(key);
    return true;
  } catch (error) {
    return false;
  }
};

export default {
  connectRedis,
  cacheOrder,
  getCachedOrder,
  invalidateOrderCache,
  cacheUserOrders,
  getCachedUserOrders,
  invalidateUserOrdersCache
};
