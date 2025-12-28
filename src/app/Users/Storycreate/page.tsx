"use client";

import RichTextEditor from "@/src/component/Richtexteditor";
import { WriteStory } from "@/src/Services/storyApi";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CreateStoryPage() {
  const searchParams = useSearchParams();

  const storyId = searchParams.get("storyId");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  if (!storyId) {
    return <p className="p-10 text-red-500">Story ID missing</p>;
  }

  const handlePublish = async () => {
    await WriteStory({
      storyId,
      title,
      content,
    });
  };

  return (
    <main className="py-[75px] w-full bg-white px-[140px] flex flex-col">
      <input
        type="text"
        placeholder="Story title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-3xl font-bold outline-none border-none mb-6"
      />

      <RichTextEditor content={content} onChange={setContent} />

      <button
        onClick={handlePublish}
        className="mt-6 self-end bg-black text-white px-6 py-2 rounded"
      >
        Publish Chapter
      </button>
    </main>
  );
}
