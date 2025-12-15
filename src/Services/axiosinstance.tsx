import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASEURL, // frontend can see this
});

// Automatically attach JWT token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // get token from storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // attach token
  }
  return config;
});

export default axiosInstance;
