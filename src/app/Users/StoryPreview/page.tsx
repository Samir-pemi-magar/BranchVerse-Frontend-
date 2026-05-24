"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getSingleStory,
  GetMainChapters,
  GetPersonalizedStories,
} from "@/src/Services/storyApi";
import { getPreferences } from "@/src/Services/authapi";
import { MdDateRange } from "react-icons/md";
import { FaEye, FaFlag } from "react-icons/fa";
import { FcLike } from "react-icons/fc";
import Link from "next/link";
import { useForm } from "react-hook-form";
import axiosInstance from "@/src/Services/axiosinstance";
import { useRouter } from "next/navigation";
import { GetChaptersHierarchy } from "@/src/Services/storyApi";
import ReportModal from "../../../component/Reportmodal";

interface Author {
  _id: string;
  username: string;
}

export interface Story {
  _id: string;
  title: string;
  tags: string[];
  description: string;
  cover: string;
  author: Author;
  views: number;
  likes: number;
  branchAllowed: boolean;
  branchesCount: number;
  createdAt: string;
  __v: number;
  branchedFrom?: string;
}

export interface Chapter {
  length: number;
  _id: string;
  title: string;
  chapterNumber: number;
  likes: number;
}

export interface BranchChapter extends Chapter {
  branchTitle?: string;
}

interface ChapterNode extends Chapter {
  branches?: ChapterNode[];
}

interface RenderBranchesProps {
  branches: ChapterNode[];
  storyId: string;
}

export default function StoryPreview() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const storyId = searchParams?.get("id") ?? "";
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tags, settags] = useState<string[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [likes, setLikes] = useState(0);
  const [personalizedStories, setPersonalizedStories] = useState<Story[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const onSubmit = (data: FormData) => {
    console.log(data);
  };
  const [chapterHierarchy, setChapterHierarchy] = useState<ChapterNode[]>([]);

  const coverSrc = story?.cover
    ? story.cover.startsWith("http")
      ? story.cover
      : `${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${story.cover}`
    : undefined;

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const data = await getPreferences();
        if (data?.preferences?.genres) setPreferences(data.preferences.genres);
      } catch (err) {
        console.error("Failed to fetch preferences", err);
      }
    };
    fetchPreferences();
  }, []);

  useEffect(() => {
    if (!storyId) {
      setError("No story id provided");
      setStory(null);
      return;
    }
    const fetchSingleStory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSingleStory(storyId);
        setStory(data);
        settags(data.tags);
      } catch (err) {
        console.error("Failed to fetch story", err);
        setError("Failed to load story");
        setStory(null);
      } finally {
        setLoading(false);
      }
    };
    const getMainChapters = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await GetMainChapters(storyId);
        setChapters(data);
      } catch (err) {
        console.error("Failed to fetch Chapters", err);
        setError("Failed to load Chapters");
        setStory(null);
      } finally {
        setLoading(false);
      }
    };
    const fetchHierarchy = async () => {
      if (!storyId) return;
      try {
        const data = await GetChaptersHierarchy(storyId);
        setChapterHierarchy(data);
      } catch (err) {
        console.error("Failed to fetch chapter hierarchy", err);
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
    fetchHierarchy();
    fetchSingleStory();
    getMainChapters();
    if (preferences.length > 0) fetchPersonalized();
  }, [storyId, preferences]);

  useEffect(() => {
    if (chapters.length > 0) setLikes(chapters[0].likes ?? 0);
  }, [chapters]);

  const handleLikeStory = async () => {
    if (!chapters || chapters.length === 0) return;
    const firstChapterId = chapters[0]._id;
    try {
      const res = await axiosInstance.post(
        `/api/chapters/${firstChapterId}/like`,
      );
      setLikes(res.data.likes);
    } catch (err) {
      console.error("Failed to like chapter", err);
    }
  };

  const handleBranchStory = () => {
    if (chapters.length === 0) return;
    const firstChapter = chapters[0];
    router.push(
      `/Users/Storycreate?storyId=${storyId}&parentChapterId=${firstChapter._id}`,
    );
  };

  const BranchSVG = ({ fill = "#15b0b7" }: { fill?: string }) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0"
    >
      <path
        d="M5 10.038C5.32593 9.70547 5.71491 9.44134 6.14419 9.26104C6.57347 9.08075 7.0344 8.98791 7.5 8.98798H9.5C10.0871 8.98818 10.6555 8.78178 11.1056 8.40495C11.5557 8.02813 11.8589 7.50491 11.962 6.92698C11.4934 6.79646 11.0885 6.49965 10.8229 6.09209C10.5574 5.68454 10.4495 5.19418 10.5194 4.71281C10.5893 4.23144 10.8323 3.79205 11.2028 3.47689C11.5733 3.16173 12.046 2.9924 12.5324 3.0006C13.0187 3.00881 13.4854 3.19397 13.8451 3.52145C14.2048 3.84892 14.4328 4.29626 14.4864 4.77971C14.5401 5.26317 14.4157 5.74961 14.1366 6.14798C13.8575 6.54635 13.4427 6.82934 12.97 6.94398C12.8591 7.78581 12.446 8.55862 11.8076 9.11846C11.1692 9.6783 10.3491 9.98697 9.5 9.98698H7.5C6.9088 9.98682 6.33666 10.1962 5.88519 10.5779C5.43373 10.9596 5.13215 11.489 5.034 12.072C5.50167 12.2015 5.9063 12.4966 6.17247 12.9024C6.43865 13.3082 6.54822 13.7968 6.48078 14.2774C6.41333 14.758 6.17346 15.1976 5.80586 15.5144C5.43827 15.8312 4.96803 16.0036 4.48278 15.9993C3.99753 15.9951 3.53036 15.8146 3.16834 15.4915C2.80632 15.1683 2.57414 14.7246 2.51506 14.2429C2.45599 13.7612 2.57405 13.2745 2.84725 12.8735C3.12045 12.4724 3.53015 12.1843 4 12.063V3.93698C3.52868 3.81528 3.11791 3.52587 2.8447 3.12298C2.5715 2.72009 2.45461 2.23139 2.51595 1.74848C2.57728 1.26557 2.81264 0.821613 3.17789 0.499819C3.54314 0.178025 4.01322 0.000488281 4.5 0.000488281C4.98679 0.000488281 5.45687 0.178025 5.82212 0.499819C6.18737 0.821613 6.42273 1.26557 6.48406 1.74848C6.5454 2.23139 6.42851 2.72009 6.15531 3.12298C5.8821 3.52587 5.47133 3.81528 5 3.93698V10.038Z"
        fill={fill}
      />
    </svg>
  );

  const RenderBranches: React.FC<RenderBranchesProps> = ({
    branches,
    storyId,
  }) => (
    <ul
      className="mt-2 ml-3 sm:ml-4 pl-3 sm:pl-4 space-y-2"
      style={{ borderLeft: "1.5px solid rgba(21,176,183,0.25)" }}
    >
      {branches.map((b: ChapterNode) => (
        <li key={b._id}>
          <Link
            href={`/Users/StoryReader?storyId=${storyId}&chapterId=${b._id}`}
            className="text-sm flex items-center gap-2 group transition-colors"
            style={{
              color: "rgba(255,255,255,0.45)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: "#6c4ef2" }}
            />
            <span className="font-medium group-hover:text-white transition-colors">
              {b.title}
            </span>
          </Link>
          {b.branches && b.branches.length > 0 && (
            <RenderBranches branches={b.branches} storyId={storyId} />
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }

        @keyframes orb-drift {
          from { transform: translate(0,0) scale(1); }
          to { transform: translate(20px,-20px) scale(1.05); }
        }
        @keyframes fade-up {
          from { opacity:0; transform:translateY(20px); }
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
          border-radius: 16px;
        }

        .gradient-btn {
          background: linear-gradient(130deg, #6c4ef2 0%, #15b0b7 100%);
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          border: none;
          transition: all 0.2s;
          cursor: pointer;
          color: white;
        }
        .gradient-btn:hover { opacity: 0.88; transform: translateY(-1px); }

        .ghost-btn {
          background: rgba(255,255,255,0.05);
          border: 0.5px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.75);
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          transition: all 0.2s;
          cursor: pointer;
        }
        .ghost-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(21,176,183,0.4); color: #fff; }

        .danger-btn {
          background: rgba(239,68,68,0.08);
          border: 0.5px solid rgba(239,68,68,0.3);
          color: #f87171;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          transition: all 0.2s;
          cursor: pointer;
        }
        .danger-btn:hover { background: rgba(239,68,68,0.18); border-color: rgba(239,68,68,0.5); }

        .tag-pill {
          padding: 5px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          background: rgba(255,255,255,0.06);
          border: 0.5px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5);
          transition: all 0.15s;
          cursor: pointer;
        }
        .tag-pill:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.85); }

        .trending-badge {
          background: linear-gradient(130deg, #6c4ef2, #15b0b7);
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
        }

        .skeleton-pulse {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s infinite;
          border-radius: 12px;
        }

        .chapter-row {
          background: rgba(255,255,255,0.025);
          border: 0.5px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 14px 18px;
          transition: all 0.2s;
        }
        .chapter-row:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(21,176,183,0.3);
        }

        .more-card {
          background: rgba(255,255,255,0.03);
          border: 0.5px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          overflow: hidden;
          transition: all 0.2s;
          text-decoration: none;
          display: flex;
          flex-direction: column;
        }
        .more-card:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(21,176,183,0.3);
          transform: translateY(-3px);
        }
      `}</style>

      <div
        className="font-dm relative min-h-screen"
        style={{ background: "#0d0d12" }}
      >
        {/* Orbs */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div
            className="orb-1 absolute rounded-full"
            style={{
              width: 500,
              height: 500,
              background: "#6c4ef2",
              filter: "blur(100px)",
              opacity: 0.16,
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
              opacity: 0.16,
              bottom: -80,
              left: -80,
            }}
          />
          <div
            className="orb-3 absolute rounded-full"
            style={{
              width: 240,
              height: 240,
              background: "#e5839a",
              filter: "blur(80px)",
              opacity: 0.1,
              top: "40%",
              left: "36%",
            }}
          />
        </div>
        <div className="noise fixed inset-0 z-[1] opacity-[0.03] pointer-events-none" />

        <div className="relative z-[2] pt-[70px] sm:pt-[90px] w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-20 flex flex-col gap-12 sm:gap-16">
          {error && (
            <div
              className="text-red-400 text-center py-4 glass-card px-6"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {error}
            </div>
          )}

          {/* ── Hero ── */}
          <section className="fade-up flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-16 pt-6 sm:pt-10">
            {/* Cover */}
            <div className="w-full md:w-[260px] lg:w-[320px] xl:w-[380px] shrink-0">
              {loading || !coverSrc ? (
                <div className="skeleton-pulse w-full h-[260px] sm:h-[340px] md:h-[380px]" />
              ) : (
                <div
                  className="relative w-full h-[260px] sm:h-[340px] md:h-[380px] rounded-2xl overflow-hidden"
                  style={{ border: "0.5px solid rgba(255,255,255,0.1)" }}
                >
                  <img
                    src={coverSrc}
                    alt={story?.title ?? "cover"}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(13,13,18,0.5) 0%, transparent 60%)",
                    }}
                  />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-5 flex-1 min-w-0">
              <div>
                <span className="section-label">Story</span>
                <h1 className="font-playfair font-bold text-[28px] sm:text-[38px] lg:text-[46px] leading-tight text-white mt-1 break-words">
                  {story?.title || "Untitled"}
                </h1>
                <p
                  className="mt-2 text-sm font-semibold cursor-pointer hover:underline transition-colors"
                  style={{
                    color: "#15b0b7",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onClick={() => {
                    if (story?.author?._id)
                      router.push(`/Users/Profile?id=${story.author._id}`);
                  }}
                >
                  {story?.author?.username || "Unknown"}
                </p>
              </div>

              {/* Origin Badge */}
              <span className="inline-flex items-center self-start px-4 py-1.5 rounded-full text-white text-xs font-semibold trending-badge">
                {story?.branchedFrom
                  ? `Branched from ${story.branchedFrom}`
                  : "Origin Story"}
              </span>

              {/* Stats */}
              <div
                className="flex flex-wrap gap-4 sm:gap-6"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <button
                  className="flex items-center gap-1.5 transition-transform hover:scale-110"
                  onClick={handleLikeStory}
                  style={{ color: "#f87171" }}
                >
                  <FcLike />
                  <span>{likes}</span>
                </button>
                <div
                  className="flex items-center gap-1.5"
                  style={{ color: "#15b0b7" }}
                >
                  <BranchSVG />
                  <span>{story?.branchesCount}</span>
                </div>
                <div
                  className="flex items-center gap-1.5"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  <FaEye />
                  <span>{story?.views}</span>
                </div>
                <div
                  className="flex items-center gap-1.5"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  <MdDateRange />
                  <span className="truncate max-w-[140px] sm:max-w-none text-xs">
                    {story?.createdAt}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-row flex-wrap gap-3 mt-1">
                {story && chapters && chapters.length > 0 && (
                  <Link
                    href={`/Users/StoryReader?storyId=${storyId}&chapterId=${chapters[0]._id}`}
                    className="gradient-btn h-11 px-6 rounded-xl flex items-center text-sm font-semibold"
                  >
                    Start Reading
                  </Link>
                )}
                <button
                  className="ghost-btn h-11 px-6 rounded-xl text-sm"
                  onClick={handleBranchStory}
                >
                  Branch This Story
                </button>
                <button
                  className="danger-btn h-11 px-4 rounded-xl text-sm flex items-center gap-2"
                  onClick={() => setShowReportModal(true)}
                >
                  <FaFlag className="text-xs" />
                  Report
                </button>
              </div>
            </div>
          </section>

          {/* ── Description ── */}
          <section className="flex flex-col gap-4">
            <span className="section-label">Preview</span>
            <div className="glass-card px-6 py-5">
              <p
                className="text-[15px] sm:text-[17px] leading-relaxed break-words"
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {story?.description}
              </p>
            </div>
          </section>

          {/* ── Tags ── */}
          <section className="flex flex-col gap-4">
            <span className="section-label">Tags</span>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="tag-pill">
                  #{tag}
                </span>
              ))}
            </div>
          </section>

          {/* ── Branch Lineage ── */}
          <section className="flex flex-col gap-4">
            <span className="section-label">Branch Lineage</span>
            <div className="glass-card px-6 py-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(21,176,183,0.12)",
                    border: "0.5px solid rgba(21,176,183,0.25)",
                  }}
                >
                  <BranchSVG />
                </div>
                <div
                  style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}
                >
                  <span style={{ color: "rgba(255,255,255,0.35)" }}>
                    Branched from:{" "}
                  </span>
                  <span className="font-semibold" style={{ color: "#15b0b7" }}>
                    {story?.branchedFrom || "Origin"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(108,78,242,0.12)",
                    border: "0.5px solid rgba(108,78,242,0.25)",
                  }}
                >
                  <BranchSVG fill="#6c4ef2" />
                </div>
                <div
                  style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}
                >
                  <span style={{ color: "rgba(255,255,255,0.35)" }}>
                    Branches:{" "}
                  </span>
                  <span className="font-semibold" style={{ color: "#6c4ef2" }}>
                    {story?.branchesCount || 0}
                  </span>
                </div>
              </div>

              <p
                className="text-xs mt-2 pt-4"
                style={{
                  borderTop: "0.5px solid rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.25)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Explore the different paths this story can take, or create your
                own branch!
              </p>

              {/* Chapter Hierarchy */}
              {chapterHierarchy.length > 0 && (
                <div className="flex flex-col gap-3 mt-2">
                  {chapterHierarchy.map((chapter) => (
                    <div key={chapter._id} className="chapter-row">
                      <Link
                        href={`/Users/StoryReader?storyId=${storyId}&chapterId=${chapter._id}`}
                        className="flex items-center justify-between"
                      >
                        <span
                          className="font-semibold text-sm sm:text-base"
                          style={{
                            color: "#15b0b7",
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          Chapter {chapter.chapterNumber}: {chapter.title}
                        </span>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          style={{ color: "rgba(255,255,255,0.3)" }}
                        >
                          <path
                            d="M6 3l5 5-5 5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Link>
                      {chapter.branches && chapter.branches.length > 0 && (
                        <RenderBranches
                          branches={chapter.branches}
                          storyId={storyId}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── More From BranchVerse ── */}
          {personalizedStories.length > 0 && (
            <section className="flex flex-col gap-6">
              <div>
                <span className="section-label">Discover</span>
                <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white mt-1">
                  More From BranchVerse
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {personalizedStories.map((s) => {
                  const storyCoverSrc = s.cover
                    ? s.cover.startsWith("http")
                      ? s.cover
                      : `${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${s.cover}`
                    : undefined;
                  return (
                    <Link
                      key={s._id}
                      href={`/Users/StoryPreview?id=${s._id}`}
                      className="more-card"
                    >
                      <div className="relative h-[180px] sm:h-[200px]">
                        {storyCoverSrc ? (
                          <img
                            src={storyCoverSrc}
                            className="w-full h-full object-cover"
                            alt={s.title}
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
                              "linear-gradient(to top, rgba(13,13,18,0.8) 0%, transparent 55%)",
                          }}
                        />
                      </div>
                      <div className="p-4 flex flex-col gap-1 flex-1">
                        <p className="font-playfair font-bold text-[15px] text-white line-clamp-2 leading-snug">
                          {s.title}
                        </p>
                        <p
                          className="text-xs"
                          style={{
                            color: "rgba(255,255,255,0.4)",
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          By {s.author.username}
                        </p>
                        <div
                          className="flex items-center gap-3 mt-2 text-xs font-semibold"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          <span style={{ color: "#15b0b7" }}>
                            {s.branchesCount} Branches
                          </span>
                          <span style={{ color: "rgba(255,255,255,0.3)" }}>
                            {s.views} views
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      {showReportModal && story && (
        <ReportModal
          storyId={storyId}
          storyTitle={story.title}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </>
  );
}
