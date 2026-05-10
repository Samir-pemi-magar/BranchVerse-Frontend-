import axios from "axios";
import adminAxios from "./adminAxios";

// ==================== TYPES ====================

export interface DashboardStats {
  users: { total: number; banned: number };
  stories: { total: number; disabled: number };
  chapters: { total: number; disabled: number };
  branches: { total: number };
}

export interface AdminUser {
  _id: string;
  username: string;
  email: string;
  banned: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStory {
  _id: string;
  title: string;
  disabled: boolean;
  author: { username: string; email: string };
  createdAt: string;
}

export interface AdminChapter {
  _id: string;
  title: string;
  disabled: boolean;
  isMainBranch: boolean;
  author: { username: string; email: string };
  storyId: { title: string };
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

// ==================== DASHBOARD ====================

export const GetDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const res = await adminAxios.get("/api/admin/stats");
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

// ==================== USER MANAGEMENT ====================

export const GetAllUsers = async (
  page = 1,
  limit = 20,
  search = "",
): Promise<PaginatedResponse<AdminUser> & { users: AdminUser[] }> => {
  try {
    const res = await adminAxios.get("/api/admin/users", {
      params: { page, limit, search: search || undefined },
    });
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

export const BanUser = async (userId: string) => {
  try {
    const res = await adminAxios.patch(`/api/admin/users/${userId}/ban`);
    return res.data; // { msg }
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

export const UnbanUser = async (userId: string) => {
  try {
    const res = await adminAxios.patch(`/api/admin/users/${userId}/unban`);
    return res.data; // { msg }
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

export const DeleteUser = async (userId: string) => {
  try {
    const res = await adminAxios.delete(`/api/admin/users/${userId}`);
    return res.data; // { msg }
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

// ==================== STORY MODERATION ====================

export const GetAllStoriesAdmin = async (
  page = 1,
  limit = 20,
  search = "",
): Promise<PaginatedResponse<AdminStory> & { stories: AdminStory[] }> => {
  try {
    const res = await adminAxios.get("/api/admin/stories", {
      params: { page, limit, search: search || undefined },
    });
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

export const AdminDisableStory = async (storyId: string) => {
  try {
    const res = await adminAxios.patch(`/api/admin/stories/${storyId}/disable`);
    return res.data; // { msg }
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

export const AdminEnableStory = async (storyId: string) => {
  try {
    const res = await adminAxios.patch(`/api/admin/stories/${storyId}/enable`);
    return res.data; // { msg }
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

export const AdminDeleteStory = async (storyId: string) => {
  try {
    const res = await adminAxios.delete(`/api/admin/stories/${storyId}`);
    return res.data; // { msg }
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

// ==================== CHAPTER MODERATION ====================

export const GetAllChaptersAdmin = async (
  page = 1,
  limit = 20,
  search = "",
): Promise<PaginatedResponse<AdminChapter> & { chapters: AdminChapter[] }> => {
  try {
    const res = await adminAxios.get("/api/admin/chapters", {
      params: { page, limit, search: search || undefined },
    });
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

export const AdminDisableChapter = async (chapterId: string) => {
  try {
    const res = await adminAxios.patch(
      `/api/admin/chapters/${chapterId}/disable`,
    );
    return res.data; // { msg }
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

export const AdminEnableChapter = async (chapterId: string) => {
  try {
    const res = await adminAxios.patch(
      `/api/admin/chapters/${chapterId}/enable`,
    );
    return res.data; // { msg }
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

export const AdminDeleteChapter = async (chapterId: string) => {
  try {
    const res = await adminAxios.delete(`/api/admin/chapters/${chapterId}`);
    return res.data; // { msg }
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};
