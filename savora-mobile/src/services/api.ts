import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Telefon: bilgisayarın yerel IP'si | Android emülatör: 10.0.2.2 | iOS sim: localhost
const BASE_URL = 'http://192.168.1.185:3000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Token varsa her isteğe otomatik ekle
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('savora_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 gelirse oturumu temizle
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['savora_token', 'savora_user']);
    }
    return Promise.reject(error);
  }
);

export type Product = {
  _id: string;
  sellerId: string;
  name: string;
  category: string;
  price: number;
  description: string;
  imgURL: string;
  portion: number;
};

export const loginSeller = async (email: string, password: string): Promise<string> => {
  const res = await api.post('/api/sellers/login', { email, password });
  return res.data.token as string;
};

export const getProducts = async (): Promise<Product[]> => {
  const res = await api.get('/api/products');
  return Array.isArray(res.data) ? res.data : [];
};

export const createProduct = async (
  _token: string,
  product: { name: string; category: string; price: number; description: string; imgURL?: string }
): Promise<Product> => {
  const res = await api.post('/api/products', product);
  return res.data as Product;
};

export const updateProduct = async (
  _token: string,
  id: string,
  data: Partial<{ name: string; category: string; price: number; description: string; portion: number; imgURL: string }>
): Promise<Product> => {
  const res = await api.put(`/api/products/${id}`, data);
  return res.data as Product;
};

export const deleteProduct = async (_token: string, id: string): Promise<void> => {
  await api.delete(`/api/products/${id}`);
};

export default api;
