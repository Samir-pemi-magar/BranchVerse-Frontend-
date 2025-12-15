import axios from "axios";
import axiosInstance from "./axiosinstance";

interface ChapterData {
  storyId: string;
  title: string;
  content: string;
  parentChapterId?: string;
}

export const CreateStory = async (data: FormData) => {
  try {
    const response = await axiosInstance.post("/api/stories", data);
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("CreateStory error:", err.response?.data || err.message);
      throw err;
    } else if (err instanceof Error) {
      console.error("CreateStory error:", err.message);
      throw err;
    } else {
      console.error("CreateStory error:", err);
      throw new Error("Unknown error");
    }
  }
};

export const WriteStory = async (data: ChapterData) => {
  try {
    const response = await axiosInstance.post("/api/chapters", data);
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("WriteStory error:", err.response?.data || err.message);
      throw err;
    } else if (err instanceof Error) {
      console.error("WriteStory error:", err.message);
      throw err;
    } else {
      console.error("WriteStory error:", err);
      throw new Error("Unknown error");
    }
  }
};
