"use client";

import { useSearchParams } from "next/navigation";
import StoryLayout from "./StoryLayout";

export default function StoryReaderPage() {
  const searchParams = useSearchParams();

  const storyId = searchParams.get("storyId");
  const chapterId = searchParams.get("chapterId");

  console.log("PAGE storyId:", storyId);
  console.log("PAGE chapterId:", chapterId);

  if (!storyId || !chapterId) {
    return <div className="p-10 text-gray-500">Loading...</div>;
  }

  return <StoryLayout storyId={storyId} chapterId={chapterId} />;
}
