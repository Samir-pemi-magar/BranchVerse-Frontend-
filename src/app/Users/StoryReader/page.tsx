"use client";
import { GetChapter } from "@/src/Services/storyApi";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MdDateRange } from "react-icons/md";
import { FaEye } from "react-icons/fa";
import { FcLike } from "react-icons/fc";

export interface Chapter {
  _id: string;
  storyId: string;
  title: string;
  content: string;
  parentChapterId: string | null;
  chapterNumber: number;
  isMainBranch: boolean;
  branchTitle: string | null;
  author: string;
  likes: number;
  views: number;
  branchCount?: number;
  cover?: string | null;
  tags?: string[];
  createdAt: string;
  __v: number;
}

export default function StoryReader() {
  const searchParams = useSearchParams();
  const storyId = searchParams?.get("storyId") ?? "";
  const chapterId = searchParams?.get("chapterId") ?? "";

  const [ChapterContent, setChapterContent] = useState<Chapter | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tags, settags] = useState<string[]>([]);

  const coverSrc =
    ChapterContent?.cover && process.env.NEXT_PUBLIC_BASEURL
      ? `${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${ChapterContent.cover}`
      : "/images/placeholder-cover.png";

  useEffect(() => {
    if (!chapterId) {
      setError("No chapter id provided");
      setChapterContent(null);
      return;
    }

    const fetchChapterContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await GetChapter(storyId, chapterId);
        setChapterContent(data);
        settags(data.tags);
      } catch (err) {
        console.error("Failed to fetch story", err);
        setError("Failed to load story");
        setChapterContent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchChapterContent();
  }, [chapterId, storyId]);

  return (
    <div className="flex flex-row w-full h-[calc(100vh-70px)] pr-25">
      <div className="relative w-[400px] h-full rounded overflow-hidden">
        {/* Cover Image */}
        <img
          src={coverSrc}
          alt={ChapterContent?.title ?? "cover"}
          className="w-full h-full object-cover"
        />

        {/* Overlay with semi-transparent background */}
        <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-6 gap-3">
          <span className="text-white font-bold text-lg">Branch Lineage</span>

          {/* Branch items */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center bg-purple-400 rounded px-4 py-2">
              <span className="text-black font-semibold">
                The Melancholy of Haruhi Suzumiya
              </span>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                Origin
              </span>
            </div>

            <div className="flex justify-between items-center bg-yellow-400 rounded px-4 py-2">
              <span className="text-black font-semibold">
                The Melancholy of Herald
              </span>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                Thread
              </span>
            </div>

            <div className="flex justify-between items-center bg-cyan-400 rounded px-4 py-2">
              <span className="text-black font-semibold">
                The BranchVerse Anomaly: FYP Project
              </span>
              <span className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full">
                Current
              </span>
            </div>

            <div className="flex justify-between items-center bg-yellow-400 rounded px-4 py-2">
              <span className="text-black font-semibold">
                FYP Project efvhwb
              </span>
              <span className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full">
                Branch
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full pl-10 mt-7 gap-10">
        <div className="flex flex-col gap-9">
          <span className="font-bold text-[48px] leading-[60px] tracking-[-1.2px]">
            {ChapterContent?.title}
          </span>
          <div className="flex flex-col gap-5 -mt-3">
            <div className="flex flex-row gap-[23px]">
              <div>
                #Profileimage{" "}
                <span className="font-bold text-[16px]">
                  {ChapterContent?.author}
                </span>
              </div>
              <p>|</p>

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
            </div>
            <div className="flex flex-row gap-7">
              <div className="flex flex-row gap-1.5 items-center">
                <FcLike /> <span>{ChapterContent?.likes}</span>
              </div>
              <div className="flex flex-row gap-1.5 items-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M5 10.038C5.32593 9.70547 5.71491 9.44134 6.14419 9.26104C6.57347 9.08075 7.0344 8.98791 7.5 8.98798H9.5C10.0871 8.98818 10.6555 8.78178 11.1056 8.40495C11.5557 8.02813 11.8589 7.50491 11.962 6.92698C11.4934 6.79646 11.0885 6.49965 10.8229 6.09209C10.5574 5.68454 10.4495 5.19418 10.5194 4.71281C10.5893 4.23144 10.8323 3.79205 11.2028 3.47689C11.5733 3.16173 12.046 2.9924 12.5324 3.0006C13.0187 3.00881 13.4854 3.19397 13.8451 3.52145C14.2048 3.84892 14.4328 4.29626 14.4864 4.77971C14.5401 5.26317 14.4157 5.74961 14.1366 6.14798C13.8575 6.54635 13.4427 6.82934 12.97 6.94398C12.8591 7.78581 12.446 8.55862 11.8076 9.11846C11.1692 9.6783 10.3491 9.98697 9.5 9.98698H7.5C6.9088 9.98682 6.33666 10.1962 5.88519 10.5779C5.43373 10.9596 5.13215 11.489 5.034 12.072C5.50167 12.2015 5.9063 12.4966 6.17247 12.9024C6.43865 13.3082 6.54822 13.7968 6.48078 14.2774C6.41333 14.758 6.17346 15.1976 5.80586 15.5144C5.43827 15.8312 4.96803 16.0036 4.48278 15.9993C3.99753 15.9951 3.53036 15.8146 3.16834 15.4915C2.80632 15.1683 2.57414 14.7246 2.51506 14.2429C2.45599 13.7612 2.57405 13.2745 2.84725 12.8735C3.12045 12.4724 3.53015 12.1843 4 12.063V3.93698C3.52868 3.81528 3.11791 3.52587 2.8447 3.12298C2.5715 2.72009 2.45461 2.23139 2.51595 1.74848C2.57728 1.26557 2.81264 0.821613 3.17789 0.499819C3.54314 0.178025 4.01322 0.000488281 4.5 0.000488281C4.98679 0.000488281 5.45687 0.178025 5.82212 0.499819C6.18737 0.821613 6.42273 1.26557 6.48406 1.74848C6.5454 2.23139 6.42851 2.72009 6.15531 3.12298C5.8821 3.52587 5.47133 3.81528 5 3.93698V10.038Z"
                    fill="#00B8AE"
                  />
                </svg>
                <span>{ChapterContent?.branchCount}</span>
              </div>
              <div className="flex flex-row gap-1.5 items-center">
                <FaEye />

                <span>{ChapterContent?.views}</span>
              </div>
              <div className="flex flex-row gap-1.5 items-center">
                <MdDateRange /> <span>{ChapterContent?.createdAt}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col w-full">
          <p>{ChapterContent?.content}</p>
          <div className="flex flex-row w-full justify-end">
            <button></button>
            <button></button>
          </div>
        </div>
      </div>
    </div>
  );
}
