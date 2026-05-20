"use client";
import { getPreferences } from "@/src/Services/authapi";
import StoryCard from "@/src/component/AllStoryCard";
import {
  GetAllStories,
  GetTrendingStories,
  GetPersonalizedStories,
  GetRecommendedStories,
  GetFilteredStories,
  LikeStory,
} from "@/src/Services/storyApi";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RecommendedStorycard from "@/src/component/RecommendedStorycard";
import { useSearchParams } from "next/navigation";

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
}

const presetTags = ["Fantasy", "Romance", "Adventure", "Horror", "Sci-Fi"];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const days = Math.floor(hr / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(months / 12)}y`;
}

export default function Home() {
  const [preferences, setPreferences] = useState<string[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [trendingStories, setTrendingStories] = useState<Story[]>([]);
  const [currentTrendingIndex, setCurrentTrendingIndex] = useState(0);
  const [, setRecommendedStories] = useState<Story[]>([]);
  const [personalizedStories, setPersonalizedStories] = useState<Story[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(
    undefined,
  );

  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";

  // Fetch all stories
  useEffect(() => {
    let mounted = true;
    const fetchAllStories = async () => {
      try {
        setLoading(true);
        const data = await GetAllStories();
        if (mounted) setStories(data.stories);
        const userId = data?.currentUserId;
        if (userId) setCurrentUserId(userId);
      } catch (err) {
        console.error("Failed to fetch all stories", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAllStories();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch user preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const data = await getPreferences();
        if (data?.preferences?.genres) setPreferences(data.preferences.genres);
      } catch (err) {
        console.error("Failed to fetch preferences", err);
      }
    };
    fetchPreferences();
  }, []);

  // Fetch trending stories
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await GetTrendingStories();
        setTrendingStories(data.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch trending stories", err);
      }
    };
    fetchTrending();
  }, []);

  // Fetch recommended & personalized stories
  useEffect(() => {
    if (preferences.length === 0) return;

    const fetchRecommended = async () => {
      try {
        const data = await GetRecommendedStories();
        setRecommendedStories(data);
      } catch (err) {
        console.error("Failed to fetch recommended stories", err);
      }
    };

    const fetchPersonalized = async () => {
      try {
        const data = await GetPersonalizedStories();
        setPersonalizedStories(data);
      } catch (err) {
        console.error("Failed to fetch personalized stories", err);
      }
    };

    fetchRecommended();
    fetchPersonalized();
  }, [preferences]);

  // Trending carousel auto-advance
  useEffect(() => {
    if (trendingStories.length === 0) return;
    const interval = setInterval(() => {
      setCurrentTrendingIndex((prev) => (prev + 1) % trendingStories.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [trendingStories]);

  // Tag filter handlers
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleFilter = async () => {
    try {
      setLoading(true);
      const allTags = [...selectedTags];
      if (customTag.trim()) allTags.push(customTag.trim());
      const filtered = await GetFilteredStories(allTags);
      setStories(filtered);
      setShowFilter(false);
    } catch (err) {
      console.error("Failed to fetch filtered stories", err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    setSelectedTags([]);
    setCustomTag("");
    setShowFilter(false);
    setLoading(true);
    try {
      const data = await GetAllStories();
      setStories(data.stories); // ← was: setStories(data)
    } catch (err) {
      console.error("Failed to fetch all stories", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter stories by search query from URL
  const visibleStories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stories;
    return stories.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)) ||
        s.author.username.toLowerCase().includes(q),
    );
  }, [stories, search]);

  const handleLikeStory = async (id: string) => {
    const res = await LikeStory(id);
    setStories((prev) =>
      prev.map((story) =>
        story._id === id ? { ...story, likes: res.likes } : story,
      ),
    );
  };

  return (
    <div className="pt-[70px] sm:pt-[90px] w-full bg-gray-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
              Story Explorer
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Discover trending, recommended and curated stories.
              {search && (
                <span className="ml-2 text-[#00B8AE] font-medium">
                  Results for &ldquo;{search}&rdquo;
                </span>
              )}
            </p>
          </div>

          {/* Filter button */}
          <div className="relative self-start sm:self-auto">
            <button
              onClick={() => setShowFilter((p) => !p)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg shadow-sm bg-white hover:bg-gray-100 transition text-sm"
              aria-expanded={showFilter}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 13.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 009 17v-3.586L3.293 6.707A1 1 0 013 6V4z"
                />
              </svg>
              <span>Filters</span>
              {selectedTags.length > 0 && (
                <span className="bg-[#00B8AE] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                  {selectedTags.length}
                </span>
              )}
            </button>

            {showFilter && (
              /* Dropdown: full-width on mobile, fixed width on larger screens */
              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-[360px] bg-white border rounded-xl shadow-xl p-4 z-40">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-gray-700">Tags</p>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-[#00B8AE] hover:underline"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex gap-2 flex-wrap mb-3">
                  {presetTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm border transition ${
                        selectedTags.includes(tag)
                          ? "bg-[#00B8AE] text-white border-[#00B8AE]"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom tag"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    className="border p-2 rounded-lg flex-1 text-sm min-w-0"
                  />
                  <button
                    onClick={handleFilter}
                    className="bg-[#00B8AE] text-white px-4 py-2 rounded-lg hover:bg-[#009A94] text-sm shrink-0"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Trending Carousel ── */}
        {trendingStories.length > 0 && (
          <div className="mt-4 sm:mt-6 relative rounded-xl overflow-hidden shadow-md">
            <Link
              href={`/Users/StoryPreview?id=${trendingStories[currentTrendingIndex]._id}`}
              /* Taller on mobile so text is readable; shorter on larger screens */
              className="relative block h-[280px] xs:h-[320px] sm:h-[360px] md:h-[420px]"
              aria-label={`Open ${trendingStories[currentTrendingIndex].title}`}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${trendingStories[currentTrendingIndex].cover}`}
                alt={trendingStories[currentTrendingIndex].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 sm:p-6 flex flex-col justify-end">
                <div className="max-w-2xl">
                  <p className="text-white text-xl sm:text-2xl md:text-3xl font-bold tracking-wide line-clamp-2">
                    {trendingStories[currentTrendingIndex].title}
                  </p>
                  <p className="text-gray-300 text-xs sm:text-sm mt-1">
                    By {trendingStories[currentTrendingIndex].author.username} •{" "}
                    {timeAgo(trendingStories[currentTrendingIndex].createdAt)} •{" "}
                    {trendingStories[currentTrendingIndex].views} views
                  </p>
                  <p className="hidden sm:line-clamp-4 text-gray-200 text-sm mt-2">
                    {trendingStories[currentTrendingIndex].description}
                  </p>
                </div>
              </div>
            </Link>

            {/* Prev button */}
            <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2">
              <button
                onClick={() =>
                  setCurrentTrendingIndex(
                    (p) =>
                      (p - 1 + trendingStories.length) % trendingStories.length,
                  )
                }
                className="bg-white/80 p-1.5 sm:p-2 rounded-full hover:bg-white shadow text-lg sm:text-xl leading-none"
                aria-label="Previous"
              >
                ‹
              </button>
            </div>

            {/* Next button */}
            <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2">
              <button
                onClick={() =>
                  setCurrentTrendingIndex(
                    (p) => (p + 1) % trendingStories.length,
                  )
                }
                className="bg-white/80 p-1.5 sm:p-2 rounded-full hover:bg-white shadow text-lg sm:text-xl leading-none"
                aria-label="Next"
              >
                ›
              </button>
            </div>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
              {trendingStories.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTrendingIndex(i)}
                  className={`rounded-full transition-all ${
                    i === currentTrendingIndex
                      ? "bg-white w-4 h-2.5 sm:w-5 sm:h-3"
                      : "bg-white/50 w-2.5 h-2.5 sm:w-3 sm:h-3"
                  }`}
                  aria-label={`Show slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── All Stories ── */}
        <div className="mt-8 sm:mt-10">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              All Stories
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Showing {visibleStories.length}{" "}
              {visibleStories.length === 1 ? "story" : "stories"}
            </p>
          </div>

          {loading ? (
            /* Skeleton grid — 1 col on mobile, 2 on sm, 3 on lg */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white rounded-xl p-4 h-[280px] sm:h-[320px] border"
                />
              ))}
            </div>
          ) : visibleStories.length === 0 ? (
            <div className="bg-white rounded-xl p-6 sm:p-8 border text-center">
              <p className="text-gray-700 font-medium">No stories found.</p>
              <p className="text-sm text-gray-500 mt-2">
                Try clearing filters or searching for something else.
              </p>
            </div>
          ) : (
            /* Story cards grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {visibleStories.map((story) => (
                <div key={story._id} className="min-w-0">
                  <StoryCard
                    story={story}
                    currentUserId={currentUserId}
                    handleLikeStory={handleLikeStory}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Recommended / Personalized ── */}
        {personalizedStories.length > 0 && (
          <div className="w-full mt-12 sm:mt-16 lg:mt-20 pb-12 sm:pb-16">
            <p className="font-bold text-xl sm:text-2xl lg:text-[28px] text-gray-900 text-center mb-6 sm:mb-8">
              Recommended For You
            </p>
            {/* Recommended cards grid — same breakpoints as All Stories for consistency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {personalizedStories.map((story) => (
                <div key={story._id} className="min-w-0">
                  <RecommendedStorycard
                    story={story}
                    handleLikeStory={handleLikeStory}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
