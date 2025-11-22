// utils/authApi.ts
import axiosInstance from "./axiosinstance";

interface SignupData {
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const signup = async (data: SignupData) => {
  const response = await axiosInstance.post("/api/auth/signup", data);
  return response.data;
};

export const login = async (data: LoginData) => {
  const response = await axiosInstance.post("/api/auth/login", data);
  return response.data;
};
