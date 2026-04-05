import axios from "axios";

const http = axios.create({
  baseURL: "https://savora-yemek-satis-backend.vercel.app/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json;charset=UTF-8",
  },
  withCredentials: true, // cookie/auth gönderimi için zorunlu
});

export default http;