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

  // FIX: return undefined instead of "" so React omits the src attribute entirely
  const coverSrc =
    story?.cover && process.env.NEXT_PUBLIC_BASEURL
      ? `${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${story.cover}`
      : undefined;

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
    if (preferences.length > 0) {
      fetchPersonalized();
    }
  }, [storyId, preferences]);

  // Seed likes from first chapter once chapters are loaded
  useEffect(() => {
    if (chapters.length > 0) {
      setLikes(chapters[0].likes ?? 0);
    }
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

  const RenderBranches: React.FC<RenderBranchesProps> = ({
    branches,
    storyId,
  }) => {
    return (
      <ul className="mt-3 ml-3 sm:ml-4 border-l-2 border-gray-200 pl-3 sm:pl-4 space-y-2">
        {branches.map((b: ChapterNode) => (
          <li key={b._id}>
            <Link
              href={`/Users/StoryReader?storyId=${storyId}&chapterId=${b._id}`}
              className="text-gray-700 text-sm flex items-center gap-2 group hover:text-purple-600"
            >
              <span className="w-2 h-2 rounded-full bg-purple-400 inline-block shrink-0" />
              <span className="font-medium">{b.title}</span>
            </Link>
            {b.branches && b.branches.length > 0 && (
              <RenderBranches branches={b.branches} storyId={storyId} />
            )}
          </li>
        ))}
      </ul>
    );
  };

  const BranchSVG = ({ fill = "#00B8AE" }: { fill?: string }) => (
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

  return (
    <div className="pt-[70px] sm:pt-[90px] w-full min-h-screen px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 flex flex-col items-center gap-10 sm:gap-[47px]">
      {error && (
        <div className="text-red-500 mb-4 w-full text-center">{error}</div>
      )}

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row w-full items-start gap-8 md:gap-12 lg:gap-20">
        {/* Cover Image */}
        <div className="w-full md:w-[280px] lg:w-[380px] xl:w-[504px] shrink-0">
          {/* FIX: show skeleton while loading OR while coverSrc is not yet available */}
          {loading || !coverSrc ? (
            <div className="w-full h-[220px] sm:h-[280px] md:h-[304px] bg-gray-200 animate-pulse rounded" />
          ) : (
            <img
              src={coverSrc}
              alt={story?.title ?? "cover"}
              className="w-full h-[220px] sm:h-[280px] md:h-[304px] object-cover rounded"
            />
          )}
        </div>

        {/* Story Info */}
        <div className="flex flex-col items-start gap-4 flex-1 min-w-0">
          {/* Title & Author */}
          <div className="flex flex-col gap-2 w-full">
            <h1 className="font-bold text-2xl sm:text-3xl lg:text-[42px] leading-tight break-words">
              {story?.title || "Untitled"}
            </h1>
            <div className="flex flex-row gap-2 items-center">
              <span
                onClick={() => {
                  if (story?.author?._id) {
                    router.push(`/Users/Profile?id=${story.author._id}`);
                  }
                }}
                className="font-semibold text-sm sm:text-base hover:underline hover:text-[#00B8AE] cursor-pointer"
              >
                {story?.author?.username || "Unknown"}
              </span>
            </div>
          </div>

          {/* Origin Badge */}
          <span className="h-[33px] flex items-center justify-center font-bold text-white bg-[#9E77DC] rounded-full px-4 py-1 text-sm whitespace-nowrap">
            {story?.branchedFrom || "Origin"}
          </span>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-4 sm:gap-7 text-sm">
            <div
              className="flex flex-row gap-1.5 items-center cursor-pointer"
              onClick={handleLikeStory}
            >
              <FcLike />
              <span>{likes}</span>
            </div>

            <div className="flex flex-row gap-1.5 items-center">
              <BranchSVG />
              <span>{story?.branchesCount}</span>
            </div>

            <div className="flex flex-row gap-1.5 items-center">
              <FaEye />
              <span>{story?.views}</span>
            </div>

            <div className="flex flex-row gap-1.5 items-center">
              <MdDateRange />
              <span className="truncate max-w-[140px] sm:max-w-none">
                {story?.createdAt}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row flex-wrap gap-3">
            {story && chapters && chapters.length > 0 && (
              <Link
                href={`/Users/StoryReader?storyId=${storyId}&chapterId=${chapters[0]._id}`}
                className="h-[43px] px-4 py-1 bg-[#00B8AE] rounded-[7px] font-semibold text-white flex items-center text-sm sm:text-base hover:bg-[#009d94] transition-colors"
              >
                Start Reading
              </Link>
            )}
            <button
              className="h-[43px] px-4 py-1 bg-[#00B8AE] rounded-[7px] font-semibold text-white text-sm sm:text-base hover:bg-[#009d94] transition-colors"
              onClick={handleBranchStory}
            >
              Branch This Story
            </button>

            {/* Report button */}
            <button
              onClick={() => setShowReportModal(true)}
              className="h-[43px] px-4 py-1 border-2 border-red-300 text-red-500 rounded-[7px] font-semibold text-sm sm:text-base hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors flex items-center gap-2"
            >
              <FaFlag className="text-sm" />
              Report
            </button>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="flex flex-col w-full">
        <span className="text-base sm:text-[18px] font-semibold mb-4 sm:mb-6">
          Preview
        </span>
        <p className="text-black font-normal text-sm sm:text-[18px] leading-relaxed break-words">
          {story?.description}
        </p>
      </section>

      {/* Tags */}
      <section className="flex flex-col w-full">
        <span className="text-base sm:text-[18px] font-semibold text-slate-900 mb-4 sm:mb-6">
          Tags
        </span>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="bg-[#F6F3FC] hover:bg-[#EBEBF2] text-black text-xs font-semibold px-4 py-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
              aria-pressed="false"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Branch Lineage */}
      <section className="flex flex-col w-full">
        <h2 className="text-base sm:text-[18px] font-semibold mb-4 sm:mb-6">
          Branch Lineage
        </h2>

        <div className="space-y-4 pl-2">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-teal-100 rounded-md shrink-0">
              <BranchSVG />
            </div>
            <div className="text-sm">
              <span className="text-slate-500">Branched from:&nbsp;</span>
              <span className="text-teal-500 font-semibold">
                {story?.branchedFrom || "Origin"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-md shrink-0">
              <BranchSVG />
            </div>
            <div className="text-sm">
              <span className="text-slate-500">Branches:&nbsp;</span>
              <span className="text-purple-500 font-semibold">
                {story?.branchesCount || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-400">
          Explore the different paths this story can take, or create your own
          branch!
        </div>

        {/* Chapter Hierarchy */}
        <div className="mt-6 w-full">
          {chapterHierarchy.map((chapter) => (
            <div
              key={chapter._id}
              className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
            >
              <Link
                href={`/Users/StoryReader?storyId=${storyId}&chapterId=${chapter._id}`}
                className="flex items-center justify-between cursor-pointer"
              >
                <span className="font-semibold text-base sm:text-lg text-teal-700">
                  Chapter {chapter.chapterNumber}: {chapter.title}
                </span>
              </Link>

              {chapter.branches && chapter.branches.length > 0 && (
                <RenderBranches branches={chapter.branches} storyId={storyId} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* More From BranchVerse */}
      <section className="flex flex-col w-full items-center gap-6 sm:gap-10 bg-gray-50 py-8 sm:py-10 px-4 sm:px-6 rounded-xl">
        <span className="text-base sm:text-[18px] font-semibold">
          More From BranchVerse
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
          {personalizedStories.map((story) => {
            // FIX: guard personalized story covers the same way
            const storyCoverSrc =
              story.cover && process.env.NEXT_PUBLIC_BASEURL
                ? `${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${story.cover}`
                : undefined;

            return (
              <Link
                key={story._id}
                href={`/Users/StoryPreview?id=${story._id}`}
                className="bg-white border rounded-xl shadow-md hover:shadow-lg p-3 transition flex flex-col"
              >
                {storyCoverSrc ? (
                  <img
                    src={storyCoverSrc}
                    className="w-full h-[180px] sm:h-[220px] rounded-lg object-cover"
                    alt={story.title}
                  />
                ) : (
                  <div className="w-full h-[180px] sm:h-[220px] rounded-lg bg-gray-200 animate-pulse" />
                )}
                <div className="mt-3 flex-1 flex flex-col">
                  <p className="text-base sm:text-[20px] font-bold line-clamp-2">
                    {story.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    By {story.author.username}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[#00B8AE] font-semibold flex-wrap">
                    <p className="text-sm">{story.branchesCount} Branches</p>
                    <p className="text-sm text-gray-500">
                      • {story.views} views
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* REPORT MODAL */}
      {showReportModal && story && (
        <ReportModal
          storyId={storyId}
          storyTitle={story.title}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
