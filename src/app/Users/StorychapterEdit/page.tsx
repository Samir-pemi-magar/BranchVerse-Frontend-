"use client";

import RichTextEditor from "@/src/component/Richtexteditor";
import { UpdateChapter } from "@/src/Services/storyApi";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface Chapter {
  _id: string;
  storyId: string;
  title: string;
  content: string;
}

export default function StoryChapterEditPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const chapterId = searchParams.get("chapterId");
  const storyId = searchParams.get("storyId");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!chapterId) return;

    // Pre-fill from query params if passed directly (optional convenience)
    const prefilledTitle = searchParams.get("title");
    const prefilledContent = searchParams.get("content");

    if (prefilledTitle) setTitle(decodeURIComponent(prefilledTitle));
    if (prefilledContent) setContent(decodeURIComponent(prefilledContent));

    setInitialLoading(false);
  }, [chapterId]);

  if (!chapterId) {
    return <p className="p-10 text-red-500">Chapter ID missing</p>;
  }

  const handleSave = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const res = await UpdateChapter(chapterId, {
        title: title || undefined,
        content: content || undefined,
      });
      alert(res.message || "Chapter updated!");
      // Navigate back to the story reader after saving
      if (storyId) {
        router.push(
          `/Users/StoryReader?chapterId=${chapterId}&storyId=${storyId}`,
        );
      } else {
        router.back();
      }
    } catch (err: unknown) {
      if (err instanceof Error) alert("Error: " + err.message);
      else alert("Unexpected error: " + JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (initialLoading) {
    return <p className="p-10 text-gray-400">Loading chapter...</p>;
  }

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

      <div className="mt-6 flex gap-3 self-end">
        <button
          onClick={handleCancel}
          className="px-6 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-black text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </main>
  );
}
