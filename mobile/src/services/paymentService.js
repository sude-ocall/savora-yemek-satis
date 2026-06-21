import api from "./api";

// ─── Ödeme Yöntemi Kaydet ───────────────────────────────────────────────────
export const savePaymentMethod = async (cardData) => {
  const response = await api.post("/payments", cardData);
  return response.data;
};

// ─── Kayıtlı Ödeme Yöntemlerini Listele ─────────────────────────────────────
export const getPaymentMethods = async () => {
  const response = await api.get("/payments");
  return response.data;
};

export default { savePaymentMethod, getPaymentMethods };
