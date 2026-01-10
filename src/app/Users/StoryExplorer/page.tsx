"use client";
import { getPreferences } from "@/src/Services/authapi";
import {
  GetAllStories,
  GetTrendingStories,
  GetPersonalizedStories,
  GetRecommendedStories,
  GetFilteredStories,
} from "@/src/Services/storyApi";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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

// Preset tags for filtering
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
  const [recommendedStories, setRecommendedStories] = useState<Story[]>([]);
  const [personalizedStories, setPersonalizedStories] = useState<Story[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // -----------------------
  // Fetch all stories
  // -----------------------
  useEffect(() => {
    let mounted = true;
    const fetchAllStories = async () => {
      try {
        setLoading(true);
        const data = await GetAllStories();
        if (mounted) setStories(data);
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

  // -----------------------
  // Fetch user preferences
  // -----------------------
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const data = await getPreferences(token);
        if (data?.preferences?.genres) {
          setPreferences(data.preferences.genres);
        }
      } catch (err) {
        console.error("Failed to fetch preferences", err);
      }
    };
    fetchPreferences();
  }, []);

  // -----------------------
  // Fetch trending stories
  // -----------------------
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

  // -----------------------
  // Fetch recommended & personalized stories
  // -----------------------
  useEffect(() => {
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

    if (preferences.length > 0) {
      fetchRecommended();
      fetchPersonalized();
    }
  }, [preferences]);

  // -----------------------
  // Trending carousel
  // -----------------------
  useEffect(() => {
    if (trendingStories.length === 0) return;

    const interval = setInterval(() => {
      setCurrentTrendingIndex((prev) => (prev + 1) % trendingStories.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [trendingStories]);

  // -----------------------
  // Handle tag selection & filter
  // -----------------------
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleFilter = async () => {
    try {
      setLoading(true);
      const allTags = [...selectedTags];
      if (customTag.trim() !== "") allTags.push(customTag.trim());
      const filtered = await GetFilteredStories(allTags);
      setStories(filtered);
      setShowFilter(false); // close dropdown after applying
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
      setStories(data);
    } catch (err) {
      console.error("Failed to fetch all stories", err);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------
  // Derived visible stories (search)
  // -----------------------
  const visibleStories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stories;
    return stories.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)) ||
        s.author.username.toLowerCase().includes(q)
    );
  }, [stories, search]);

  return (
    <div className="pt-[90px] w-full bg-gray-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Story Explorer
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Discover trending, recommended and curated stories.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-[420px]">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, author or tag..."
                className="w-full pl-4 pr-10 py-3 rounded-lg border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00B8AE]"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowFilter((p) => !p)}
                className="flex gap-2 px-4 py-2 border rounded-lg shadow-sm bg-white hover:bg-gray-100 transition"
                aria-expanded={showFilter}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 13.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 019 17v-3.586L3.293 6.707A1 1 0 013 6V4z"
                  />
                </svg>
                Filters
              </button>

              {showFilter && (
                <div className="absolute right-0 mt-2 w-[360px] bg-white border rounded-xl shadow-xl p-4 z-40">
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
                      className="border p-2 rounded-lg flex-1"
                    />
                    <button
                      onClick={handleFilter}
                      className="bg-[#00B8AE] text-white px-4 py-2 rounded-lg hover:bg-[#009A94]"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trending */}
        {trendingStories.length > 0 && (
          <div className="mt-8 relative rounded-xl overflow-hidden shadow-md">
            <div className="relative h-[420px] sm:h-[360px] md:h-[420px]">
              <img
                src={`${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${trendingStories[currentTrendingIndex].cover}`}
                alt={trendingStories[currentTrendingIndex].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex flex-col justify-end">
                <div className="max-w-2xl">
                  <p className="text-white text-3xl font-bold tracking-wide">
                    {trendingStories[currentTrendingIndex].title}
                  </p>
                  <p className="text-gray-200 text-sm mt-1">
                    By {trendingStories[currentTrendingIndex].author.username} •{" "}
                    {timeAgo(trendingStories[currentTrendingIndex].createdAt)} •{" "}
                    {trendingStories[currentTrendingIndex].views} views
                  </p>
                  <p className="text-gray-200 mt-3 line-clamp-2">
                    {trendingStories[currentTrendingIndex].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <button
                onClick={() =>
                  setCurrentTrendingIndex(
                    (p) =>
                      (p - 1 + trendingStories.length) % trendingStories.length
                  )
                }
                className="bg-white/80 p-2 rounded-full hover:bg-white shadow"
                aria-label="Previous"
              >
                ‹
              </button>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <button
                onClick={() =>
                  setCurrentTrendingIndex(
                    (p) => (p + 1) % trendingStories.length
                  )
                }
                className="bg-white/80 p-2 rounded-full hover:bg-white shadow"
                aria-label="Next"
              >
                ›
              </button>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {trendingStories.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTrendingIndex(i)}
                  className={`w-3 h-3 rounded-full ${
                    i === currentTrendingIndex ? "bg-white" : "bg-white/50"
                  }`}
                  aria-label={`Show slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Stories */}
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">All Stories</h2>
            <p className="text-sm text-gray-500">
              Showing {visibleStories.length} stories
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white rounded-xl p-4 h-[320px] border"
                />
              ))}
            </div>
          ) : visibleStories.length === 0 ? (
            <div className="mt-6 bg-white rounded-xl p-8 border text-center">
              <p className="text-gray-700 font-medium">No stories found.</p>
              <p className="text-sm text-gray-500 mt-2">
                Try clearing filters or searching for something else.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {visibleStories.map((story) => (
                <Link
                  key={story._id}
                  href={`/story/${story._id}`}
                  className="bg-white border rounded-xl shadow-sm hover:shadow-lg transition cursor-pointer overflow-hidden flex flex-col"
                >
                  <div className="relative h-[200px]">
                    <img
                      src={`${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${story.cover}`}
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                    {story.branchAllowed && (
                      <div className="absolute top-3 left-3 bg-[#00B8AE] px-2 py-1 rounded text-white text-xs font-semibold">
                        Branchable
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                      {story.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      By {story.author.username} • {timeAgo(story.createdAt)}
                    </p>

                    <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                      {story.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 10l4.553-2.276A2 2 0 0122 9.618V16a2 2 0 01-2 2h-4"
                            />
                          </svg>
                          <span>{story.views}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          ❤️ <span>{story.likes}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-500">
                          {story.branchesCount} branches
                        </div>
                        <div className="flex gap-1">
                          {story.tags.slice(0, 3).map((t, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recommended / Personalized */}
        {personalizedStories.length > 0 && (
          <div className="w-full mt-[80px] py-12">
            <div className="px-0">
              <p className="font-bold text-[28px] text-gray-900 text-center mb-8">
                Recommended For You
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {personalizedStories.map((story) => (
                  <Link
                    key={story._id}
                    href={`/story/${story._id}`}
                    className="bg-white border rounded-xl shadow-md hover:shadow-lg p-3 transition flex flex-col"
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${story.cover}`}
                      className="w-full h-[220px] rounded-lg object-cover"
                    />

                    <div className="mt-3 flex-1 flex flex-col">
                      <p className="text-[20px] font-bold">{story.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        By {story.author.username}
                      </p>

                      <div className="mt-3 flex items-center gap-2 text-[#00B8AE] font-semibold">
                        <p>{story.branchesCount} Branches</p>
                        <p className="text-sm text-gray-500">
                          • {story.views} views
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
