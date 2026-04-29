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

export const forgotPassword = async (email: string) => {
  const response = await axiosInstance.post("/api/auth/forgot-password", {
    email,
  });
  return response.data;
};

export const resetPassword = async (token: string, password: string) => {
  const response = await axiosInstance.post(
    `/api/auth/reset-password/${token}`,
    { password },
  );
  return response.data;
};

// ─── Chat ────────────────────────────────────────────────────────────────────

export const getMyConversations = async () => {
  const response = await axiosInstance.get("/api/chat");
  return response.data;
};

export const getOrCreateDM = async (userId: string) => {
  const response = await axiosInstance.get(`/api/chat/dm/${userId}`);
  return response.data;
};

export const createGroup = async (name: string, participants: string[]) => {
  const response = await axiosInstance.post("/api/chat/group", {
    name,
    participants,
  });
  return response.data;
};

export const renameGroup = async (conversationId: string, name: string) => {
  const response = await axiosInstance.put(
    `/api/chat/group/${conversationId}/rename`,
    { name },
  );
  return response.data;
};

export const addToGroup = async (conversationId: string, userId: string) => {
  const response = await axiosInstance.put(
    `/api/chat/group/${conversationId}/add`,
    { userId },
  );
  return response.data;
};

export const removeFromGroup = async (
  conversationId: string,
  userId: string,
) => {
  const response = await axiosInstance.put(
    `/api/chat/group/${conversationId}/remove`,
    { userId },
  );
  return response.data;
};

// ─── Messages ────────────────────────────────────────────────────────────────

export const sendMessage = async (conversationId: string, content: string) => {
  const response = await axiosInstance.post("/api/message", {
    conversationId,
    content,
  });
  return response.data;
};

export const getMessages = async (conversationId: string, page = 1) => {
  const response = await axiosInstance.get(
    `/api/message/${conversationId}?page=${page}`,
  );
  return response.data;
};

export const markAsRead = async (messageId: string) => {
  const response = await axiosInstance.put(`/api/message/${messageId}/read`);
  return response.data;
};

export const deleteMessage = async (messageId: string) => {
  const response = await axiosInstance.delete(`/api/message/${messageId}`);
  return response.data;
};
