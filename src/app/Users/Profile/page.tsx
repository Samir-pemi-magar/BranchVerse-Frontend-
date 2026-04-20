"use client";
import {
  GetProfile,
  GetPublicProfile,
  UpdateProfile,
  GetUserAchievements,
  GetMyStories,
  GetMyBranches,
  GetFollowers,
  GetFollowing,
  ToggleFollow,
  CheckFollowStatus,
  DisableStory,
  EnableStory,
  DeleteStory,
  GetAllBookmarks,
  ToggleStoryBookmark,
  ToggleChapterBookmark,
  GetStoriesByUser,
  GetBranchesByUser,
} from "@/src/Services/storyApi";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { SlBookOpen } from "react-icons/sl";
import {
  FaUser,
  FaRegHeart,
  FaFacebook,
  FaInstagram,
  FaEnvelope,
} from "react-icons/fa";

export interface Achievement {
  name: string;
  description: string;
  date: string;
  unlocked: boolean;
}

export interface Profile {
  _id: string;
  username: string;
  email: string;
  description: string;
  profilePicture?: string;
  totalStoriesWritten: number;
  totalStoriesBranched: number;
  totalLikes: number;
  achievements: Achievement[];
  contact: { facebook: string; instagram: string };
  createdAt: string;
  updatedAt: string;
  followers?: FollowUser[];
  following?: FollowUser[];
}

interface Author {
  _id: string;
  username: string;
  avatar?: string;
}

interface Story {
  _id: string;
  title: string;
  cover: string;
  tags: string[];
  description: string;
  author: Author;
  views: number;
  likes: number;
  branchAllowed: boolean;
  createdAt: string;
  branchesCount: number;
  disabled?: boolean;
}

interface Branch {
  _id: string;
  branchTitle: string;
  chapterTitle: string;
  chapterNumber: number;
  createdAt: string;
  likes: number;
  views: number;
  disabled?: boolean;
  tags: string[];
  story: {
    _id: string;
    title: string;
    cover: string;
    tags: string[];
    branchesCount: number;
    author: { _id: string; username: string } | null;
  } | null;
}

interface BookmarkedChapter {
  _id: string;
  title: string;
  chapterNumber?: number;
  disabled?: boolean;
  story: {
    _id: string;
    title: string;
    cover: string;
    tags: string[];
    author: Author | null;
  } | null;
}

interface FollowUser {
  _id: string;
  username: string;
  profilePicture?: string;
}

// ─── Follower/Following Modal ─────────────────────────────────────────────────
function UserListModal({
  title,
  users,
  onClose,
}: {
  title: string;
  users: FollowUser[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-[380px] max-h-[520px] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-[17px] text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-3 py-3">
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <FaUser className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-[14px]">No {title.toLowerCase()} yet.</p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <img
                  src={user.profilePicture || "/file.svg"}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                <span className="font-medium text-[14px] text-gray-800">
                  {user.username}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProfilePage() {
  const searchParams = useSearchParams();
  const viewingId = searchParams?.get("id") ?? null;
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [bookmarkedStories, setBookmarkedStories] = useState<Story[]>([]);
  const [bookmarkedChapters, setBookmarkedChapters] = useState<
    BookmarkedChapter[]
  >([]);

  const [editForm, setEditForm] = useState({
    username: "",
    description: "",
    profilePicture: null as File | null,
    email: "",
    facebook: "",
    instagram: "",
  });

  const [previewUrl, setPreviewUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [myStories, setMyStories] = useState<Story[]>([]);
  const [myBranches, setMyBranches] = useState<Branch[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "stories" | "branched" | "bookmark"
  >("stories");

  // ── Follow state ─────────────────────────────────────────────────────────────
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // ── Modal state ───────────────────────────────────────────────────────────────
  const [userListModal, setUserListModal] = useState<{
    open: boolean;
    type: "followers" | "following";
  }>({ open: false, type: "followers" });

  // ── Data fetching ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Step 1: get logged-in user's id
        let ownId: string | null = null;
        try {
          const me = await GetProfile();
          ownId = me._id;
        } catch {
          // not logged in
        }

        const own = !viewingId || viewingId === ownId;
        setIsOwnProfile(own);

        if (own && ownId) {
          // ── Own profile: fetch everything ──────────────────────────────────
          const profileData = await GetProfile();
          setProfile(profileData);

          const [
            achievementsData,
            myStoriesData,
            myBranchesData,
            bookmarksData,
            followersData,
            followingData,
          ] = await Promise.allSettled([
            GetUserAchievements(),
            GetMyStories(),
            GetMyBranches(),
            GetAllBookmarks(),
            GetFollowers(profileData._id),
            GetFollowing(profileData._id),
          ]);

          if (achievementsData.status === "fulfilled")
            setAchievements(achievementsData.value);
          if (myStoriesData.status === "fulfilled")
            setMyStories(myStoriesData.value);
          if (myBranchesData.status === "fulfilled")
            setMyBranches(myBranchesData.value);
          if (bookmarksData.status === "fulfilled") {
            setBookmarkedStories(bookmarksData.value?.stories || []);
            setBookmarkedChapters(bookmarksData.value?.chapters || []);
          }
          if (followersData.status === "fulfilled") {
            const list =
              followersData.value?.followers || followersData.value || [];
            setFollowers(list);
            setFollowersCount(list.length);
          }
          if (followingData.status === "fulfilled") {
            const list =
              followingData.value?.following || followingData.value || [];
            setFollowing(list);
            setFollowingCount(list.length);
          }
        } else if (viewingId) {
          // ── Public profile: fetch public data + that user's stories/branches ─
          const profileData = await GetPublicProfile(viewingId);
          setProfile(profileData);
          setFollowersCount(profileData.followers?.length ?? 0);
          setFollowingCount(profileData.following?.length ?? 0);
          setFollowers(profileData.followers ?? []);
          setFollowing(profileData.following ?? []);

          const status = await CheckFollowStatus(viewingId);
          setIsFollowing(status?.isFollowing ?? false);

          const [achievementsData, publicStoriesData, publicBranchesData] =
            await Promise.allSettled([
              GetUserAchievements(),
              GetStoriesByUser(viewingId), // ✅ fixed: fetch viewed user's stories
              GetBranchesByUser(viewingId), // ✅ fixed: fetch viewed user's branches
            ]);

          if (achievementsData.status === "fulfilled")
            setAchievements(achievementsData.value);
          if (publicStoriesData.status === "fulfilled")
            setMyStories(publicStoriesData.value);
          if (publicBranchesData.status === "fulfilled")
            setMyBranches(publicBranchesData.value);
        }
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [viewingId]);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const openEditModal = () => {
    if (!profile) return;
    setEditForm({
      username: profile.username,
      description: profile.description,
      email: profile.email,
      facebook: profile.contact?.facebook ?? "", // ✅ fixed: safe access
      instagram: profile.contact?.instagram ?? "", // ✅ fixed: safe access
      profilePicture: null,
    });
    setPreviewUrl(profile.profilePicture || "");
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setSaveError(null);
  };

  const handleToggleStory = async (storyId: string, disabled?: boolean) => {
    try {
      if (disabled) {
        await EnableStory(storyId);
      } else {
        await DisableStory(storyId);
      }
      setMyStories((prev) =>
        prev.map((s) =>
          s._id === storyId ? { ...s, disabled: !disabled } : s,
        ),
      );
    } catch (err) {
      console.error(err);
      alert("Action failed");
    }
  };

  const handleUnbookmark = async (id: string, type: "story" | "chapter") => {
    try {
      if (type === "story") {
        await ToggleStoryBookmark(id);
        setBookmarkedStories((prev) => prev.filter((s) => s._id !== id));
      } else {
        await ToggleChapterBookmark(id);
        setBookmarkedChapters((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to remove bookmark");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setEditForm((prev) => ({ ...prev, profilePicture: file }));
  };

  const handleSave = async () => {
    if (!profile) return;
    try {
      setIsSaving(true);
      const updatedProfile = await UpdateProfile({
        username: editForm.username,
        email: editForm.email,
        description: editForm.description,
        profilePicture: editForm.profilePicture || undefined,
        contact: { facebook: editForm.facebook, instagram: editForm.instagram },
      });
      setProfile(updatedProfile);
      setIsEditOpen(false);
    } catch (err) {
      setSaveError("Failed to save changes.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!confirm("Delete this story?")) return;
    try {
      await DeleteStory(storyId);
      setMyStories((prev) => prev.filter((s) => s._id !== storyId));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleFollowToggle = async () => {
    if (!profile) return;
    try {
      setFollowLoading(true);
      const targetId = viewingId ?? profile._id;
      const res = await ToggleFollow(targetId);
      const nowFollowing: boolean = res?.followed ?? !isFollowing;
      setIsFollowing(nowFollowing);
      setFollowersCount((prev) => (nowFollowing ? prev + 1 : prev - 1));
      const followersData = await GetFollowers(profile._id);
      const list: FollowUser[] =
        followersData?.followers || followersData || [];
      setFollowers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  const openUserList = async (type: "followers" | "following") => {
    if (!profile) return;
    try {
      if (type === "followers") {
        const data = await GetFollowers(profile._id);
        setFollowers(data?.followers || data || []);
      } else {
        const data = await GetFollowing(profile._id);
        setFollowing(data?.following || data || []);
      }
    } catch (err) {
      console.error(err);
    }
    setUserListModal({ open: true, type });
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center mt-[68px]">
        <div className="w-8 h-8 border-4 border-[#00B8AE] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center mt-[68px]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Tabs available: bookmark only for own profile
  const availableTabs = (
    isOwnProfile ? ["stories", "branched", "bookmark"] : ["stories", "branched"]
  ) as ("stories" | "branched" | "bookmark")[];

  return (
    <div className="w-full min-h-screen flex flex-col items-center mt-[68px] gap-10">
      {/* ── Profile Header ──────────────────────────────────────────────────────── */}
      <section className="flex flex-row gap-[39px] min-h-[353px] w-[1200px] bg-linear-to-t from-[#F4F3FF] to-[#ECFCFF] px-[115px] py-[55px] items-start">
        <img
          src={profile?.profilePicture || "/file.svg"}
          alt="preview"
          className="w-25 h-25 rounded-full object-cover"
        />
        <div className="flex flex-col flex-1 min-w-0 gap-5">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-none">
              {profile?.username}
            </h1>

            {/* Follow button — public profile only */}
            {!isOwnProfile && (
              <div className="mt-1">
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 border ${
                    isFollowing
                      ? "bg-white border-gray-300 text-gray-700 hover:border-red-400 hover:text-red-500"
                      : "bg-[#00B8AE] border-[#00B8AE] text-white hover:bg-[#009d94]"
                  } ${followLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            )}

            {/* Contact row */}
            <div className="flex flex-wrap items-center gap-3 mt-1">
              {profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <FaEnvelope className="w-3.5 h-3.5 shrink-0" />
                  <span>{profile.email}</span>
                </a>
              )}
              {profile?.contact?.facebook && (
                <>
                  <span className="text-gray-300 select-none">·</span>
                  <a
                    href={profile.contact.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <FaFacebook className="w-3.5 h-3.5 shrink-0" />
                    <span>Facebook</span>
                  </a>
                </>
              )}
              {profile?.contact?.instagram && (
                <>
                  <span className="text-gray-300 select-none">·</span>
                  <a
                    href={profile.contact.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-pink-600 transition-colors"
                  >
                    <FaInstagram className="w-3.5 h-3.5 shrink-0" />
                    <span>Instagram</span>
                  </a>
                </>
              )}
            </div>
          </div>

          <p className="font-normal text-[16px] break-words whitespace-pre-wrap">
            {profile?.description}
          </p>

          {/* Edit button — own profile only */}
          {isOwnProfile && (
            <button
              onClick={openEditModal}
              className="w-[159px] h-[43px] px-4 py-2 bg-[#00B8AE] rounded-md text-white font-semibold"
            >
              Edit profile
            </button>
          )}
        </div>
      </section>

      {/* ── Stats Bar ───────────────────────────────────────────────────────────── */}
      <section className="flex flex-row items-center gap-12 border border-[#EBE4E4] opacity-[47%] rounded-md w-[1200px] h-[127px] px-[102px] justify-between">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 flex items-center justify-center">
            <SlBookOpen className="w-7 h-7 text-[#00B8AE]" />
          </div>
          <span className="font-semibold text-lg">
            {profile?.totalStoriesWritten}
          </span>
          <span className="text-[14px] font-semibold">Stories Written</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-10 h-10 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-[#00B8AE]"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.75001 17.5663C9.32037 16.9845 10.0011 16.5222 10.7523 16.2067C11.5036 15.8912 12.3102 15.7287 13.125 15.7288H16.625C17.6523 15.7292 18.647 15.368 19.4348 14.7086C20.2225 14.0491 20.7531 13.1335 20.9335 12.1221C20.1135 11.8937 19.4048 11.3743 18.9401 10.661C18.4754 9.94782 18.2866 9.08969 18.409 8.24729C18.5313 7.40489 18.9565 6.63596 19.6049 6.08443C20.2533 5.5329 21.0805 5.23658 21.9316 5.25093C22.7828 5.26529 23.5995 5.58933 24.2289 6.16242C24.8584 6.7355 25.2574 7.51833 25.3513 8.36438C25.4452 9.21042 25.2275 10.0617 24.739 10.7588C24.2506 11.456 23.5248 11.9512 22.6975 12.1518C22.5035 13.625 21.7805 14.9775 20.6634 15.9572C19.5462 16.9369 18.1109 17.4771 16.625 17.4771H13.125C12.0904 17.4768 11.0892 17.8432 10.2991 18.5112C9.50902 19.1792 8.98125 20.1056 8.80951 21.1258C9.62793 21.3525 10.336 21.869 10.8018 22.5791C11.2676 23.2891 11.4594 24.1444 11.3414 24.9853C11.2233 25.8263 10.8035 26.5957 10.1603 27.1501C9.51698 27.7045 8.69406 28.0061 7.84487 27.9987C6.99567 27.9913 6.17813 27.6755 5.5446 27.1099C4.91106 26.5444 4.50474 25.7678 4.40136 24.9249C4.29798 24.082 4.50459 23.2303 4.98269 22.5284C5.4608 21.8266 6.17777 21.3225 7.00001 21.1101V6.88959C6.17518 6.67662 5.45634 6.17014 4.97823 5.46509C4.50012 4.76003 4.29556 3.9048 4.4029 3.05972C4.51024 2.21463 4.92211 1.4377 5.5613 0.874561C6.2005 0.311421 7.02313 0.000732422 7.87501 0.000732422C8.72689 0.000732422 9.54952 0.311421 10.1887 0.874561C10.8279 1.4377 11.2398 2.21463 11.3471 3.05972C11.4545 3.9048 11.2499 4.76003 10.7718 5.46509C10.2937 6.17014 9.57483 6.67662 8.75001 6.88959V17.5663ZM7.87501 5.24984C8.33914 5.24984 8.78426 5.06547 9.11245 4.73728C9.44063 4.40909 9.62501 3.96397 9.62501 3.49984C9.62501 3.03571 9.44063 2.59059 9.11245 2.26241C8.78426 1.93422 8.33914 1.74984 7.87501 1.74984C7.41088 1.74984 6.96576 1.93422 6.63757 2.26241C6.30938 2.59059 6.12501 3.03571 6.12501 3.49984C6.12501 3.96397 6.30938 4.40909 6.63757 4.73728C6.96576 5.06547 7.41088 5.24984 7.87501 5.24984ZM7.87501 26.2498C8.33914 26.2498 8.78426 26.0655 9.11245 25.7373C9.44063 25.4091 9.62501 24.964 9.62501 24.4998C9.62501 24.0357 9.44063 23.5906 9.11245 23.2624C8.78426 22.9342 8.33914 22.7498 7.87501 22.7498C7.41088 22.7498 6.96576 22.9342 6.63757 23.2624C6.30938 23.5906 6.12501 24.0357 6.12501 24.4998C6.12501 24.964 6.30938 25.4091 6.63757 25.7373C6.96576 26.0655 7.41088 26.2498 7.87501 26.2498ZM21.875 10.4998C22.3391 10.4998 22.7843 10.3155 23.1124 9.98728C23.4406 9.65909 23.625 9.21397 23.625 8.74984C23.625 8.28571 23.4406 7.8406 23.1124 7.51241C22.7843 7.18422 22.3391 6.99984 21.875 6.99984C21.4109 6.99984 20.9658 7.18422 20.6376 7.51241C20.3094 7.8406 20.125 8.28571 20.125 8.74984C20.125 9.21397 20.3094 9.65909 20.6376 9.98728C20.9658 10.3155 21.4109 10.4998 21.875 10.4998Z"
                fill="#00B8AE"
              />
            </svg>
          </div>
          <span className="font-semibold text-lg">
            {profile?.totalStoriesBranched}
          </span>
          <span className="text-[14px] font-semibold">Branches Created</span>
        </div>

        <button
          onClick={() => openUserList("followers")}
          className="flex flex-col items-center group cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 flex items-center justify-center">
            <FaUser className="w-6 h-6 text-[#00B8AE]" />
          </div>
          <span className="font-semibold text-lg group-hover:text-[#00B8AE] transition-colors">
            {followersCount}
          </span>
          <span className="text-[14px] font-semibold group-hover:text-[#00B8AE] transition-colors underline-offset-2 group-hover:underline">
            Followers
          </span>
        </button>

        <button
          onClick={() => openUserList("following")}
          className="flex flex-col items-center group cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 flex items-center justify-center">
            <FaUser className="w-6 h-6 text-[#00B8AE]" />
          </div>
          <span className="font-semibold text-lg group-hover:text-[#00B8AE] transition-colors">
            {followingCount}
          </span>
          <span className="text-[14px] font-semibold group-hover:text-[#00B8AE] transition-colors underline-offset-2 group-hover:underline">
            Following
          </span>
        </button>

        <div className="flex flex-col items-center">
          <div className="w-10 h-10 flex items-center justify-center">
            <FaRegHeart className="w-6 h-6 text-[#00B8AE]" />
          </div>
          <span className="font-semibold text-lg">{profile?.totalLikes}</span>
          <span className="text-[14px] font-semibold">Total Likes</span>
        </div>
      </section>

      {/* ── Tabs + Content ───────────────────────────────────────────────────────── */}
      <section className="flex flex-row w-[1200px] justify-between gap-6 pb-10">
        <div className="flex flex-col gap-5 flex-1">
          {/* Tab Bar — bookmark tab hidden for public profiles */}
          <div className="w-full h-[62px] rounded-md bg-[#F0EEEE] items-center gap-2 flex flex-row px-[16px]">
            {availableTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 font-semibold rounded-md text-[18px] transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-white border border-[#00B8AE] text-black shadow-sm"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                {tab === "stories"
                  ? "Stories"
                  : tab === "branched"
                    ? "Branched Works"
                    : "Bookmark"}
              </button>
            ))}
          </div>

          {/* Stories Tab */}
          {activeTab === "stories" && (
            <div className="grid grid-cols-3 gap-5">
              {myStories.length === 0 ? (
                <p className="text-gray-400 col-span-3 text-center py-10">
                  No stories yet.
                </p>
              ) : (
                myStories.map((story) => (
                  <div
                    key={story._id}
                    className="flex flex-col gap-2 cursor-pointer group relative"
                  >
                    {/* Three-dot menu — own profile only */}
                    {isOwnProfile && (
                      <div className="absolute top-2 right-2 z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(
                              openMenuId === story._id ? null : story._id,
                            );
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
                        >
                          ⋮
                        </button>
                        {openMenuId === story._id && (
                          <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg border z-30">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/Users/EditStory?id=${story._id}`);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStory(story._id, story.disabled);
                                setOpenMenuId(null);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${story.disabled ? "text-green-600" : "text-yellow-600"}`}
                            >
                              {story.disabled ? "Enable" : "Disable"}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteStory(story._id);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="w-full aspect-[4/3] rounded-md overflow-hidden relative">
                      <img
                        src={
                          `${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${story.cover}` ||
                          "/file.svg"
                        }
                        alt={story.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {story.disabled && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-white">
                          <span className="font-bold text-lg">Disabled</span>
                          <span className="text-xs opacity-80">
                            Only visible to you
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-[2px] px-1">
                      <span className="font-bold text-[15px] leading-tight line-clamp-1">
                        {story.title}
                      </span>
                      <span className="text-[13px] text-gray-500">
                        By {story.author?.username || "Unknown"}
                      </span>
                      <div className="flex items-center gap-1 text-[13px] text-gray-500">
                        <svg
                          className="w-3.5 h-3.5 text-[#00B8AE]"
                          viewBox="0 0 28 28"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8.75001 17.5663C9.32037 16.9845 10.0011 16.5222 10.7523 16.2067C11.5036 15.8912 12.3102 15.7287 13.125 15.7288H16.625C17.6523 15.7292 18.647 15.368 19.4348 14.7086C20.2225 14.0491 20.7531 13.1335 20.9335 12.1221C20.1135 11.8937 19.4048 11.3743 18.9401 10.661C18.4754 9.94782 18.2866 9.08969 18.409 8.24729C18.5313 7.40489 18.9565 6.63596 19.6049 6.08443C20.2533 5.5329 21.0805 5.23658 21.9316 5.25093C22.7828 5.26529 23.5995 5.58933 24.2289 6.16242C24.8584 6.7355 25.2574 7.51833 25.3513 8.36438C25.4452 9.21042 25.2275 10.0617 24.739 10.7588C24.2506 11.456 23.5248 11.9512 22.6975 12.1518C22.5035 13.625 21.7805 14.9775 20.6634 15.9572C19.5462 16.9369 18.1109 17.4771 16.625 17.4771H13.125C12.0904 17.4768 11.0892 17.8432 10.2991 18.5112C9.50902 19.1792 8.98125 20.1056 8.80951 21.1258C9.62793 21.3525 10.336 21.869 10.8018 22.5791C11.2676 23.2891 11.4594 24.1444 11.3414 24.9853C11.2233 25.8263 10.8035 26.5957 10.1603 27.1501C9.51698 27.7045 8.69406 28.0061 7.84487 27.9987C6.99567 27.9913 6.17813 27.6755 5.5446 27.1099C4.91106 26.5444 4.50474 25.7678 4.40136 24.9249C4.29798 24.082 4.50459 23.2303 4.98269 22.5284C5.4608 21.8266 6.17777 21.3225 7.00001 21.1101V6.88959C6.17518 6.67662 5.45634 6.17014 4.97823 5.46509C4.50012 4.76003 4.29556 3.9048 4.4029 3.05972C4.51024 2.21463 4.92211 1.4377 5.5613 0.874561C6.2005 0.311421 7.02313 0.000732422 7.87501 0.000732422C8.72689 0.000732422 9.54952 0.311421 10.1887 0.874561C10.8279 1.4377 11.2398 2.21463 11.3471 3.05972C11.4545 3.9048 11.2499 4.76003 10.7718 5.46509C10.2937 6.17014 9.57483 6.67662 8.75001 6.88959V17.5663Z"
                            fill="#00B8AE"
                          />
                        </svg>
                        <span>{story.branchesCount} Branches</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Branched Works Tab */}
          {activeTab === "branched" && (
            <div className="grid grid-cols-3 gap-5">
              {myBranches.length === 0 ? (
                <div className="col-span-3 flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <p className="font-semibold text-gray-400 text-[16px]">
                    No branched works yet.
                  </p>
                  <p className="text-gray-300 text-[13px]">
                    Stories you branch will appear here.
                  </p>
                </div>
              ) : (
                myBranches.map((branch) => (
                  <div
                    key={branch._id}
                    className="flex flex-col gap-2 cursor-pointer group"
                  >
                    <div className="w-full aspect-[4/3] rounded-md overflow-hidden relative">
                      <img
                        src={
                          branch.story?.cover
                            ? `${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${branch.story.cover}`
                            : "/file.svg"
                        }
                        alt={branch.story?.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {branch.disabled && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-white">
                          <span className="font-bold text-lg">Disabled</span>
                          <span className="text-xs opacity-80">
                            Only visible to you
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-[2px] px-1">
                      <span className="font-bold text-[15px] leading-tight line-clamp-1">
                        {branch.chapterTitle || "Untitled Branch"}
                      </span>
                      {branch.branchTitle && (
                        <span className="text-[12px] text-[#00B8AE] font-medium">
                          &ldquo;{branch.branchTitle}&rdquo;
                        </span>
                      )}
                      <span className="text-[12px] text-gray-400 line-clamp-1">
                        From: {branch.story?.title || "Unknown Story"}
                      </span>
                      <span className="text-[13px] text-gray-500">
                        By {branch.story?.author?.username || "Unknown"}
                      </span>
                      <div className="flex items-center gap-3 text-[13px] text-gray-500 mt-1">
                        <span>❤️ {branch.likes}</span>
                        <span>👁️ {branch.views}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {branch.tags?.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="bg-[#F6F3FC] text-xs font-semibold px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Bookmark Tab — own profile only */}
          {activeTab === "bookmark" && isOwnProfile && (
            <div className="grid grid-cols-3 gap-5">
              {bookmarkedStories.length + bookmarkedChapters.length === 0 ? (
                <div className="col-span-3 flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <svg
                    className="w-12 h-12 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                    />
                  </svg>
                  <p className="font-semibold text-gray-400 text-[16px]">
                    No bookmarks yet.
                  </p>
                  <p className="text-gray-300 text-[13px]">
                    Stories and chapters you save will appear here.
                  </p>
                </div>
              ) : (
                <>
                  {bookmarkedChapters.map((chapter) => (
                    <div
                      key={chapter._id}
                      className="flex flex-col gap-2 cursor-pointer group rounded-md overflow-hidden border border-gray-200 bg-white relative"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnbookmark(chapter._id, "chapter");
                        }}
                        title="Remove bookmark"
                        className="absolute top-2 right-2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition-colors group/btn"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4 text-white group-hover/btn:text-red-400 transition-colors"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <div className="relative w-full aspect-[4/3] overflow-hidden">
                        <img
                          src={
                            chapter.story?.cover
                              ? `${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${chapter.story.cover}`
                              : "/file.svg"
                          }
                          alt={chapter.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-col gap-[2px] px-1 pb-2">
                        <span className="text-[11px] font-semibold text-[#00B8AE] uppercase tracking-wide">
                          Chapter
                        </span>
                        <span className="font-bold text-[15px] leading-tight line-clamp-1">
                          {chapter.title}
                        </span>
                        <span className="text-[12px] text-gray-400 font-medium">
                          From: {chapter.story?.title || "Unknown Story"}
                        </span>
                        <span className="text-[13px] text-gray-500">
                          By {chapter.story?.author?.username || "Unknown"}
                        </span>
                        {typeof chapter.chapterNumber !== "undefined" && (
                          <span className="text-[12px] text-gray-500">
                            Chapter {chapter.chapterNumber}
                          </span>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {chapter.story?.tags?.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="bg-[#F6F3FC] text-xs font-semibold px-2 py-0.5 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {bookmarkedStories.map((story) => (
                    <div
                      key={story._id}
                      className="flex flex-col gap-2 cursor-pointer group rounded-md overflow-hidden border border-gray-200 bg-white relative"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnbookmark(story._id, "story");
                        }}
                        title="Remove bookmark"
                        className="absolute top-2 right-2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition-colors group/btn"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4 text-red group-hover/btn:text-red-400 transition-colors"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <div className="w-full aspect-[4/3] overflow-hidden">
                        <img
                          src={
                            `${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${story.cover}` ||
                            "/file.svg"
                          }
                          alt={story.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-col gap-[2px] px-1 pb-2">
                        <span className="text-[11px] font-semibold text-[#00B8AE] uppercase tracking-wide">
                          Main
                        </span>
                        <span className="font-bold text-[15px] leading-tight line-clamp-1">
                          {story.title}
                        </span>
                        <span className="text-[12px] text-gray-400 font-medium">
                          From: Original Story
                        </span>
                        <span className="text-[13px] text-gray-500">
                          By {story.author?.username || "Unknown"}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {story.tags?.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="bg-[#F6F3FC] text-xs font-semibold px-2 py-0.5 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Achievements sidebar — shown for both own and public profiles */}
        <div className="border border-[#A7A3A3] rounded-md w-[323px] min-h-[373px] px-[31px] py-[21px] flex-shrink-0 self-start">
          {achievements.length === 0 ? (
            <p className="font-semibold text-[20px]">No achievements yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="font-semibold text-[20px] mb-1">Achievements</p>
              {achievements.map((a) => (
                <div
                  key={a.name}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-white border-gray-200"
                >
                  <div className="text-xl mt-0.5">🏆</div>
                  <div className="flex flex-col gap-0.5">
                    <p className="font-semibold text-[14px] text-gray-900">
                      {a.name}
                    </p>
                    <p className="text-[12px] text-gray-500">{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Edit Profile Modal — own profile only ───────────────────────────────── */}
      {isEditOpen && isOwnProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[400px] flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Edit Profile</h2>
            <div className="flex flex-col items-center gap-2">
              <img
                src={previewUrl || "/file.svg"}
                alt="preview"
                className="w-16 h-16 rounded-full object-cover"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-blue-500"
              >
                Change Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
            <input
              name="username"
              value={editForm.username}
              onChange={handleChange}
              placeholder="Username"
              className="border p-2 rounded"
            />
            <textarea
              name="description"
              value={editForm.description}
              onChange={handleChange}
              placeholder="Description"
              className="border p-2 rounded"
            />
            <input
              name="email"
              value={editForm.email}
              onChange={handleChange}
              placeholder="Email"
              className="border p-2 rounded"
            />
            <input
              name="facebook"
              value={editForm.facebook}
              onChange={handleChange}
              placeholder="Facebook"
              className="border p-2 rounded"
            />
            <input
              name="instagram"
              value={editForm.instagram}
              onChange={handleChange}
              placeholder="Instagram"
              className="border p-2 rounded"
            />
            {saveError && <p className="text-red-500">{saveError}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={closeEditModal}>Cancel</button>
              <button
                onClick={handleSave}
                className="bg-[#00B8AE] text-white px-4 py-2 rounded"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Followers / Following Modal ──────────────────────────────────────────── */}
      {userListModal.open && (
        <UserListModal
          title={userListModal.type === "followers" ? "Followers" : "Following"}
          users={userListModal.type === "followers" ? followers : following}
          onClose={() => setUserListModal((prev) => ({ ...prev, open: false }))}
        />
      )}
    </div>
  );
}
