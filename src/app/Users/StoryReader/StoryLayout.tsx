"use client";
import StoryReaderSidebar from "@/src/component/StoryReaderSidebar";
import StoryReaderComponent from "@/src/component/StoryReader";
import { GetChapter } from "@/src/Services/storyApi";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    // ✅ CRITICAL FIX: prevent undefined API call
    if (!storyId || !chapterId) {
      console.log(
        "Skipping fetch because IDs are missing:",
        storyId,
        chapterId,
      );
      return;
    }

    const fetchChapter = async () => {
      try {
        console.log("Fetching chapter:", storyId, chapterId);

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

  const coverSrc =
    chapterContent?.cover && process.env.NEXT_PUBLIC_BASEURL
      ? `${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${chapterContent.cover}`
      : "/images/placeholder-cover.png";

  if (!chapterContent && error) {
    return <div className="text-red-500 p-10">{error}</div>;
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-[400px] border-r bg-white overflow-y-auto">
        <StoryReaderSidebar
          coverSrc={coverSrc}
          chapterContent={chapterContent}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {chapterContent ? (
          <StoryReaderComponent ChapterContent={chapterContent} />
        ) : (
          <div className="text-gray-500">Loading...</div>
        )}
      </div>
    </div>
  );
}
