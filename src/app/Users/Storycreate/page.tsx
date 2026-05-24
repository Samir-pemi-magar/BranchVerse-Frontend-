// CreateStoryPage.tsx
"use client";

import RichTextEditor from "@/src/component/Richtexteditor";
import { WriteStory } from "@/src/Services/storyApi";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CreateStoryPage() {
  const searchParams = useSearchParams();
  const storyId = searchParams.get("storyId");
  const parentChapterId = searchParams.get("parentChapterId") || undefined;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [branchTitle, setBranchTitle] = useState("My Branch");
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(false);

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
        parentChapterId,
        branchTitle: parentChapterId ? branchTitle : undefined,
      });
      setPublished(true);
      setTimeout(() => {
        setPublished(false);
        setTitle("");
        setContent("");
        if (parentChapterId) setBranchTitle("My Branch");
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof Error) alert("Error: " + err.message);
      else alert("Unexpected error: " + JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }

        @keyframes orb-drift {
          from { transform: translate(0,0) scale(1); }
          to { transform: translate(25px,-25px) scale(1.05); }
        }
        @keyframes slide-up {
          from { opacity:0; transform:translateY(24px); }
          to { opacity:1; transform:translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(108,78,242,0.3); }
          50% { box-shadow: 0 0 0 8px rgba(108,78,242,0); }
        }
        @keyframes success-pop {
          0% { transform: scale(0.8); opacity:0; }
          60% { transform: scale(1.05); }
          100% { transform: scale(1); opacity:1; }
        }

        .orb-1 { animation: orb-drift 14s ease-in-out infinite alternate; }
        .orb-2 { animation: orb-drift 14s ease-in-out infinite alternate; animation-delay: -5s; }
        .orb-3 { animation: orb-drift 14s ease-in-out infinite alternate; animation-delay: -9s; }
        .card-in { animation: slide-up 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .success-pop { animation: success-pop 0.4s cubic-bezier(0.22,1,0.36,1) both; }

        .noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px;
        }

        .editor-dark .ProseMirror {
          background: rgba(255,255,255,0.04) !important;
          border: 0.5px solid rgba(255,255,255,0.1) !important;
          border-radius: 14px !important;
          color: rgba(255,255,255,0.88) !important;
          min-height: 360px;
          padding: 20px 24px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          line-height: 1.8;
          caret-color: #15b0b7;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .editor-dark .ProseMirror:focus {
          border-color: rgba(108,78,242,0.5) !important;
          background: rgba(108,78,242,0.04) !important;
        }
        .editor-dark .ProseMirror p.is-editor-empty:first-child::before {
          color: rgba(255,255,255,0.2);
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .editor-dark .ProseMirror h1 { font-family: 'Playfair Display', serif; font-size: 2rem; color: #fff; margin-bottom: 0.5rem; }
        .editor-dark .ProseMirror h2 { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: #fff; margin-bottom: 0.4rem; }
        .editor-dark .ProseMirror h3 { font-family: 'Playfair Display', serif; font-size: 1.2rem; color: rgba(255,255,255,0.9); margin-bottom: 0.3rem; }
        .editor-dark .ProseMirror strong { color: #fff; }
        .editor-dark .ProseMirror em { color: rgba(255,255,255,0.75); }
        .editor-dark .ProseMirror mark { background: rgba(108,78,242,0.35); color: #fff; border-radius: 3px; padding: 0 2px; }
        .editor-dark .ProseMirror ul, .editor-dark .ProseMirror ol { padding-left: 1.5rem; color: rgba(255,255,255,0.8); }

        .menubar-dark {
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 6px 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
          margin-bottom: 8px;
        }
        .menubar-dark button {
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.45);
          padding: 6px 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .menubar-dark button:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.85); }
        .menubar-dark button[data-active="true"] { background: rgba(108,78,242,0.3); color: #957bda; }

        .title-input::placeholder { color: rgba(255,255,255,0.18); }
        .branch-input::placeholder { color: rgba(255,255,255,0.2); }

        .publish-btn {
          background: linear-gradient(130deg, #6c4ef2 0%, #15b0b7 100%);
          position: relative;
          overflow: hidden;
        }
        .publish-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          pointer-events: none;
        }
        .publish-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .publish-btn:not(:disabled):hover { opacity: 0.88; transform: translateY(-1px); }
        .publish-btn:not(:disabled):active { transform: scale(0.99); }
      `}</style>

      <div
        className="font-dm relative min-h-screen"
        style={{ background: "#0d0d12" }}
      >
        {/* Orbs */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div
            className="orb-1 absolute rounded-full"
            style={{
              width: 480,
              height: 480,
              background: "#6c4ef2",
              filter: "blur(80px)",
              opacity: 0.28,
              top: -100,
              right: -60,
            }}
          />
          <div
            className="orb-2 absolute rounded-full"
            style={{
              width: 340,
              height: 340,
              background: "#15b0b7",
              filter: "blur(80px)",
              opacity: 0.28,
              bottom: -60,
              left: -60,
            }}
          />
          <div
            className="orb-3 absolute rounded-full"
            style={{
              width: 220,
              height: 220,
              background: "#e5839a",
              filter: "blur(80px)",
              opacity: 0.14,
              top: "45%",
              left: "35%",
            }}
          />
        </div>
        <div className="noise fixed inset-0 z-[1] opacity-[0.03] pointer-events-none" />

        {/* Success overlay */}
        {published && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div
              className="success-pop flex flex-col items-center gap-4 px-10 py-10 rounded-[28px]"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "0.5px solid rgba(255,255,255,0.12)",
              }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,#6c4ef2,#15b0b7)",
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="font-playfair text-2xl font-bold text-white text-center">
                {parentChapterId ? "Branch Created!" : "Chapter Published!"}
              </p>
              <p
                className="text-sm text-center"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Your story continues to grow.
              </p>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
              className="flex flex-col items-center gap-4 px-8 py-8 rounded-[24px]"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "0.5px solid rgba(255,255,255,0.1)",
              }}
            >
              <div
                className="w-10 h-10 rounded-full border-[3px] border-transparent animate-spin"
                style={{
                  borderTopColor: "#6c4ef2",
                  borderRightColor: "#15b0b7",
                }}
              />
              <p
                className="text-sm font-medium"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Publishing your story…
              </p>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="relative z-[2] w-full max-w-[1300px] mx-auto px-4 sm:px-8 py-10 sm:py-16">
          <div className="card-in">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-medium px-3 py-1 rounded-full"
                  style={{
                    background: "rgba(108,78,242,0.2)",
                    color: "#957bda",
                    border: "0.5px solid rgba(108,78,242,0.3)",
                  }}
                >
                  {parentChapterId ? "🌿 New Branch" : "📖 New Chapter"}
                </span>
              </div>
              <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {parentChapterId ? "Branch the Story" : "Write a Chapter"}
              </h1>
              <p
                className="text-sm"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                {parentChapterId
                  ? "Create an alternate path from this chapter. Your narrative begins here."
                  : "Continue the narrative. Every word shapes the universe."}
              </p>
            </div>

            {/* Card */}
            <div
              className="rounded-[24px] p-6 sm:p-8 flex flex-col gap-6"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "0.5px solid rgba(255,255,255,0.08)",
              }}
            >
              {/* Branch title (only for branches) */}
              {parentChapterId && (
                <div className="flex flex-col gap-2">
                  <label
                    className="text-xs font-medium tracking-wide uppercase"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    Branch Name
                  </label>
                  <input
                    type="text"
                    value={branchTitle}
                    onChange={(e) => setBranchTitle(e.target.value)}
                    placeholder="Give your branch a name..."
                    className="branch-input w-full h-11 rounded-xl px-4 text-sm text-white outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "0.5px solid rgba(255,255,255,0.1)",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  />
                </div>
              )}

              {/* Chapter title */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-xs font-medium tracking-wide uppercase"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Chapter Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a captivating title..."
                  className="title-input w-full rounded-xl px-4 py-3 text-xl sm:text-2xl font-bold text-white outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "0.5px solid rgba(255,255,255,0.1)",
                    fontFamily: "'Playfair Display', serif",
                  }}
                />
              </div>

              {/* Editor */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-xs font-medium tracking-wide uppercase"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Content
                </label>
                <div className="editor-dark">
                  <RichTextEditor content={content} onChange={setContent} />
                </div>
              </div>

              {/* Footer row */}
              <div className="flex items-center justify-between pt-2">
                <p
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.2)" }}
                >
                  {content.replace(/<[^>]*>/g, "").length} characters
                </p>
                <button
                  onClick={handlePublish}
                  disabled={loading || !title.trim() || !content.trim()}
                  className="publish-btn font-dm text-white font-medium text-sm px-7 py-3 rounded-xl transition-all duration-200"
                >
                  {loading
                    ? "Publishing…"
                    : parentChapterId
                      ? "Publish Branch"
                      : "Publish Chapter"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
