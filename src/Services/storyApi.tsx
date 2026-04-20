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

export interface UpdateStoryData {
  title?: string;
  description?: string;
  tags?: string[];
  genre?: string[];
  branchAllowed?: boolean;
  cover?: File;
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

interface UpdateChapterData {
  title?: string;
  content?: string;
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
    // res.data now has { currentUserId, stories }
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

export const GetProfile = async (): Promise<Profile> => {
  const res = await axiosInstance.get("/api/auth/profile");
  const data = res.data;
  // backend sends "id" not "_id"
  if (data.id && !data._id) data._id = data.id;
  return data;
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

export const DisableStory = async (storyId: string) => {
  try {
    const res = await axiosInstance.patch(`/api/stories/${storyId}/disable`);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

export const EnableStory = async (storyId: string) => {
  try {
    const res = await axiosInstance.patch(`/api/stories/${storyId}/enable`);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

export const DeleteStory = async (storyId: string) => {
  try {
    const res = await axiosInstance.delete(`/api/stories/${storyId}`);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

export const UpdateStory = async (storyId: string, data: UpdateStoryData) => {
  try {
    if (data.cover) {
      const formData = new FormData();
      if (data.title) formData.append("title", data.title);
      if (data.description) formData.append("description", data.description);
      if (data.tags) data.tags.forEach((tag) => formData.append("tags", tag));
      if (data.genre) data.genre.forEach((g) => formData.append("genre", g));
      if (data.branchAllowed !== undefined)
        formData.append("branchAllowed", String(data.branchAllowed));
      formData.append("cover", data.cover);

      const res = await axiosInstance.put(`/api/stories/${storyId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    }

    const res = await axiosInstance.put(`/api/stories/${storyId}`, data);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

export const DisableChapter = async (chapterId: string) => {
  try {
    const res = await axiosInstance.put(`/api/chapters/${chapterId}/disable`);
    return res.data; // { message: string }
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

export const EnableChapter = async (chapterId: string) => {
  try {
    const res = await axiosInstance.put(`/api/chapters/${chapterId}/enable`);
    return res.data; // { message: string }
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

export const UpdateChapter = async (
  chapterId: string,
  data: UpdateChapterData,
) => {
  try {
    const res = await axiosInstance.put(`/api/chapters/${chapterId}`, data);
    return res.data; // { message, chapter }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw err.response?.data || err.message;
    }
    throw err;
  }
};

export const DeleteChapter = async (chapterId: string) => {
  try {
    const res = await axiosInstance.delete(`/api/chapters/${chapterId}`);
    return res.data;
    // { message: "Chapter deleted successfully" }
    // OR { message: "Chapter has branches, so it was disabled instead" }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw err.response?.data || err.message;
    }
    throw err;
  }
};

// Toggle Story Bookmark (add/remove)
export const ToggleStoryBookmark = async (storyId: string) => {
  try {
    const res = await axiosInstance.post(`/api/stories/${storyId}/bookmark`);
    return res.data; // { bookmarked: true/false }
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

// Get bookmarked stories
export const GetBookmarkedStories = async () => {
  try {
    const res = await axiosInstance.get("/api/stories/bookmarks/stories");
    return res.data; // array of stories
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

// Toggle Chapter Bookmark (add/remove)
export const ToggleChapterBookmark = async (chapterId: string) => {
  try {
    const res = await axiosInstance.post(`/api/chapters/${chapterId}/bookmark`);
    return res.data; // { bookmarked: true/false }
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

// Get bookmarked chapters
export const GetBookmarkedChapters = async () => {
  try {
    const res = await axiosInstance.get("/api/chapters/bookmarks/chapters");
    return res.data; // array of chapters
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

// Get ALL bookmarks (stories + chapters)
export const GetAllBookmarks = async () => {
  try {
    const res = await axiosInstance.get("/api/stories/bookmarks/all");
    return res.data;
    // { stories: [], chapters: [] }
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

export const ToggleFollow = async (userId: string) => {
  try {
    const res = await axiosInstance.post(`/api/follow/${userId}/toggle`);
    return res.data; // { followed, followersCount }
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

export const CheckFollowStatus = async (userId: string) => {
  try {
    const res = await axiosInstance.get(`/api/follow/${userId}/status`);
    return res.data; // { isFollowing }
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

export const GetFollowers = async (userId: string) => {
  try {
    const res = await axiosInstance.get(`/api/follow/${userId}/followers`);
    return res.data; // { followers: [], count: 0 }
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

export const GetFollowing = async (userId: string) => {
  try {
    const res = await axiosInstance.get(`/api/follow/${userId}/following`);
    return res.data; // { following: [], count: 0 }
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

export const GetNotificationPreferences = async () => {
  try {
    const res = await axiosInstance.get(
      "/api/follow/notifications/preferences",
    );
    return res.data.notificationPreferences;
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

export const UpdateNotificationPreferences = async (data: {
  newFollower?: boolean;
  newStoryFromFollowing?: "all" | "none" | "digest";
}) => {
  try {
    const res = await axiosInstance.patch(
      "/api/follow/notifications/preferences",
      data,
    );
    return res.data.notificationPreferences;
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

export const GetPublicProfile = async (userId: string) => {
  const res = await axiosInstance.get(`/api/auth/profile/${userId}`);
  const data = res.data;
  if (data.id && !data._id) data._id = data.id;
  return data;
};

export const GetStoriesByUser = async (userId: string) => {
  try {
    const res = await axiosInstance.get(`/api/stories/user/${userId}`);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};

export const GetBranchesByUser = async (userId: string) => {
  try {
    const res = await axiosInstance.get(
      `/api/chapters/user/${userId}/branches`,
    );
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) throw err.response?.data || err.message;
    throw err;
  }
};
