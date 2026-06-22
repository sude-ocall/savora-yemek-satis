import api from "./api";

// ─── Kullanıcı Giriş ────────────────────────────────────────────────────────
export const loginUser = async (email, password) => {
  const response = await api.post("/users/login", { email, password });
  return response.data;
};

// ─── Satıcı Giriş ───────────────────────────────────────────────────────────
export const loginSeller = async (email, password) => {
  const response = await api.post("/sellers/login", { email, password });
  return response.data;
};

// ─── Kullanıcı Kayıt ─────────────────────────────────────────────────────────
export const registerUser = async (data) => {
  const response = await api.post("/users/register", data);
  return response.data;
};

// ─── Profil Bilgileri ────────────────────────────────────────────────────────
export const getUserProfile = async () => {
  const response = await api.get("/users/profile");
  return response.data;
};

export default { loginUser, loginSeller, registerUser, getUserProfile };

