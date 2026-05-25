"use client";

import { getPreferences } from "@/src/Services/authapi";
import StoryCard from "@/src/component/AllStoryCard";
import { coverUrl } from "../../../../Utils/coverUrl";
import {
  GetAllStories,
  GetTrendingStories,
  GetPersonalizedStories,
  GetRecommendedStories,
  GetFilteredStories,
  GetAllBookmarks,
} from "@/src/Services/storyApi";
import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
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
const STORIES_PER_PAGE = 9;

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

export default function StoryExplorer() {
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
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(
    undefined,
  );
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const [isFiltered, setIsFiltered] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";

  // ── Auth User ID ──
  useEffect(() => {
    const id =
      localStorage.getItem("userId") ?? sessionStorage.getItem("userId");
    if (id) setCurrentUserId(id);
  }, []);

  // ── Individual fetch functions ──
  const fetchAllStories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await GetAllStories();
      setStories(data.stories || []);
    } catch (err) {
      console.error("Failed to fetch all stories", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBookmarks = useCallback(async () => {
    try {
      const data = await GetAllBookmarks();
      setBookmarkedIds(new Set((data.stories || []).map((s: Story) => s._id)));
    } catch (err) {
      console.error("Failed to fetch bookmarks", err);
    }
  }, []);

  const fetchTrending = useCallback(async () => {
    try {
      const data = await GetTrendingStories();
      setTrendingStories(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch (err) {
      console.error("Failed to fetch trending stories", err);
    }
  }, []);

  // ── Initial load + poll every 15s + refetch on tab focus ──
  useEffect(() => {
    fetchAllStories();
    fetchTrending();
    fetchBookmarks();

    const refresh = () => {
      if (!isFiltered) fetchAllStories();
      fetchTrending();
    };

    const interval = setInterval(refresh, 15_000);
    window.addEventListener("focus", refresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [fetchAllStories, fetchTrending, isFiltered, fetchBookmarks]);

  // ── Preferences (runs once) ──
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

  // ── Preference-dependent fetches + poll ──
  useEffect(() => {
    if (preferences.length === 0) return;

    const fetchRecommended = async () => {
      try {
        const data = await GetRecommendedStories();
        setRecommendedStories(data.stories ?? []);
      } catch (err) {
        console.error("Failed to fetch recommended stories", err);
      }
    };

    const fetchPersonalized = async () => {
      try {
        const data = await GetPersonalizedStories();
        setPersonalizedStories(data ?? []);
      } catch (err) {
        console.error("Failed to fetch personalized stories", err);
      }
    };

    fetchRecommended();
    fetchPersonalized();

    const refresh = () => {
      fetchRecommended();
      fetchPersonalized();
    };

    const interval = setInterval(refresh, 15_000);
    window.addEventListener("focus", refresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [preferences]);

  // ── Trending carousel auto-rotate ──
  useEffect(() => {
    if (trendingStories.length === 0) return;
    const interval = setInterval(() => {
      setCurrentTrendingIndex((prev) => (prev + 1) % trendingStories.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [trendingStories]);

  // Reset to page 1 whenever search or stories change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, stories]);

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
      setStories(filtered || []);
      setIsFiltered(true);
      setCurrentPage(1);
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
    setIsFiltered(false);
    setCurrentPage(1);
    await fetchAllStories();
  };

  // ── Filtered + searched stories ──
  const visibleStories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stories;
    return stories.filter(
      (s) =>
        (s.title?.toLowerCase() ?? "").includes(q) ||
        (s.description?.toLowerCase() ?? "").includes(q) ||
        (s.tags ?? []).some((t) => t?.toLowerCase().includes(q)) ||
        (s.author?.username?.toLowerCase() ?? "").includes(q),
    );
  }, [stories, search]);

  // ── Pagination ──
  const totalPages = Math.ceil(visibleStories.length / STORIES_PER_PAGE);
  const paginatedStories = useMemo(() => {
    const start = (currentPage - 1) * STORIES_PER_PAGE;
    return visibleStories.slice(start, start + STORIES_PER_PAGE);
  }, [visibleStories, currentPage]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    document
      .getElementById("all-stories")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    } else {
      pages.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages,
      );
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }

        @keyframes orb-drift {
          from { transform: translate(0,0) scale(1); }
          to { transform: translate(25px,-25px) scale(1.05); }
        }
        @keyframes fade-up {
          from { opacity:0; transform:translateY(20px); }
          to { opacity:1; transform:translateY(0); }
        }

        .orb-1 { animation: orb-drift 14s ease-in-out infinite alternate; }
        .orb-2 { animation: orb-drift 14s ease-in-out infinite alternate; animation-delay:-5s; }
        .orb-3 { animation: orb-drift 14s ease-in-out infinite alternate; animation-delay:-9s; }
        .fade-up { animation: fade-up 0.55s cubic-bezier(0.22,1,0.36,1) both; }

        .noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px;
        }

        .dark-input {
          background: rgba(255,255,255,0.05);
          border: 0.5px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.88);
          border-radius: 12px;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .dark-input:focus {
          border-color: rgba(108,78,242,0.5);
          background: rgba(108,78,242,0.04);
        }
        .dark-input::placeholder { color: rgba(255,255,255,0.2); }

        .filter-tag {
          padding: 5px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          border: 0.5px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.5);
          font-family: 'DM Sans', sans-serif;
        }
        .filter-tag:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); }
        .filter-tag.active {
          background: rgba(108,78,242,0.25);
          border-color: rgba(108,78,242,0.5);
          color: #957bda;
        }

        .apply-btn {
          background: linear-gradient(130deg, #6c4ef2 0%, #15b0b7 100%);
          transition: all 0.2s;
        }
        .apply-btn:hover { opacity: 0.88; transform: translateY(-1px); }

        .section-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          font-family: 'DM Sans', sans-serif;
        }

        .trending-badge {
          background: linear-gradient(130deg, #6c4ef2, #15b0b7);
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .skeleton-pulse {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s infinite;
          border-radius: 16px;
        }
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── Community scroll: full-bleed with visible overflow ── */
        .community-scroll-wrapper {
          /* Negative margin breaks out of parent padding */
          margin-left: -1rem;
          margin-right: -1rem;
        }
        @media (min-width: 640px) {
          .community-scroll-wrapper {
            margin-left: -1.5rem;
            margin-right: -1.5rem;
          }
        }
        @media (min-width: 1024px) {
          .community-scroll-wrapper {
            margin-left: -2rem;
            margin-right: -2rem;
          }
        }

        .community-scroll {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 12px;
          /* Match parent padding so first card aligns with content */
          padding-left: 1rem;
          padding-right: 1rem;
          scrollbar-width: none;
        }
        @media (min-width: 640px) {
          .community-scroll {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
        }
        @media (min-width: 1024px) {
          .community-scroll {
            padding-left: 2rem;
            padding-right: 2rem;
          }
        }
        .community-scroll::-webkit-scrollbar { display: none; }

        .community-card {
          flex: 0 0 260px;
          background: rgba(255,255,255,0.03);
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.2s;
          cursor: pointer;
          text-decoration: none;
        }
        .community-card:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(21,176,183,0.3);
          transform: translateY(-3px);
        }

        /* ── Pagination ── */
        .page-btn {
          min-width: 36px;
          height: 36px;
          padding: 0 6px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.45);
          transition: all 0.15s;
          cursor: pointer;
        }
        .page-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.16);
          color: rgba(255,255,255,0.85);
        }
        .page-btn.active {
          background: linear-gradient(130deg, #6c4ef2, #15b0b7);
          border-color: transparent;
          color: white;
        }
        .page-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .page-ellipsis {
          min-width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          color: rgba(255,255,255,0.25);
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>

      <div
        className="font-dm relative min-h-screen"
        style={{ background: "#0d0d12" }}
      >
        {/* Orbs Background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div
            className="orb-1 absolute rounded-full"
            style={{
              width: 520,
              height: 520,
              background: "#6c4ef2",
              filter: "blur(90px)",
              opacity: 0.22,
              top: -120,
              right: -80,
            }}
          />
          <div
            className="orb-2 absolute rounded-full"
            style={{
              width: 380,
              height: 380,
              background: "#15b0b7",
              filter: "blur(90px)",
              opacity: 0.22,
              bottom: -80,
              left: -80,
            }}
          />
          <div
            className="orb-3 absolute rounded-full"
            style={{
              width: 260,
              height: 260,
              background: "#e5839a",
              filter: "blur(80px)",
              opacity: 0.12,
              top: "35%",
              left: "35%",
            }}
          />
        </div>
        <div className="noise fixed inset-0 z-[1] opacity-[0.03] pointer-events-none" />

        <div className="relative z-[2] pt-[20px] sm:pt-[30px] w-full">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* ── Header ── */}
            <div className="fade-up relative z-50 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between py-6 sm:py-10">
              <div>
                <span className="section-label">Discover</span>
                <h1 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2 leading-tight tracking-tight">
                  Story Explorer
                </h1>
                <p
                  className="text-sm mt-2"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Trending, recommended, and curated worlds to explore.
                  {search && (
                    <span
                      className="ml-2 font-medium"
                      style={{ color: "#15b0b7" }}
                    >
                      Results for &ldquo;{search}&rdquo;
                    </span>
                  )}
                </p>
              </div>

              {/* Tag Filters dropdown */}
              <div className="relative z-40 self-start sm:self-auto">
                <button
                  onClick={() => setShowFilter((p) => !p)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "0.5px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.7)",
                  }}
                  aria-expanded={showFilter}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 shrink-0"
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
                    <span
                      className="text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0"
                      style={{
                        background: "linear-gradient(130deg,#6c4ef2,#15b0b7)",
                      }}
                    >
                      {selectedTags.length}
                    </span>
                  )}
                </button>

                {showFilter && (
                  <div
                    className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-[360px] rounded-2xl p-5 z-50"
                    style={{
                      background: "rgba(20,18,30,0.97)",
                      border: "0.5px solid rgba(255,255,255,0.12)",
                      backdropFilter: "blur(16px)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-semibold text-white text-sm">
                        Filter by Tags
                      </p>
                      <button
                        onClick={clearFilters}
                        className="text-xs font-medium"
                        style={{ color: "#15b0b7" }}
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="flex gap-2 flex-wrap mb-4">
                      {presetTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`filter-tag ${selectedTags.includes(tag) ? "active" : ""}`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Custom tag…"
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        className="dark-input flex-1 h-10 px-3 text-sm min-w-0"
                      />
                      <button
                        onClick={handleFilter}
                        className="apply-btn text-white px-5 py-2 rounded-xl text-sm font-medium shrink-0"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Trending Carousel ── */}
            {trendingStories.length > 0 &&
              trendingStories[currentTrendingIndex] && (
                <div
                  className="fade-up relative rounded-2xl overflow-hidden"
                  style={{ border: "0.5px solid rgba(255,255,255,0.08)" }}
                >
                  <Link
                    href={`/Users/StoryPreview?id=${trendingStories[currentTrendingIndex]._id}`}
                    className="relative block h-[280px] xs:h-[320px] sm:h-[380px] md:h-[460px]"
                    aria-label={`Open ${trendingStories[currentTrendingIndex].title}`}
                  >
                    <img
                      src={coverUrl(
                        trendingStories[currentTrendingIndex].cover,
                      )}
                      alt={trendingStories[currentTrendingIndex].title}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(13,13,18,0.95) 0%, rgba(13,13,18,0.35) 55%, transparent 100%)",
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="trending-badge text-white px-3 py-1 rounded-full">
                        🔥 Trending
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                      <div className="max-w-2xl">
                        <p className="font-playfair text-white text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight line-clamp-2">
                          {trendingStories[currentTrendingIndex].title}
                        </p>
                        <p
                          className="text-sm mt-2"
                          style={{ color: "rgba(255,255,255,0.5)" }}
                        >
                          By{" "}
                          {
                            trendingStories[currentTrendingIndex].author
                              .username
                          }{" "}
                          &bull;{" "}
                          {timeAgo(
                            trendingStories[currentTrendingIndex].createdAt,
                          )}{" "}
                          &bull; {trendingStories[currentTrendingIndex].views}{" "}
                          views
                        </p>
                        <p
                          className="hidden sm:block text-sm mt-2 line-clamp-3"
                          style={{
                            color: "rgba(255,255,255,0.4)",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {trendingStories[currentTrendingIndex].description}
                        </p>
                      </div>
                    </div>
                  </Link>

                  <div className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentTrendingIndex(
                          (p) =>
                            (p - 1 + trendingStories.length) %
                            trendingStories.length,
                        );
                      }}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-lg font-bold transition-all hover:bg-white/20"
                      style={{
                        background: "rgba(255,255,255,0.12)",
                        border: "0.5px solid rgba(255,255,255,0.2)",
                      }}
                      aria-label="Previous"
                    >
                      &lsaquo;
                    </button>
                  </div>
                  <div className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentTrendingIndex(
                          (p) => (p + 1) % trendingStories.length,
                        );
                      }}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-lg font-bold transition-all hover:bg-white/20"
                      style={{
                        background: "rgba(255,255,255,0.12)",
                        border: "0.5px solid rgba(255,255,255,0.2)",
                      }}
                      aria-label="Next"
                    >
                      &rsaquo;
                    </button>
                  </div>

                  <div className="absolute bottom-4 right-6 flex gap-1.5 z-10">
                    {trendingStories.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentTrendingIndex(i)}
                        className="rounded-full transition-all"
                        style={{
                          width: i === currentTrendingIndex ? "20px" : "6px",
                          height: "6px",
                          background:
                            i === currentTrendingIndex
                              ? "#15b0b7"
                              : "rgba(255,255,255,0.3)",
                        }}
                        aria-label={`Show slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}

            {/* ── Community Highlights ── */}
            {recommendedStories.length > 0 && (
              <div className="mt-12 sm:mt-16">
                {/* Header stays inside the padded container */}
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className="section-label">Community Highlights</span>
                    <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white mt-1">
                      Loved by Readers
                    </h2>
                  </div>
                  <span
                    className="text-xs pb-1"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    {recommendedStories.length} picks
                  </span>
                </div>

                {/* Scroll wrapper bleeds outside the max-width container padding */}
                <div className="community-scroll-wrapper">
                  <div className="community-scroll">
                    {recommendedStories.map((story) => {
                      const src = story.cover
                        ? story.cover.startsWith("http")
                          ? story.cover
                          : `${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${story.cover}`
                        : undefined;
                      return (
                        <Link
                          key={story._id}
                          href={`/Users/StoryPreview?id=${story._id}`}
                          className="community-card"
                        >
                          <div className="relative h-[160px] w-full">
                            {src ? (
                              <img
                                src={src}
                                alt={story.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div
                                className="skeleton-pulse w-full h-full"
                                style={{ borderRadius: 0 }}
                              />
                            )}
                            <div
                              className="absolute inset-0"
                              style={{
                                background:
                                  "linear-gradient(to top, rgba(13,13,18,0.85) 0%, transparent 60%)",
                              }}
                            />
                            {story.branchAllowed && (
                              <div
                                className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-white text-[10px] font-semibold"
                                style={{
                                  background:
                                    "linear-gradient(130deg,#6c4ef2,#15b0b7)",
                                }}
                              >
                                Branchable
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <p className="font-playfair font-bold text-white text-sm line-clamp-2 leading-snug">
                              {story.title}
                            </p>
                            <p
                              className="text-xs mt-1"
                              style={{ color: "rgba(255,255,255,0.4)" }}
                            >
                              by {story.author.username}
                            </p>
                            <div
                              className="flex items-center gap-3 mt-2 text-xs"
                              style={{ color: "rgba(255,255,255,0.35)" }}
                            >
                              <span>👁 {story.views}</span>
                              <span>❤ {story.likes}</span>
                              <span>⎇ {story.branchesCount}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── All Stories Grid ── */}
            <div id="all-stories" className="mt-12 sm:mt-16 pb-12 sm:pb-16">
              <div className="flex items-end justify-between mb-6 sm:mb-8">
                <div>
                  <span className="section-label">Browse</span>
                  <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white mt-1">
                    All Stories
                  </h2>
                </div>
                <p
                  className="text-xs pb-1"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {visibleStories.length}{" "}
                  {visibleStories.length === 1 ? "story" : "stories"}
                  {isFiltered && (
                    <span style={{ color: "#15b0b7" }}> · filtered</span>
                  )}
                  {totalPages > 1 && (
                    <span>
                      {" "}
                      · page {currentPage}/{totalPages}
                    </span>
                  )}
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {Array.from({ length: STORIES_PER_PAGE }).map((_, i) => (
                    <div
                      key={i}
                      className="skeleton-pulse h-[300px] sm:h-[340px]"
                    />
                  ))}
                </div>
              ) : visibleStories.length === 0 ? (
                <div
                  className="rounded-2xl p-8 sm:p-12 text-center"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "0.5px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <p className="font-playfair text-xl text-white font-bold">
                    No stories found.
                  </p>
                  <p
                    className="text-sm mt-2"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    Try clearing filters or searching for something else.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {paginatedStories.map((story) => (
                      <div key={story._id} className="min-w-0">
                        <StoryCard
                          story={story}
                          currentUserId={currentUserId}
                          isBookmarked={bookmarkedIds.has(story._id)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* ── Pagination Controls ── */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1.5 mt-10 flex-wrap">
                      <button
                        className="page-btn"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label="Previous page"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>

                      {pageNumbers.map((page, i) =>
                        page === "..." ? (
                          <span key={`ellipsis-${i}`} className="page-ellipsis">
                            …
                          </span>
                        ) : (
                          <button
                            key={page}
                            className={`page-btn ${currentPage === page ? "active" : ""}`}
                            onClick={() => goToPage(page as number)}
                            aria-label={`Page ${page}`}
                            aria-current={
                              currentPage === page ? "page" : undefined
                            }
                          >
                            {page}
                          </button>
                        ),
                      )}

                      <button
                        className="page-btn"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        aria-label="Next page"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
