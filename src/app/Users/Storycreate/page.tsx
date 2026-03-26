"use client";

import RichTextEditor from "@/src/component/Richtexteditor";
import { WriteStory } from "@/src/Services/storyApi";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CreateStoryPage() {
  const searchParams = useSearchParams();
  const storyId = searchParams.get("storyId");
  const parentChapterId = searchParams.get("parentChapterId") || undefined; // ✅ convert null to undefined

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [branchTitle, setBranchTitle] = useState("My Branch"); // optional branch title
  const [loading, setLoading] = useState(false);

  if (!storyId) {
    return <p className="p-10 text-red-500">Story ID missing</p>;
  }

  const handlePublish = async () => {
    if (loading) return;
    try {
      setLoading(true);
      await WriteStory({
        storyId,
        title,
        content,
        parentChapterId, // optional, only needed for branch
        branchTitle: parentChapterId ? branchTitle : undefined,
      });
      alert(parentChapterId ? "Branch created!" : "Chapter published!");
      setTitle("");
      setContent("");
      if (parentChapterId) setBranchTitle("My Branch");
    } catch (err: unknown) {
      if (err instanceof Error) alert("Error: " + err.message);
      else alert("Unexpected error: " + JSON.stringify(err));
    } finally {
      setLoading(false);
    }
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
        disabled={loading}
        className="mt-6 self-end bg-black text-white px-6 py-2 rounded disabled:opacity-50"
      >
        {loading
          ? "Publishing..."
          : parentChapterId
            ? "Create Branch"
            : "Publish Chapter"}
      </button>
    </main>
  );
}
