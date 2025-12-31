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

interface PreferencesData {
  genres: string[];
  interests: string;
}

export const signup = async (data: SignupData) => {
  const response = await axiosInstance.post("/api/auth/signup", data);
  return response.data;
};

export const login = async (data: LoginData) => {
  const response = await axiosInstance.post("/api/auth/login", data);
  return response.data;
};

export const savePreferences = async (data: PreferencesData, token: string) => {
  const response = await axiosInstance.post("/api/auth/preferences", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getPreferences = async (token: string) => {
  const response = await axiosInstance.get("/api/auth/preferences", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
