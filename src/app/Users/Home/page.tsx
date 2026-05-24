"use client";
import { getPreferences } from "@/src/Services/authapi";
import { GetPopularThisWeek } from "@/src/Services/storyApi";
import { FaEye } from "react-icons/fa";
import { coverUrl } from "../../../../Utils/coverUrl";
import {
  GetAllStories,
  GetTrendingStories,
  GetPersonalizedStories,
  GetRecommendedStories,
  LikeStory,
} from "@/src/Services/storyApi";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import RecommendedStorycard from "@/src/component/RecommendedStorycard";
import Link from "next/link";
import {
  GetAllBookmarks,
  GetTopStories,
  GetTopWriters,
} from "@/src/Services/storyApi";

interface Author {
  _id: string;
  username: string;
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

interface BookmarkedStory {
  _id: string;
  title: string;
  cover: string;
  author: { username: string };
  branchesCount: number;
}

interface TopWriter {
  writer: string;
  totalScore: number;
  storiesCount: number;
  profilePicture: string | null;
}

export default function Home() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<string[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [trendingStories, setTrendingStories] = useState<Story[]>([]);
  const [currentTrendingIndex, setCurrentTrendingIndex] = useState(0);
  const [recommendedStories, setRecommendedStories] = useState<Story[]>([]);
  const [personalizedStories, setPersonalizedStories] = useState<Story[]>([]);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [popularStories, setPopularStories] = useState<Story[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(
    undefined,
  );
  const [bookmarkedStories, setBookmarkedStories] = useState<BookmarkedStory[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [topWriters, setTopWriters] = useState<TopWriter[]>([]);
  const [topStories, setTopStories] = useState<Story[]>([]);

  useEffect(() => {
    const id =
      localStorage.getItem("userId") ?? sessionStorage.getItem("userId");
    if (id) setCurrentUserId(id);
  }, []);

  useEffect(() => {
    const fetchAllStories = async () => {
      try {
        const data = await GetAllStories();
        setStories(data.stories);
      } catch (err) {
        console.error("Failed to fetch all stories", err);
      }
    };
    const fetchPopular = async () => {
      try {
        const data = await GetPopularThisWeek();
        setPopularStories(data.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch popular stories", err);
      }
    };
    const fetchBookmarks = async () => {
      try {
        const data = await GetAllBookmarks();
        setBookmarkedStories(data.stories || []);
      } catch (err) {
        console.error("Failed to fetch bookmarks", err);
      } finally {
        setLoading(false);
      }
    };
    const fetchTopWriters = async () => {
      try {
        const data = await GetTopWriters();
        setTopWriters(data);
      } catch (err) {
        console.error("Failed to fetch top writers", err);
      }
    };
    const fetchTopStories = async () => {
      try {
        const data = await GetTopStories();
        setTopStories(data);
      } catch (err) {
        console.error("Failed to fetch top stories", err);
      }
    };

    fetchTopWriters();
    fetchTopStories();
    fetchBookmarks();
    fetchPopular();
    fetchAllStories();
  }, []);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const data = await getPreferences();
        if (data?.preferences?.genres) {
          setPreferences(data.preferences.genres);
        }
      } catch (err) {
        console.error("Failed to fetch preferences", err);
      }
    };
    fetchPreferences();
  }, []);

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

  useEffect(() => {
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

  useEffect(() => {
    if (trendingStories.length === 0) return;
    const interval = setInterval(() => {
      setCurrentTrendingIndex((prev) => (prev + 1) % trendingStories.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [trendingStories]);

  const handleLikeStory = async (id: string) => {
    const res = await LikeStory(id);
    setStories((prev) =>
      prev.map((story) =>
        story._id === id ? { ...story, likes: res.likes } : story,
      ),
    );
  };

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || stories.length === 0) return;
    const interval = setInterval(() => {
      if (isHovered) return;
      const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
      if (Math.ceil(scroller.scrollLeft) >= maxScrollLeft) {
        scroller.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scroller.scrollBy({ left: scroller.clientWidth, behavior: "smooth" });
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [stories, isHovered]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }

        @keyframes orb-drift {
          from { transform: translate(0,0) scale(1); }
          to { transform: translate(25px,-25px) scale(1.05); }
        }
        @keyframes fade-up {
          from { opacity:0; transform:translateY(24px); }
          to { opacity:1; transform:translateY(0); }
        }
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .orb-1 { animation: orb-drift 14s ease-in-out infinite alternate; }
        .orb-2 { animation: orb-drift 14s ease-in-out infinite alternate; animation-delay:-5s; }
        .orb-3 { animation: orb-drift 14s ease-in-out infinite alternate; animation-delay:-9s; }
        .fade-up { animation: fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both; }
        .fade-up-delay-1 { animation: fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
        .fade-up-delay-2 { animation: fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.2s both; }

        .noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px;
        }

        .section-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          font-family: 'DM Sans', sans-serif;
        }

        .glass-card {
          background: rgba(255,255,255,0.03);
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          transition: all 0.25s ease;
        }
        .glass-card:hover {
          background: rgba(255,255,255,0.055);
          border-color: rgba(21,176,183,0.25);
          transform: translateY(-3px);
        }

        .gradient-btn {
          background: linear-gradient(130deg, #6c4ef2 0%, #15b0b7 100%);
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 14px;
          border: none;
          transition: all 0.2s;
          cursor: pointer;
        }
        .gradient-btn:hover { opacity: 0.88; transform: translateY(-1px); }

        .ghost-btn {
          background: rgba(255,255,255,0.05);
          border: 0.5px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.75);
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s;
          cursor: pointer;
        }
        .ghost-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(21,176,183,0.4);
          color: #fff;
        }

        .carousel-scroll {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          scrollbar-width: none;
          gap: 0;
        }
        .carousel-scroll::-webkit-scrollbar { display: none; }

        .trending-badge {
          background: linear-gradient(130deg, #6c4ef2, #15b0b7);
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .stat-box {
          background: rgba(255,255,255,0.03);
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 32px 24px;
          flex: 1;
          min-width: 100px;
          transition: all 0.2s;
        }
        .stat-box:hover {
          background: rgba(255,255,255,0.055);
          border-color: rgba(21,176,183,0.3);
        }
        .stat-box p:first-of-type {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          font-weight: 700;
          color: #fff;
        }
        .stat-box p:not(:first-of-type) {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          line-height: 1.3;
          text-align: center;
        }

        .community-scroll {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 8px;
          scrollbar-width: none;
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

        .skeleton-pulse {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s infinite;
          border-radius: 16px;
        }

        .tag-pill {
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          background: rgba(255,255,255,0.07);
          border: 0.5px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5);
        }

        .writer-row {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 10px 0;
          border-bottom: 0.5px solid rgba(255,255,255,0.06);
        }
        .writer-row:last-child { border-bottom: none; }
      `}</style>

      <div
        className="font-dm relative min-h-screen"
        style={{ background: "#0d0d12" }}
      >
        {/* ── Background Orbs ── */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div
            className="orb-1 absolute rounded-full"
            style={{
              width: 600,
              height: 600,
              background: "#6c4ef2",
              filter: "blur(100px)",
              opacity: 0.18,
              top: -160,
              right: -100,
            }}
          />
          <div
            className="orb-2 absolute rounded-full"
            style={{
              width: 420,
              height: 420,
              background: "#15b0b7",
              filter: "blur(90px)",
              opacity: 0.2,
              bottom: -100,
              left: -100,
            }}
          />
          <div
            className="orb-3 absolute rounded-full"
            style={{
              width: 300,
              height: 300,
              background: "#e5839a",
              filter: "blur(80px)",
              opacity: 0.1,
              top: "40%",
              left: "38%",
            }}
          />
        </div>
        <div className="noise fixed inset-0 z-[1] opacity-[0.03] pointer-events-none" />

        <div className="relative z-[2] pt-[90px] w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* ── Hero Section ── */}
          <div className="fade-up flex flex-col lg:flex-row justify-between items-center gap-10 py-10 lg:py-16">
            <div className="flex flex-col gap-8 lg:gap-10">
              <div className="flex flex-col gap-4">
                <span className="section-label">Welcome</span>
                <h1 className="font-playfair text-[42px] sm:text-[56px] lg:text-[68px] leading-tight tracking-tight font-bold text-white">
                  BranchVerse
                </h1>
                <p
                  className="w-full lg:w-[460px] text-[16px] sm:text-[18px] leading-relaxed"
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Continue your narrative journey, explore new worlds, and
                  connect with a vibrant community of storytellers.
                </p>
              </div>
              <div className="flex flex-row gap-4">
                <button
                  className="gradient-btn text-white w-[148px] h-11 rounded-xl"
                  onClick={() => router.push("/Users/StoryTitle")}
                >
                  Start a Story
                </button>
                <button
                  className="ghost-btn w-[167px] h-11 rounded-xl"
                  onClick={() => router.push("/Users/StoryExplorer")}
                >
                  Explore Stories
                </button>
              </div>
            </div>

            {/* Story Carousel */}
            <div
              className="fade-up-delay-1 w-full lg:w-[580px] overflow-hidden rounded-2xl"
              style={{ border: "0.5px solid rgba(255,255,255,0.08)" }}
            >
              <div
                ref={scrollerRef}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="carousel-scroll"
              >
                {stories.map((story) => {
                  const coverSrc = coverUrl(story.cover);
                  return (
                    <Link
                      key={story._id}
                      href={`/Users/StoryPreview?id=${story._id}`}
                      className="relative flex-shrink-0 w-full h-[260px] sm:h-[320px] overflow-hidden snap-center cursor-pointer group block"
                    >
                      <img
                        src={coverSrc}
                        alt={story.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(13,13,18,0.92) 0%, rgba(13,13,18,0.2) 55%, transparent 100%)",
                        }}
                      />
                      {story.branchAllowed && (
                        <div className="absolute top-3 left-3 trending-badge text-white px-3 py-1 rounded-full text-[10px]">
                          Branchable
                        </div>
                      )}
                      <div className="absolute bottom-5 left-5 z-10">
                        <p className="font-playfair text-white font-bold text-[20px] sm:text-[24px] line-clamp-2 max-w-[90%] leading-snug">
                          {story.title}
                        </p>
                        <p
                          className="text-xs mt-1.5"
                          style={{
                            color: "rgba(255,255,255,0.45)",
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          By {story.author.username} &bull; {story.views} views
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Recommended Stories ── */}
          <div className="fade-up-delay-2 mt-16 lg:mt-24">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="section-label">For You</span>
                <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white mt-1">
                  Recommended Stories
                </h2>
              </div>
              <span
                className="text-xs pb-1"
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {recommendedStories.length} picks
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommendedStories.map((story) => (
                <RecommendedStorycard
                  key={story._id}
                  story={story}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          </div>

          {/* ── Trending Now ── */}
          <div className="mt-16 lg:mt-24">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="section-label">Hot Right Now</span>
                <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white mt-1">
                  Trending Now
                </h2>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Trending Featured Card */}
              {trendingStories.length > 0 &&
                (() => {
                  const story = trendingStories[currentTrendingIndex];
                  return (
                    <div
                      key={story._id}
                      className="glass-card w-full lg:w-1/2 overflow-hidden"
                    >
                      <div className="relative w-full">
                        {story.branchAllowed && (
                          <span className="absolute top-3 left-3 trending-badge text-white px-3 py-1 rounded-full z-10 text-[10px]">
                            Branchable
                          </span>
                        )}
                        <img
                          src={coverUrl(story.cover)}
                          alt={story.title}
                          className="w-full h-[220px] sm:h-[260px] object-cover"
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(to top, rgba(13,13,18,0.85) 0%, transparent 60%)",
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-3 px-5 py-5">
                        <div>
                          <p className="font-playfair font-bold text-[22px] sm:text-[28px] text-white leading-snug">
                            {story.title}
                          </p>
                          <p
                            className="text-sm mt-1"
                            style={{
                              color: "rgba(255,255,255,0.4)",
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            By {story.author.username}
                          </p>
                        </div>
                        <p
                          className="text-sm line-clamp-2"
                          style={{
                            color: "rgba(255,255,255,0.35)",
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {story.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {story.tags.slice(0, 4).map((tag, idx) => (
                            <span key={idx} className="tag-pill">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <div
                          className="flex flex-row items-center gap-6 mt-2"
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600,
                            fontSize: 15,
                          }}
                        >
                          <div
                            className="flex gap-1.5 items-center"
                            style={{ color: "rgba(255,255,255,0.4)" }}
                          >
                            <FaEye size={14} />
                            <span>{story.views}</span>
                          </div>
                          <div
                            className="flex gap-1.5 items-center cursor-pointer"
                            style={{ color: "#f87171" }}
                            onClick={() => handleLikeStory(story._id)}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            <span>{story.likes}</span>
                          </div>
                          <div
                            className="flex gap-1.5 items-center"
                            style={{ color: "#15b0b7" }}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 16 16"
                              fill="none"
                            >
                              <path
                                d="M5 10.038C5.32593 9.70547 5.71491 9.44134 6.14419 9.26104C6.57347 9.08075 7.0344 8.98791 7.5 8.98798H9.5C10.0871 8.98818 10.6555 8.78178 11.1056 8.40495C11.5557 8.02813 11.8589 7.50491 11.962 6.92698C11.4934 6.79646 11.0885 6.49965 10.8229 6.09209C10.5574 5.68454 10.4495 5.19418 10.5194 4.71281C10.5893 4.23144 10.8323 3.79205 11.2028 3.47689C11.5733 3.16173 12.046 2.9924 12.5324 3.0006C13.0187 3.00881 13.4854 3.19397 13.8451 3.52145C14.2048 3.84892 14.4328 4.29626 14.4864 4.77971C14.5401 5.26317 14.4157 5.74961 14.1366 6.14798C13.8575 6.54635 13.4427 6.82934 12.97 6.94398C12.8591 7.78581 12.446 8.55862 11.8076 9.11846C11.1692 9.6783 10.3491 9.98697 9.5 9.98698H7.5C6.9088 9.98682 6.33666 10.1962 5.88519 10.5779C5.43373 10.9596 5.13215 11.489 5.034 12.072C5.50167 12.2015 5.9063 12.4966 6.17247 12.9024C6.43865 13.3082 6.54822 13.7968 6.48078 14.2774C6.41333 14.758 6.17346 15.1976 5.80586 15.5144C5.43827 15.8312 4.96803 16.0036 4.48278 15.9993C3.99753 15.9951 3.53036 15.8146 3.16834 15.4915C2.80632 15.1683 2.57414 14.7246 2.51506 14.2429C2.45599 13.7612 2.57405 13.2745 2.84725 12.8735C3.12045 12.4724 3.53015 12.1843 4 12.063V3.93698C3.52868 3.81528 3.11791 3.52587 2.8447 3.12298C2.5715 2.72009 2.45461 2.23139 2.51595 1.74848C2.57728 1.26557 2.81264 0.821613 3.17789 0.499819C3.54314 0.178025 4.01322 0.000488281 4.5 0.000488281C4.98679 0.000488281 5.45687 0.178025 5.82212 0.499819C6.18737 0.821613 6.42273 1.26557 6.48406 1.74848C6.5454 2.23139 6.42851 2.72009 6.15531 3.12298C5.8821 3.52587 5.47133 3.81528 5 3.93698V10.038Z"
                                fill="#15b0b7"
                              />
                            </svg>
                            <span>{story.branchesCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              {/* Popular This Week */}
              <div className="glass-card w-full lg:flex-1 px-5 py-6">
                <p className="font-playfair font-bold text-[22px] text-white mb-5">
                  Popular this Week
                </p>
                <div className="flex flex-col gap-4">
                  {popularStories.map((story) => (
                    <div
                      key={story._id}
                      className="flex flex-row items-center gap-4"
                    >
                      <img
                        src={coverUrl(story.cover)}
                        alt={story.title}
                        className="w-14 h-20 sm:w-16 sm:h-24 object-cover rounded-lg flex-shrink-0"
                        style={{ border: "0.5px solid rgba(255,255,255,0.1)" }}
                      />
                      <div className="flex flex-col gap-1">
                        <p
                          className="font-bold text-[15px] text-white"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {story.title}
                        </p>
                        <p
                          className="text-[13px]"
                          style={{
                            color: "rgba(255,255,255,0.4)",
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          by {story.author.username}
                        </p>
                        <div
                          className="flex flex-row flex-wrap gap-3 mt-0.5"
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          <span style={{ color: "#15b0b7" }}>
                            {story.branchesCount} Branches
                          </span>
                          <span style={{ color: "#f87171" }}>
                            {story.likes} Likes
                          </span>
                          <span style={{ color: "rgba(255,255,255,0.35)" }}>
                            {story.views} Views
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Bookmarks ── */}
          {!loading && bookmarkedStories.length > 0 && (
            <div className="mt-16 lg:mt-24">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <span className="section-label">Saved</span>
                  <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white mt-1">
                    Bookmarks
                  </h2>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {bookmarkedStories.map((story) => (
                  <div
                    key={story._id}
                    className="glass-card flex flex-col gap-0 cursor-pointer overflow-hidden"
                    onClick={() =>
                      router.push(`/Users/StoryPreview?id=${story._id}`)
                    }
                  >
                    <div className="w-full h-[180px] overflow-hidden relative">
                      <img
                        src={coverUrl(story.cover)}
                        alt={story.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(13,13,18,0.6) 0%, transparent 60%)",
                        }}
                      />
                    </div>
                    <div className="px-4 py-4 flex flex-col gap-1">
                      <p className="font-playfair font-bold text-[18px] sm:text-[20px] text-white line-clamp-1">
                        {story.title}
                      </p>
                      <p
                        className="text-sm"
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        By {story.author.username}
                      </p>
                      <div
                        className="flex flex-row gap-1 items-center mt-1"
                        style={{ color: "#15b0b7" }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M5 10.038C5.32593 9.70547 5.71491 9.44134 6.14419 9.26104C6.57347 9.08075 7.0344 8.98791 7.5 8.98798H9.5C10.0871 8.98818 10.6555 8.78178 11.1056 8.40495C11.5557 8.02813 11.8589 7.50491 11.962 6.92698C11.4934 6.79646 11.0885 6.49965 10.8229 6.09209C10.5574 5.68454 10.4495 5.19418 10.5194 4.71281C10.5893 4.23144 10.8323 3.79205 11.2028 3.47689C11.5733 3.16173 12.046 2.9924 12.5324 3.0006C13.0187 3.00881 13.4854 3.19397 13.8451 3.52145C14.2048 3.84892 14.4328 4.29626 14.4864 4.77971C14.5401 5.26317 14.4157 5.74961 14.1366 6.14798C13.8575 6.54635 13.4427 6.82934 12.97 6.94398C12.8591 7.78581 12.446 8.55862 11.8076 9.11846C11.1692 9.6783 10.3491 9.98697 9.5 9.98698H7.5C6.9088 9.98682 6.33666 10.1962 5.88519 10.5779C5.43373 10.9596 5.13215 11.489 5.034 12.072C5.50167 12.2015 5.9063 12.4966 6.17247 12.9024C6.43865 13.3082 6.54822 13.7968 6.48078 14.2774C6.41333 14.758 6.17346 15.1976 5.80586 15.5144C5.43827 15.8312 4.96803 16.0036 4.48278 15.9993C3.99753 15.9951 3.53036 15.8146 3.16834 15.4915C2.80632 15.1683 2.57414 14.7246 2.51506 14.2429C2.45599 13.7612 2.57405 13.2745 2.84725 12.8735C3.12045 12.4724 3.53015 12.1843 4 12.063V3.93698C3.52868 3.81528 3.11791 3.52587 2.8447 3.12298C2.5715 2.72009 2.45461 2.23139 2.51595 1.74848C2.57728 1.26557 2.81264 0.821613 3.17789 0.499819C3.54314 0.178025 4.01322 0.000488281 4.5 0.000488281C4.98679 0.000488281 5.45687 0.178025 5.82212 0.499819C6.18737 0.821613 6.42273 1.26557 6.48406 1.74848C6.5454 2.23139 6.42851 2.72009 6.15531 3.12298C5.8821 3.52587 5.47133 3.81528 5 3.93698V10.038Z"
                            fill="#15b0b7"
                          />
                        </svg>
                        <p
                          className="text-[13px] font-bold"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {story.branchesCount ?? 0} Branches
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Community Highlights ── */}
          <div className="mt-16 lg:mt-24 pb-16 lg:pb-24">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="section-label">Community</span>
                <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white mt-1">
                  Community Highlights
                </h2>
              </div>
            </div>
            <div className="flex flex-col xl:flex-row gap-8 xl:gap-12">
              {/* Stats Row */}
              <div className="flex flex-row flex-wrap sm:flex-nowrap gap-4 xl:flex-col xl:gap-4 w-full xl:w-[160px]">
                <div className="stat-box">
                  <svg width="28" height="28" viewBox="0 0 33 33" fill="none">
                    <path
                      d="M7.60925 17.2837C7.7783 17.2116 7.9601 17.1741 8.14389 17.1734C8.32768 17.1728 8.50975 17.209 8.67931 17.2799C8.84888 17.3508 9.00251 17.455 9.13112 17.5863C9.25974 17.7176 9.36072 17.8733 9.42811 18.0443C9.4955 18.2153 9.52792 18.3981 9.52346 18.5818C9.519 18.7656 9.47774 18.9465 9.40214 19.1141C9.32653 19.2816 9.21811 19.4323 9.08327 19.5572C8.94844 19.6821 8.78993 19.7787 8.61713 19.8413C7.6981 20.2036 6.90935 20.834 6.35343 21.6506C5.79751 22.4672 5.50015 23.4321 5.5 24.42V26.8125C5.5 27.1772 5.64487 27.5269 5.90273 27.7848C6.16059 28.0426 6.51033 28.1875 6.875 28.1875H17.875C18.2397 28.1875 18.5894 28.0426 18.8473 27.7848C19.1051 27.5269 19.25 27.1772 19.25 26.8125V24.5479C19.2498 23.5284 18.9399 22.533 18.3614 21.6935C17.7829 20.854 16.9631 20.21 16.0105 19.8468C15.8366 19.7864 15.6766 19.6918 15.54 19.5684C15.4034 19.4451 15.2929 19.2956 15.2151 19.1288C15.1373 18.962 15.0938 18.7813 15.0872 18.5973C15.0805 18.4134 15.1109 18.23 15.1765 18.058C15.242 17.886 15.3414 17.729 15.4688 17.5961C15.5962 17.4633 15.7489 17.3573 15.918 17.2846C16.0871 17.2119 16.2691 17.1739 16.4531 17.1728C16.6372 17.1717 16.8196 17.2075 16.9895 17.2782C18.4627 17.8398 19.7307 18.8356 20.6254 20.1338C21.5201 21.4319 21.9995 22.9712 22 24.5479V26.8125C22 27.9065 21.5654 28.9557 20.7918 29.7293C20.0182 30.5029 18.969 30.9375 17.875 30.9375H6.875C5.78098 30.9375 4.73177 30.5029 3.95818 29.7293C3.1846 28.9557 2.75 27.9065 2.75 26.8125L2.75 24.42C2.75038 22.8803 3.21402 21.3763 4.08063 20.1035C4.94725 18.8308 6.17675 17.8483 7.60925 17.2837ZM12.375 3.4375C13.8337 3.4375 15.2326 4.01696 16.2641 5.04841C17.2955 6.07986 17.875 7.47881 17.875 8.9375V11.6875C17.875 13.1462 17.2955 14.5451 16.2641 15.5766C15.2326 16.608 13.8337 17.1875 12.375 17.1875C10.9163 17.1875 9.51736 16.608 8.48591 15.5766C7.45446 14.5451 6.875 13.1462 6.875 11.6875V8.9375C6.875 7.47881 7.45446 6.07986 8.48591 5.04841C9.51736 4.01696 10.9163 3.4375 12.375 3.4375ZM12.375 6.1875C11.6457 6.1875 10.9462 6.47723 10.4305 6.99296C9.91473 7.50868 9.625 8.20815 9.625 8.9375V11.6875C9.625 12.4168 9.91473 13.1163 10.4305 13.632C10.9462 14.1478 11.6457 14.4375 12.375 14.4375C13.1043 14.4375 13.8038 14.1478 14.3195 13.632C14.8353 13.1163 15.125 12.4168 15.125 11.6875V8.9375C15.125 8.20815 14.8353 7.50868 14.3195 6.99296C13.8038 6.47723 13.1043 6.1875 12.375 6.1875Z"
                      fill="#15b0b7"
                    />
                  </svg>
                  <p>50K+</p>
                  <p>Engaged Members</p>
                </div>
                <div className="stat-box">
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                    <path
                      d="M9.76587 25.2307L11.4192 18.1467L5.92188 13.384L13.1632 12.7574L15.9992 6.07605L18.8352 12.7561L26.0752 13.3827L20.5779 18.1454L22.2325 25.2294L15.9992 21.4694L9.76587 25.2307Z"
                      fill="#15b0b7"
                    />
                  </svg>
                  <p>12K+</p>
                  <p>Stories Published</p>
                </div>
                <div className="stat-box">
                  <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                    <path
                      d="M8.75001 17.5665C9.32037 16.9846 10.0011 16.5223 10.7523 16.2068C11.5036 15.8913 12.3102 15.7288 13.125 15.729H16.625C17.6523 15.7293 18.647 15.3681 19.4348 14.7087C20.2225 14.0492 20.7531 13.1336 20.9335 12.1222C20.1135 11.8938 19.4048 11.3744 18.9401 10.6612C18.4754 9.94794 18.2866 9.08982 18.409 8.24742C18.5313 7.40501 18.9565 6.63608 19.6049 6.08455C20.2533 5.53302 21.0805 5.2367 21.9316 5.25106C22.7828 5.26541 23.5995 5.58946 24.2289 6.16254C24.8584 6.73562 25.2574 7.51845 25.3513 8.3645C25.4452 9.21055 25.2275 10.0618 24.739 10.759C24.2506 11.4561 23.5248 11.9513 22.6975 12.152C22.5035 13.6252 21.7805 14.9776 20.6634 15.9573C19.5462 16.937 18.1109 17.4772 16.625 17.4772H13.125C12.0904 17.4769 11.0892 17.8433 10.2991 18.5113C9.50902 19.1793 8.98125 20.1057 8.80951 21.126C9.62792 21.3526 10.336 21.8691 10.8018 22.5792C11.2676 23.2893 11.4594 24.1445 11.3414 24.9855C11.2233 25.8264 10.8035 26.5958 10.1603 27.1502C9.51698 27.7046 8.69406 28.0063 7.84487 27.9989C6.99567 27.9915 6.17813 27.6756 5.5446 27.1101C4.91106 26.5445 4.50474 25.768 4.40136 24.9251C4.29798 24.0821 4.50459 23.2304 4.98269 22.5285C5.4608 21.8267 6.17777 21.3226 7.00001 21.1102V6.88972C6.17518 6.67675 5.45634 6.17026 4.97823 5.46521C4.50012 4.76015 4.29556 3.90493 4.4029 3.05984C4.51024 2.21475 4.92211 1.43782 5.5613 0.874683C6.2005 0.311543 7.02313 0.000854492 7.87501 0.000854492C8.72688 0.000854492 9.54952 0.311543 10.1887 0.874683C10.8279 1.43782 11.2398 2.21475 11.3471 3.05984C11.4545 3.90493 11.2499 4.76015 10.7718 5.46521C10.2937 6.17026 9.57483 6.67675 8.75001 6.88972V17.5665Z"
                      fill="#15b0b7"
                    />
                  </svg>
                  <p>8K+</p>
                  <p>Story Branches</p>
                </div>
              </div>

              {/* Top Writers + Top Stories */}
              <div className="flex flex-col gap-4 flex-1">
                {/* Top Writers */}
                <div className="glass-card px-5 sm:px-8 py-6">
                  <p className="font-playfair text-[20px] sm:text-[22px] font-bold text-white mb-4">
                    Top Writers
                  </p>
                  <div className="flex flex-col w-full">
                    {topWriters.map((w, i) => (
                      <div key={i} className="writer-row">
                        <div className="flex flex-row gap-3 items-center">
                          {w.profilePicture ? (
                            <img
                              src={w.profilePicture}
                              alt={w.writer}
                              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                              style={{
                                background:
                                  "linear-gradient(130deg, #6c4ef2, #15b0b7)",
                              }}
                            >
                              {w.writer.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col gap-0.5">
                            <p
                              className="font-bold text-[14px] text-white"
                              style={{ fontFamily: "'DM Sans', sans-serif" }}
                            >
                              {w.writer}
                            </p>
                            <p
                              className="text-[12px]"
                              style={{
                                color: "rgba(255,255,255,0.35)",
                                fontFamily: "'DM Sans', sans-serif",
                              }}
                            >
                              {w.storiesCount}{" "}
                              {w.storiesCount === 1 ? "Story" : "Stories"}
                            </p>
                          </div>
                        </div>
                        <span
                          className="text-xs font-semibold px-2 py-1 rounded-full"
                          style={{
                            background: "rgba(21,176,183,0.12)",
                            color: "#15b0b7",
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          #{i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Stories */}
                <div className="glass-card px-5 sm:px-8 py-6">
                  <p className="font-playfair text-[20px] sm:text-[22px] font-bold text-white mb-4">
                    Top Stories
                  </p>
                  <div className="flex flex-col w-full">
                    {topStories.map((story) => (
                      <div
                        key={story._id}
                        className="writer-row gap-4 cursor-pointer"
                        onClick={() =>
                          router.push(`/Users/StoryPreview?id=${story._id}`)
                        }
                      >
                        <div className="flex flex-row gap-4 items-center">
                          <img
                            src={coverUrl(story.cover)}
                            alt={story.title}
                            className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
                            style={{
                              border: "0.5px solid rgba(255,255,255,0.1)",
                            }}
                          />
                          <div className="flex flex-col gap-0.5">
                            <p
                              className="font-bold text-[14px] text-white line-clamp-1"
                              style={{ fontFamily: "'DM Sans', sans-serif" }}
                            >
                              {story.title}
                            </p>
                            <p
                              className="text-[12px]"
                              style={{
                                color: "rgba(255,255,255,0.35)",
                                fontFamily: "'DM Sans', sans-serif",
                              }}
                            >
                              by {story.author.username}
                            </p>
                            <p
                              className="text-[12px] font-semibold"
                              style={{
                                color: "#15b0b7",
                                fontFamily: "'DM Sans', sans-serif",
                              }}
                            >
                              {story.branchesCount ?? 0} Branches
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
