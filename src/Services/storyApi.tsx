import axios from "axios";
import axiosInstance from "./axiosinstance";

interface ChapterData {
  storyId: string;
  title: string;
  content: string;
  parentChapterId?: string;
  branchTitle?: string;
}

export interface Achievement {
  name: string;
  description: string;
  date: string;
  unlocked: boolean;
}

export interface Profile {
  _id: string;
  username: string; // match Mongoose model
  email: string; // top-level email
  description: string;
  profilePicture?: string; // URL in frontend
  totalStoriesWritten: number;
  totalStoriesBranched: number;
  totalLikes: number;
  achievements: Achievement[];
  contact: { facebook: string; instagram: string };
  createdAt: string;
  updatedAt: string;
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
    return res.data;
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

export const getSingleStory = async (StoryID: string) => {
  try {
    const res = await axiosInstance.get(`/api/stories/${StoryID}`);
    return res.data;
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
      `/api/chapters/read/${storyId}/${chapterId}`,
    );
    return res.data; // full chapter content
  } catch (err: unknown) {
    // Throw a proper Error with the message from response or fallback
    const message = axios.isAxiosError(err)
      ? err.response?.data?.message ||
        JSON.stringify(err.response?.data) ||
        err.message
      : "Unknown error";
    throw new Error(message);
  }
};

// Get all chapters in hierarchical structure (main + branches)
export const GetChaptersHierarchy = async (storyId: string) => {
  try {
    const res = await axiosInstance.get(
      `/api/chapters/story/${storyId}/hierarchy`,
    );
    return res.data; // will return nested chapters with branches
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
    const res = await axiosInstance.get(
      `/api/stories/feed/filter?tags=${tagsQuery}`,
    );
    return res.data; // filtered stories array
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw err.response?.data || err.message;
    }
    throw err;
  }
};

export const LikeStory = async (storyId: string) => {
  try {
    const res = await axiosInstance.post(`/api/stories/${storyId}/like`);
    return res.data; // { likes: number }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw err.response?.data || err.message;
    }
    throw err;
  }
};

export const LikeChapter = async (chapterId: string) => {
  try {
    const res = await axiosInstance.post(`/api/chapters/${chapterId}/like`);
    // res.data now returns { likes: number, liked: boolean }
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw err.response?.data || err.message;
    }
    throw err;
  }
};

export const CommentChapter = async (chapterId: string, text: string) => {
  try {
    const res = await axiosInstance.post(`/api/chapters/${chapterId}/comment`, {
      text,
    });
    return res.data; // updated comments array
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw err.response?.data || err.message;
    }
    throw err;
  }
};

export const GetComments = async (chapterId: string) => {
  try {
    const res = await axiosInstance.get(`/api/chapters/${chapterId}/comments`);
    return res.data; // comments array
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw err.response?.data || err.message;
    }
    throw err;
  }
};

export const ReplyToComment = async (
  chapterId: string,
  commentId: string,
  text: string,
) => {
  try {
    const res = await axiosInstance.post(
      `/api/chapters/${chapterId}/comment/${commentId}/reply`,
      { text },
    );
    return res.data; // returns updated comments array
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw err.response?.data || err.message;
    }
    throw err;
  }
};

// 1️⃣ Popular This Week (7 stories)
export const GetPopularThisWeek = async () => {
  try {
    const res = await axiosInstance.get("/api/stories/feed/popular-week"); // adjust endpoint
    return res.data; // array of stories
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

// 2️⃣ Top Writers (3 authors)
export const GetTopWriters = async () => {
  try {
    const res = await axiosInstance.get("/api/stories/top-writers"); // adjust endpoint
    return res.data; // array of authors
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

// 3️⃣ Top Stories (3 stories)
export const GetTopStories = async () => {
  try {
    const res = await axiosInstance.get("/api/stories/top-stories"); // adjust endpoint
    return res.data; // array of stories
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

// Get logged-in user profile
export const GetProfile = async (): Promise<Profile> => {
  const res = await axiosInstance.get("/api/auth/profile");
  return res.data;
};

// Get all achievements
export const GetAllAchievements = async (): Promise<Achievement[]> => {
  const res = await axiosInstance.get("/api/achievements");
  return res.data;
};

// Get logged-in user's achievements
export const GetUserAchievements = async (): Promise<Achievement[]> => {
  const res = await axiosInstance.get("/api/achievements/me");
  return res.data;
};

export const UpdateProfile = async (data: {
  username?: string;
  email?: string;
  description?: string;
  profilePicture?: File;
  contact?: { facebook?: string; instagram?: string };
}): Promise<Profile> => {
  try {
    const formData = new FormData();

    if (data.username) formData.append("username", data.username);
    if (data.email) formData.append("email", data.email);
    if (data.description) formData.append("description", data.description);
    if (data.contact) {
      if (data.contact.facebook)
        formData.append("contact[facebook]", data.contact.facebook);
      if (data.contact.instagram)
        formData.append("contact[instagram]", data.contact.instagram);
    }
    if (data.profilePicture)
      formData.append("profilePicture", data.profilePicture);

    const res = await axiosInstance.put("/api/auth/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // backend now returns { msg, user } with full profilePicture URL
    return res.data.user as Profile;
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

export const GetMyStories = async () => {
  try {
    const res = await axiosInstance.get("/api/stories/my-stories");
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("API ERROR:", err.response?.data);

      throw new Error(
        err.response?.data?.msg || err.message || "Failed to fetch stories",
      );
    }

    console.error("UNKNOWN API ERROR:", err);
    throw new Error("Unknown error occurred");
  }
};

export const GetMyBranches = async () => {
  try {
    const res = await axiosInstance.get("/api/chapters/my-branches");
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.msg || err.message || "Failed to fetch branches",
      );
    }
    throw new Error("Unknown error");
  }
};
