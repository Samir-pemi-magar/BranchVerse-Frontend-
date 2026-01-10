import axios from "axios";
import axiosInstance from "./axiosinstance";

interface ChapterData {
  storyId: string;
  title: string;
  content: string;
  parentChapterId?: string;
  branchTitle?: string;
}

export const CreateStory = async (data: FormData) => {
  try {
    const res = await axiosInstance.post("/api/stories", data);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw err.response?.data || err.message;
    }
    throw err;
  }
};

export const WriteStory = async (data: ChapterData) => {
  try {
    const res = await axiosInstance.post("/api/chapters", data);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw err.response?.data || err.message;
    }
    throw err;
  }
};

export const GetAllStories = async () => {
  try {
    const res = await axiosInstance.get("/api/stories");
    return res.data; // array of stories
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw err.response?.data || err.message;
    }
    throw err;
  }
};

export const GetMainChapters = async (storyId: string) => {
  try {
    const res = await axiosInstance.get(`/api/chapters/${storyId}/main`);
    return res.data; // array of main chapters (title + chapterNumber)
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw err.response?.data || err.message;
    }
    throw err;
  }
};

export const GetChapter = async (storyId: string, chapterId: string) => {
  try {
    const res = await axiosInstance.get(
      `/api/chapters/read/${storyId}/${chapterId}`
    );
    return res.data; // full chapter content
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw err.response?.data || err.message;
    }
    throw err;
  }
};

export const GetTrendingStories = async () => {
  try {
    const res = await axiosInstance.get("/api/stories/feed/trending");
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw err.response?.data || err.message;
    }
    throw err;
  }
};

export const GetRecommendedStories = async () => {
  try {
    const res = await axiosInstance.get("/api/stories/feed/recommended");
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw err.response?.data || err.message;
    }
    throw err;
  }
};

export const GetPersonalizedStories = async () => {
  try {
    const res = await axiosInstance.get("/api/stories/feed/personalized");
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw err.response?.data || err.message;
    }
    throw err;
  }
};

export const GetFilteredStories = async (tags: string[] = []) => {
  try {
    // Convert array to comma-separated string for query param
    const tagsQuery = tags.join(",");
    const res = await axiosInstance.get(`/api/stories/feed/filter?tags=${tagsQuery}`);
    return res.data; // filtered stories array
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw err.response?.data || err.message;
    }
    throw err;
  }
};
