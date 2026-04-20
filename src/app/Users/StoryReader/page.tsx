"use client";

import { useSearchParams } from "next/navigation";
import StoryLayout from "./StoryLayout";
import {
  UpdateChapter,
  DeleteChapter,
  DisableChapter,
  EnableChapter,
} from "@/src/Services/storyApi";
import { useState } from "react";

export default function StoryReaderPage() {
  const searchParams = useSearchParams();

  const storyId = searchParams.get("storyId");
  const chapterId = searchParams.get("chapterId");
  const [chapterMenuOpen, setChapterMenuOpen] = useState(false);

  console.log("PAGE storyId:", storyId);
  console.log("PAGE chapterId:", chapterId);

  if (!storyId || !chapterId) {
    return <div className="p-10 text-gray-500">Loading...</div>;
  }

  return <StoryLayout storyId={storyId} chapterId={chapterId} />;
}
