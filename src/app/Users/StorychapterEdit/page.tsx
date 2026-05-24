"use client";

import RichTextEditor from "@/src/component/Richtexteditor";
import { UpdateChapter } from "@/src/Services/storyApi";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function StoryChapterEditPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const chapterId = searchParams.get("chapterId");
  const storyId = searchParams.get("storyId");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!chapterId) return;
    const prefilledTitle = searchParams.get("title");
    const prefilledContent = searchParams.get("content");
    if (prefilledTitle) setTitle(decodeURIComponent(prefilledTitle));
    if (prefilledContent) setContent(decodeURIComponent(prefilledContent));
    setInitialLoading(false);
  }, [chapterId]);

  if (!chapterId) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        `}</style>
        <div
          className="min-h-screen flex items-center justify-center"
          style={{
            background: "#0d0d12",
            fontFamily: "'DM Sans', sans-serif",
            color: "#f87171",
          }}
        >
          Chapter ID missing
        </div>
      </>
    );
  }

  const handleSave = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const res = await UpdateChapter(chapterId, {
        title: title || undefined,
        content: content || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
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

  if (initialLoading) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
          @keyframes skeleton-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          .skeleton-pulse {
            background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
            background-size: 200% 100%;
            animation: skeleton-shimmer 1.5s infinite;
            border-radius: 10px;
          }
        `}</style>
        <div
          className="min-h-screen flex flex-col gap-6 px-6 pt-32"
          style={{ background: "#0d0d12" }}
        >
          <div className="skeleton-pulse h-10 w-2/3 max-w-[400px]" />
          <div className="skeleton-pulse h-[400px] w-full" />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }

        @keyframes orb-drift {
          from { transform: translate(0,0) scale(1); }
          to { transform: translate(20px,-20px) scale(1.05); }
        }
        @keyframes fade-up {
          from { opacity:0; transform:translateY(16px); }
          to { opacity:1; transform:translateY(0); }
        }
        @keyframes pop-in {
          from { opacity:0; transform:scale(0.92) translateY(6px); }
          to { opacity:1; transform:scale(1) translateY(0); }
        }

        .orb-1 { animation: orb-drift 14s ease-in-out infinite alternate; }
        .orb-2 { animation: orb-drift 14s ease-in-out infinite alternate; animation-delay:-6s; }
        .fade-up { animation: fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both; }

        .noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px;
        }

        .section-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.28);
          font-family: 'DM Sans', sans-serif;
        }

        .editor-wrapper {
          background: rgba(255,255,255,0.025);
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .editor-wrapper:focus-within {
          border-color: rgba(21,176,183,0.35);
        }

        .title-input {
          background: transparent;
          border: none;
          outline: none;
          width: 100%;
          color: white;
          font-family: 'Playfair Display', serif;
          font-size: clamp(22px, 4vw, 38px);
          font-weight: 700;
          line-height: 1.2;
          caret-color: #15b0b7;
        }
        .title-input::placeholder {
          color: rgba(255,255,255,0.18);
        }

        .title-wrapper {
          background: rgba(255,255,255,0.025);
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 20px 24px;
          transition: border-color 0.2s;
        }
        .title-wrapper:focus-within {
          border-color: rgba(21,176,183,0.35);
        }

        .gradient-btn {
          background: linear-gradient(130deg, #6c4ef2 0%, #15b0b7 100%);
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          border: none;
          transition: all 0.2s;
          cursor: pointer;
          color: white;
        }
        .gradient-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .gradient-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .ghost-btn {
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.55);
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          transition: all 0.2s;
          cursor: pointer;
        }
        .ghost-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.85); }

        .saved-toast {
          animation: pop-in 0.3s cubic-bezier(0.22,1,0.36,1) both;
          background: rgba(21,176,183,0.12);
          border: 0.5px solid rgba(21,176,183,0.35);
          border-radius: 10px;
          padding: 8px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #15b0b7;
        }

        /* Force RichTextEditor to look dark — override any white backgrounds */
        .editor-wrapper .ql-toolbar,
        .editor-wrapper [class*="toolbar"],
        .editor-wrapper [class*="Toolbar"] {
          background: rgba(255,255,255,0.04) !important;
          border-bottom: 0.5px solid rgba(255,255,255,0.08) !important;
          border-top: none !important;
          border-left: none !important;
          border-right: none !important;
        }
        .editor-wrapper .ql-container,
        .editor-wrapper [class*="editor"] {
          background: transparent !important;
          border: none !important;
          color: rgba(255,255,255,0.75) !important;
          font-family: 'DM Sans', sans-serif !important;
          min-height: 420px;
        }
        .editor-wrapper .ql-editor,
        .editor-wrapper [contenteditable] {
          color: rgba(255,255,255,0.75) !important;
          min-height: 380px;
          font-size: 16px;
          line-height: 1.8;
        }
        .editor-wrapper .ql-editor.ql-blank::before {
          color: rgba(255,255,255,0.18) !important;
          font-style: italic;
        }
        .editor-wrapper .ql-stroke { stroke: rgba(255,255,255,0.4) !important; }
        .editor-wrapper .ql-fill { fill: rgba(255,255,255,0.4) !important; }
        .editor-wrapper .ql-picker-label { color: rgba(255,255,255,0.4) !important; }
        .editor-wrapper button:hover .ql-stroke { stroke: #15b0b7 !important; }
        .editor-wrapper button:hover .ql-fill { fill: #15b0b7 !important; }
        .editor-wrapper .ql-active .ql-stroke { stroke: #15b0b7 !important; }
        .editor-wrapper .ql-active .ql-fill { fill: #15b0b7 !important; }
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
              filter: "blur(110px)",
              opacity: 0.14,
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
              filter: "blur(90px)",
              opacity: 0.14,
              bottom: -60,
              left: -60,
            }}
          />
        </div>
        <div className="noise fixed inset-0 z-[1] opacity-[0.03] pointer-events-none" />

        <main className="relative z-[2] py-10 sm:py-[80px] w-full max-w-[1300px] mx-auto px-4 sm:px-6 flex flex-col gap-6 sm:gap-8">
          {/* Header */}
          <div className="fade-up flex items-center justify-between">
            <div>
              <span className="section-label">Editing</span>
              <p className="text-white font-playfair text-xl font-bold mt-0.5">
                Chapter Editor
              </p>
            </div>
            {saved && <div className="saved-toast">✓ Saved!</div>}
          </div>

          {/* Title Input */}
          <div className="fade-up title-wrapper">
            <span className="section-label mb-2 block">Chapter Title</span>
            <input
              type="text"
              placeholder="Give your chapter a title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="title-input"
            />
          </div>

          {/* Rich Text Editor */}
          <div className="fade-up flex flex-col gap-2">
            <span className="section-label">Content</span>
            <div className="editor-wrapper">
              <RichTextEditor content={content} onChange={setContent} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="fade-up flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={() => router.back()}
              className="ghost-btn px-6 py-2.5 rounded-xl text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="gradient-btn px-8 py-2.5 rounded-xl text-sm sm:text-base"
            >
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </main>
      </div>
    </>
  );
}
