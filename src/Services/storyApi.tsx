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
