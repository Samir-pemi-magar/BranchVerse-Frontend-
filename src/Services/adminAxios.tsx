// src/Services/adminAxios.ts
import axios from "axios";

const adminAxios = axios.create({ baseURL: process.env.NEXT_PUBLIC_BASEURL }); // ← fixed

adminAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default adminAxios;
