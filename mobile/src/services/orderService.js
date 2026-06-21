import api from "./api";

// ─── Sipariş Oluştur ────────────────────────────────────────────────────────
export const createOrder = async (menu) => {
  const response = await api.post("/orders", { menu });
  return response.data;
};

// ─── Kullanıcı Siparişlerini Listele ────────────────────────────────────────
export const getUserOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

// ─── Sipariş Detayı ─────────────────────────────────────────────────────────
export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

// ─── Sipariş İptal Et ───────────────────────────────────────────────────────
export const cancelOrder = async (orderId) => {
  const response = await api.delete(`/orders/${orderId}`);
  return response.data;
};

// ─── Sipariş Durumu Güncelle (Satıcı) ───────────────────────────────────────
export const updateOrderStatus = async (orderId, status) => {
  const response = await api.put(`/orders/${orderId}/status`, { status });
  return response.data;
};

export default {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
};
