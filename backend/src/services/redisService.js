const mockCache = new Map();
let isConnected = false;

// ─── Redis Bağlantısı (MOCK) ────────────────────────────────────────────────
export const connectRedis = async () => {
  try {
    // Simüle edilmiş bağlantı gecikmesi
    await new Promise(resolve => setTimeout(resolve, 500));
    isConnected = true;
    console.log("✅ Redis bağlantısı kuruldu. (In-Memory Mock)");
    return true;
  } catch (error) {
    console.error("❌ Redis bağlantı hatası:", error.message);
    return null;
  }
};

// ─── Sipariş Cache'e Yaz ─────────────────────────────────────────────────────
export const cacheOrder = async (orderId, orderData) => {
  try {
    if (!isConnected) return false;

    const key = `order:${orderId}`;
    mockCache.set(key, JSON.stringify(orderData));
    
    // Simüle edilmiş TTL temizliği (5 dakika)
    setTimeout(() => {
      mockCache.delete(key);
    }, 5 * 60 * 1000);

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
    if (!isConnected) return null;

    const key = `order:${orderId}`;
    const cached = mockCache.get(key);

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
    if (!isConnected) return false;

    const key = `order:${orderId}`;
    if (mockCache.has(key)) {
      mockCache.delete(key);
      console.log(`🗑️ Sipariş cache'den silindi: ${orderId}`);
    }
    return true;
  } catch (error) {
    console.error("❌ Redis cache silme hatası:", error.message);
    return false;
  }
};

// ─── Kullanıcı Siparişlerini Cache'e Yaz ────────────────────────────────────
export const cacheUserOrders = async (userId, orders) => {
  try {
    if (!isConnected) return false;

    const key = `user_orders:${userId}`;
    mockCache.set(key, JSON.stringify(orders));
    
    setTimeout(() => {
      mockCache.delete(key);
    }, 2 * 60 * 1000); // 2 dakika TTL

    return true;
  } catch (error) {
    console.error("❌ Redis user orders cache hatası:", error.message);
    return false;
  }
};

// ─── Kullanıcı Siparişlerini Cache'den Oku ─────────────────────────────────
export const getCachedUserOrders = async (userId) => {
  try {
    if (!isConnected) return null;

    const key = `user_orders:${userId}`;
    const cached = mockCache.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    return null;
  }
};

// ─── Kullanıcı Siparişleri Cache'ini Sil ────────────────────────────────────
export const invalidateUserOrdersCache = async (userId) => {
  try {
    if (!isConnected) return false;

    const key = `user_orders:${userId}`;
    mockCache.delete(key);
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
