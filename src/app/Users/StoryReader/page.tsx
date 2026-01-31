"use client";
import { GetChapter } from "@/src/Services/storyApi";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

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
  cover?: string;
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
      <div className="relative w-[360px] h-full rounded overflow-hidden">
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

      <div className="flex flex-col w-full pl-10">
        <div className="flex flex-col gap-9">
          <span className="font-bold text-[48px] leading-[60px] tracking-[-1.2px]">
            {ChapterContent?.title}
          </span>
          <div className="flex flex-col gap-5">
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
            <div></div>
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
