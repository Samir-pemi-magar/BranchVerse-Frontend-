"use client";

import RichTextEditor from "@/src/component/Richtexteditor";
import {
  WriteStory,
  GetMyDrafts,
  PublishDraft,
  UpdateChapter,
} from "@/src/Services/storyApi";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface Draft {
  _id: string;
  title: string;
  content: string;
  branchTitle?: string;
  isMainBranch: boolean;
  updatedAt: string;
  storyId?: { title: string };
}

export default function CreateStoryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const storyId = searchParams.get("storyId");
  const parentChapterId = searchParams.get("parentChapterId") || undefined;
  const draftIdParam = searchParams.get("draftId") || undefined;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [branchTitle, setBranchTitle] = useState("My Branch");
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(
    draftIdParam || null,
  );
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [myDrafts, setMyDrafts] = useState<Draft[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [parentChapterTitle, setParentChapterTitle] = useState<string | null>(
    null,
  );

  // Fetch parent chapter title and auto-set branch title
  useEffect(() => {
    if (!parentChapterId) return;

    async function fetchParentChapter() {
      try {
        const token =
          localStorage.getItem("token") ?? sessionStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASEURL}/api/chapters/${parentChapterId}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        );
        if (!res.ok) return;
        const data = await res.json();
        setParentChapterTitle(data.title);
        setBranchTitle(data.title); // auto-set branch title from parent
      } catch {
        // silent
      }
    }

    fetchParentChapter();
  }, [parentChapterId]);

  // Load draft content if draftId is in the URL
  useEffect(() => {
    if (!draftIdParam) return;
    async function loadDraft() {
      try {
        const drafts: Draft[] = await GetMyDrafts();
        const draft = drafts.find((d) => d._id === draftIdParam);
        if (draft) {
          setTitle(draft.title);
          setContent(draft.content);
          if (draft.branchTitle) setBranchTitle(draft.branchTitle);
          setActiveDraftId(draft._id);
        }
      } catch {
        // silent
      }
    }
    loadDraft();
  }, [draftIdParam]);

  useEffect(() => {
    if (!storyId) return;

    if (parentChapterId) {
      setAuthorized(true);
      return;
    }

    async function checkOwnership() {
      try {
        const currentUserId =
          localStorage.getItem("userId") ?? sessionStorage.getItem("userId");

        if (!currentUserId) {
          setAuthorized(false);
          return;
        }

        const token =
          localStorage.getItem("token") ?? sessionStorage.getItem("token");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASEURL}/api/stories/${storyId}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        );

        if (!res.ok) {
          setAuthorized(false);
          return;
        }

        const data = await res.json();
        if (data.disabled) {
          setAuthorized(false);
          return;
        }

        const authorId =
          typeof data.author === "object" ? data.author._id : data.author;
        setAuthorized(authorId === currentUserId);
      } catch {
        setAuthorized(false);
      }
    }

    checkOwnership();
  }, [storyId, parentChapterId]);

  const fetchDrafts = async () => {
    setDraftsLoading(true);
    try {
      const drafts: Draft[] = await GetMyDrafts();
      setMyDrafts(
        drafts.filter((d: Draft) => {
          if (!storyId) return true;
          const sid =
            typeof d.storyId === "object"
              ? (d.storyId as { _id?: string })?._id
              : d.storyId;
          return sid === storyId;
        }),
      );
    } catch {
      setMyDrafts([]);
    } finally {
      setDraftsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (loading) return;
    try {
      setLoading(true);

      if (activeDraftId) {
        await UpdateChapter(activeDraftId, {
          title,
          content,
          branchTitle: parentChapterId ? branchTitle : undefined,
        });
      } else {
        const res = await WriteStory({
          storyId: storyId!,
          title,
          content,
          parentChapterId,
          branchTitle: parentChapterId ? branchTitle : undefined,
          isDraft: true,
        });
        if (res.chapterId) setActiveDraftId(res.chapterId);
      }

      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2500);
    } catch (err: unknown) {
      if (err instanceof Error) alert("Error: " + err.message);
      else alert("Unexpected error: " + JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (loading) return;
    try {
      setLoading(true);

      if (activeDraftId) {
        await PublishDraft(activeDraftId);
      } else {
        await WriteStory({
          storyId: storyId!,
          title,
          content,
          parentChapterId,
          branchTitle: parentChapterId ? branchTitle : undefined,
          isDraft: false,
        });
      }

      setActiveDraftId(null);
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

  const loadDraftIntoEditor = (draft: Draft) => {
    setTitle(draft.title);
    setContent(draft.content);
    if (draft.branchTitle) setBranchTitle(draft.branchTitle);
    setActiveDraftId(draft._id);
    setShowDrafts(false);
  };

  if (!storyId) return <p className="p-10 text-red-500">Story ID missing</p>;

  if (authorized === null) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0d0d12" }}
      >
        <div
          className="w-10 h-10 rounded-full border-[3px] border-transparent animate-spin"
          style={{ borderTopColor: "#6c4ef2", borderRightColor: "#15b0b7" }}
        />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "#0d0d12" }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "0.5px solid rgba(255,255,255,0.1)",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <p className="font-playfair text-2xl font-bold text-white">
          Access Denied
        </p>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
          You don&apos;t have permission to add chapters to this story.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-80"
          style={{
            background: "rgba(108,78,242,0.25)",
            border: "0.5px solid rgba(108,78,242,0.4)",
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

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
        @keyframes success-pop {
          0% { transform: scale(0.8); opacity:0; }
          60% { transform: scale(1.05); }
          100% { transform: scale(1); opacity:1; }
        }
        @keyframes draft-fade {
          0% { opacity:0; transform:translateY(-6px); }
          15% { opacity:1; transform:translateY(0); }
          80% { opacity:1; }
          100% { opacity:0; }
        }

        .orb-1 { animation: orb-drift 14s ease-in-out infinite alternate; }
        .orb-2 { animation: orb-drift 14s ease-in-out infinite alternate; animation-delay: -5s; }
        .orb-3 { animation: orb-drift 14s ease-in-out infinite alternate; animation-delay: -9s; }
        .card-in { animation: slide-up 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .success-pop { animation: success-pop 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .draft-toast { animation: draft-fade 2.5s ease both; }

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

        .title-input::placeholder { color: rgba(255,255,255,0.18); }

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

        .draft-btn {
          background: rgba(255,255,255,0.06);
          border: 0.5px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.65);
          transition: all 0.15s;
        }
        .draft-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.85);
        }
        .draft-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .draft-item {
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 12px 14px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .draft-item:hover {
          background: rgba(108,78,242,0.1);
          border-color: rgba(108,78,242,0.3);
        }
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

        {/* Draft saved toast */}
        {draftSaved && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 draft-toast">
            <div
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium text-white"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "0.5px solid rgba(255,255,255,0.15)",
                backdropFilter: "blur(12px)",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#15b0b7"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Draft saved
            </div>
          </div>
        )}

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
                Saving…
              </p>
            </div>
          </div>
        )}

        {/* Drafts panel overlay */}
        {showDrafts && (
          <div
            className="fixed inset-0 z-40 flex"
            onClick={() => setShowDrafts(false)}
          >
            <div
              className="ml-auto w-full max-w-[380px] h-full flex flex-col"
              style={{
                background: "#111118",
                borderLeft: "0.5px solid rgba(255,255,255,0.08)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center justify-between px-5 py-4 border-b"
                style={{ borderColor: "rgba(255,255,255,0.07)" }}
              >
                <p className="text-sm font-medium text-white">Saved Drafts</p>
                <button
                  onClick={() => setShowDrafts(false)}
                  className="text-sm transition-opacity hover:opacity-70"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {draftsLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-transparent animate-spin"
                      style={{ borderTopColor: "#6c4ef2" }}
                    />
                  </div>
                ) : myDrafts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <p
                      className="text-sm"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      No drafts for this story yet.
                    </p>
                  </div>
                ) : (
                  myDrafts.map((draft) => (
                    <div
                      key={draft._id}
                      className="draft-item"
                      onClick={() => loadDraftIntoEditor(draft)}
                    >
                      <p className="text-sm font-medium text-white truncate">
                        {draft.title || "Untitled draft"}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "rgba(255,255,255,0.3)" }}
                      >
                        {draft.isMainBranch
                          ? "Main chapter"
                          : `Branch: ${draft.branchTitle || "Untitled"}`}
                        {" · "}
                        {new Date(draft.updatedAt).toLocaleDateString()}
                      </p>
                      {activeDraftId === draft._id && (
                        <span
                          className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: "rgba(108,78,242,0.25)",
                            color: "#957bda",
                            border: "0.5px solid rgba(108,78,242,0.4)",
                          }}
                        >
                          Currently editing
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="relative z-[2] w-full max-w-[1300px] mx-auto px-4 sm:px-8 py-10 sm:py-16">
          <div className="card-in">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-2">
              <div className="flex items-center justify-between">
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
                  {activeDraftId && (
                    <span
                      className="text-xs font-medium px-3 py-1 rounded-full"
                      style={{
                        background: "rgba(21,176,183,0.15)",
                        color: "#15b0b7",
                        border: "0.5px solid rgba(21,176,183,0.3)",
                      }}
                    >
                      Draft
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowDrafts(true);
                    fetchDrafts();
                  }}
                  className="text-xs px-3 py-1.5 rounded-xl transition-all hover:opacity-80"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "0.5px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  View drafts
                </button>
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
              {/* Branch section — read-only, no input */}
              {parentChapterId && (
                <div className="flex flex-col gap-2">
                  <label
                    className="text-xs font-medium tracking-wide uppercase"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    Branching From
                  </label>
                  <div
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                    style={{
                      background: "rgba(21,176,183,0.08)",
                      border: "0.5px solid rgba(21,176,183,0.2)",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#15b0b7"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2L4 7l8 5 8-5-8-5z" />
                      <path d="M4 12l8 5 8-5" />
                      <path d="M4 17l8 5 8-5" />
                    </svg>
                    <span className="font-medium text-white truncate">
                      {parentChapterTitle ?? "Loading..."}
                    </span>
                  </div>
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
              <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
                <p
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.2)" }}
                >
                  {content.replace(/<[^>]*>/g, "").length} characters
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveDraft}
                    disabled={loading || !title.trim()}
                    className="draft-btn font-dm text-sm px-5 py-3 rounded-xl font-medium"
                  >
                    {activeDraftId ? "Update draft" : "Save draft"}
                  </button>
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
      </div>
    </>
  );
}
