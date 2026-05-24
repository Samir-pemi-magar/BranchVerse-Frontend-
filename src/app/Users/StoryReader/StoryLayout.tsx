"use client";
import StoryReaderSidebar from "@/src/component/StoryReaderSidebar";
import StoryReaderComponent from "@/src/component/StoryReader";
import { GetChapter } from "@/src/Services/storyApi";
import { useEffect, useRef, useState } from "react";
import { coverUrl } from "../../../../Utils/coverUrl";

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
  currentUserId?: string;
  __v: number;
}

interface LayoutProps {
  storyId: string;
  chapterId: string;
}

export default function StoryLayout({ storyId, chapterId }: LayoutProps) {
  const [chapterContent, setChapterContent] = useState<Chapter | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasFetched = useRef(false); // ← add this

  useEffect(() => {
    if (!storyId || !chapterId) return;
    if (hasFetched.current) return; // ← block second Strict Mode call
    hasFetched.current = true; // ← mark as fetched

    const fetchChapter = async () => {
      try {
        const chapter = await GetChapter(storyId, chapterId);
        if (!chapter) {
          setError("Chapter not found");
          return;
        }
        setChapterContent(chapter);
      } catch (err) {
        console.error("Failed to fetch chapter:", err);
        setError("Failed to load story");
      }
    };

    fetchChapter();
  }, [storyId, chapterId]);

  const coverSrc = chapterContent?.cover
    ? coverUrl(chapterContent.cover)
    : "/images/placeholder-cover.png";

  if (!chapterContent && error) {
    return <div className="text-red-500 p-10">{error}</div>;
  }

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden flex items-center px-4 py-2 border-b bg-white sticky top-0 z-10">
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="text-sm font-semibold text-[#00B8AE] border border-[#00B8AE] px-3 py-1 rounded-sm"
        >
          {sidebarOpen ? "Hide info ▲" : "Chapter info ▼"}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`
          bg-white overflow-y-auto border-b md:border-b-0 md:border-r
          md:w-[400px] md:flex-shrink-0 md:block
          transition-all duration-300
          ${sidebarOpen ? "block" : "hidden"}
        `}
      >
        <StoryReaderSidebar
          coverSrc={coverSrc}
          chapterContent={chapterContent}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {chapterContent ? (
          <StoryReaderComponent ChapterContent={chapterContent} />
        ) : (
          <div className="text-gray-500 p-10">Loading...</div>
        )}
      </div>
    </div>
  );
}
