// utils/authApi.ts
import axios from "axios";
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

interface PreferencesData {
  genres: string[];
  interests: string;
}

export const signup = async (data: SignupData) => {
  const response = await axiosInstance.post("/api/auth/signup", data, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};
export const login = async (data: LoginData) => {
  const response = await axiosInstance.post("/api/auth/login", data, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

// ✅ interceptor will attach token automatically
export const savePreferences = async (data: PreferencesData) => {
  const response = await axiosInstance.post("/api/auth/preferences", data);
  return response.data;
};

export const getPreferences = async () => {
  try {
    const response = await axiosInstance.get("/api/auth/preferences");
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw err.response?.data?.message || err.message;
    }
    throw new Error("Unexpected error occurred");
  }
};
