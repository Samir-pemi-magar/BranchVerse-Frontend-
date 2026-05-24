"use client";
import React from "react";
import {
  LikeChapter,
  CommentChapter,
  GetComments,
  ReplyToComment,
  ToggleChapterBookmark,
  GetChaptersHierarchy,
} from "@/src/Services/storyApi";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MdDateRange } from "react-icons/md";
import {
  FaEye,
  FaRegBookmark,
  FaComment,
  FaBookmark,
  FaFlag,
  FaPlus,
  FaTrash,
  FaBan,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { FcLike } from "react-icons/fc";
import { PiGitBranch } from "react-icons/pi";
import { DeleteChapter, DisableChapter } from "@/src/Services/storyApi";
import ReportModal from "./Reportmodal";

export interface Comment {
  _id: string;
  text: string;
  createdAt: string;
  user: { username: string };
  replies?: Comment[];
}

export interface Chapter {
  _id: string;
  storyId: string;
  title: string;
  content: string;
  parentChapterId: string | null;
  chapterNumber: number;
  isMainBranch: boolean;
  branchTitle: string | null;
  author: string | { _id: string; username: string };
  likes: number;
  views: number;
  branchCount?: number;
  cover?: string | null;
  tags?: string[];
  createdAt: string;
  currentUserId?: string;
  comments?: Comment[];
  bookmarked?: boolean;
  __v: number;
}

interface StoryReaderProps {
  ChapterContent: Chapter | null;
}

interface SiblingChapter {
  _id: string;
  storyId: string;
  chapterNumber: number;
  isMainBranch: boolean;
  branches?: SiblingChapter[];
}

// ── Toast ─────────────────────────────────────────────────
type ToastType = "success" | "error" | "warning";

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: ToastType;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors: Record<ToastType, string> = {
    success: "bg-emerald-600 border-emerald-500",
    error: "bg-red-600 border-red-500",
    warning: "bg-amber-600 border-amber-500",
  };

  const icons: Record<ToastType, React.ReactNode> = {
    success: <FaCheckCircle className="text-white text-lg shrink-0" />,
    error: <FaExclamationTriangle className="text-white text-lg shrink-0" />,
    warning: <FaExclamationTriangle className="text-white text-lg shrink-0" />,
  };

  return (
    <div
      className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-lg border shadow-2xl text-white text-sm font-medium max-w-sm animate-slide-in ${colors[type]}`}
    >
      {icons[type]}
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="text-white/70 hover:text-white text-lg leading-none ml-2"
      >
        ×
      </button>
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────
function ConfirmModal({
  title,
  description,
  confirmLabel,
  confirmClass,
  icon,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  confirmClass: string;
  icon: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-[#1a1a24] border border-white/10 rounded-xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="text-4xl">{icon}</div>
          <h2 className="text-white font-bold text-lg">{title}</h2>
          <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        </div>
        <div className="flex gap-3 mt-1">
          <button
            onClick={onCancel}
            className="flex-1 border border-white/10 text-gray-300 hover:bg-white/8 rounded-lg py-2 text-sm font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-lg py-2 text-sm font-bold text-white transition ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── helpers ───────────────────────────────────────────────
const getAuthorId = (author: Chapter["author"]): string =>
  typeof author === "object" ? author._id : author;

const getAuthorName = (author: Chapter["author"]): string =>
  typeof author === "object" ? author.username : author;

function collectMainBranch(nodes: SiblingChapter[]): SiblingChapter[] {
  const result: SiblingChapter[] = [];
  for (const node of nodes) {
    if (node.isMainBranch) result.push(node);
    if (node.branches && node.branches.length > 0) {
      result.push(
        ...collectMainBranch(node.branches).filter((c) => c.isMainBranch),
      );
    }
  }
  return result;
}

function buildLineage(
  nodes: SiblingChapter[],
  targetId: string,
  path: SiblingChapter[] = [],
): SiblingChapter[] | null {
  for (const node of nodes) {
    const newPath = [...path, node];
    if (node._id === targetId) return newPath;
    if (node.branches && node.branches.length > 0) {
      const found = buildLineage(node.branches, targetId, newPath);
      if (found) return found;
    }
  }
  return null;
}

// ── CommentItem ───────────────────────────────────────────
function CommentItem({
  comment,
  level = 0,
  activeReply,
  setActiveReply,
  activeMenu,
  setActiveMenu,
  replyText,
  setReplyText,
  loading,
  handleReply,
}: {
  comment: Comment;
  level?: number;
  activeReply: string | null;
  setActiveReply: (id: string | null) => void;
  activeMenu: string | null;
  setActiveMenu: (id: string | null) => void;
  replyText: { [key: string]: string };
  setReplyText: (
    fn: (prev: { [key: string]: string }) => { [key: string]: string },
  ) => void;
  loading: boolean;
  handleReply: (parentId: string) => void;
}) {
  return (
    <div className="flex flex-col" key={comment._id}>
      <div className="flex gap-3 relative">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#00B8AE] flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
          {comment.user?.username?.charAt(0).toUpperCase() || "U"}
        </div>

        <div className="flex flex-col w-full min-w-0">
          <div className="flex justify-between items-center relative">
            <span className="font-bold text-gray-100 text-sm sm:text-base truncate">
              {comment.user?.username}
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-gray-500 hidden sm:inline">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() =>
                  setActiveMenu(activeMenu === comment._id ? null : comment._id)
                }
                className="text-gray-500 hover:text-gray-300 font-bold text-lg transition"
              >
                ⋮
              </button>

              {activeMenu === comment._id && (
                <div className="absolute right-0 top-6 bg-[#1a1a24] border border-white/10 rounded shadow-lg text-sm z-10">
                  <button
                    onClick={() => {
                      setActiveReply(comment._id);
                      setActiveMenu(null);
                    }}
                    className="px-4 py-2 w-full text-left text-gray-300 hover:bg-white/10 transition"
                  >
                    Reply
                  </button>
                </div>
              )}
            </div>
          </div>

          <span className="text-xs text-gray-500 sm:hidden">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>

          <span className="text-sm text-gray-400 mt-1 break-words leading-relaxed">
            {comment.text}
          </span>

          {activeReply === comment._id && (
            <div className="flex gap-2 mt-3">
              <input
                value={replyText[comment._id] || ""}
                onChange={(e) =>
                  setReplyText((prev) => ({
                    ...prev,
                    [comment._id]: e.target.value,
                  }))
                }
                placeholder="Write a reply..."
                className="flex-1 bg-[#1a1a24] border border-white/10 px-3 py-1.5 rounded text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#00B8AE]/60 min-w-0 transition"
              />
              <button
                onClick={() => handleReply(comment._id)}
                disabled={loading}
                className="bg-[#00B8AE] text-white px-3 py-1.5 rounded disabled:opacity-50 text-sm flex-shrink-0 hover:bg-[#009e95] transition"
              >
                Reply
              </button>
            </div>
          )}

          <div className="ml-6 sm:ml-12 mt-3 flex flex-col gap-3">
            {comment.replies?.map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                level={level + 1}
                activeReply={activeReply}
                setActiveReply={setActiveReply}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                replyText={replyText}
                setReplyText={setReplyText}
                loading={loading}
                handleReply={handleReply}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
export default function StoryReaderComponent({
  ChapterContent,
}: StoryReaderProps) {
  const router = useRouter();

  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [activeReply, setActiveReply] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [chapterBookmarked, setChapterBookmarked] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);
  const [prevChapter, setPrevChapter] = useState<SiblingChapter | null>(null);
  const [nextChapter, setNextChapter] = useState<SiblingChapter | null>(null);

  // ── UI feedback state ──
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    type: "delete" | "disable";
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (message: string, type: ToastType = "success") =>
    setToast({ message, type });

  // ── isAuthor check ──
  useEffect(() => {
    if (!ChapterContent?.author) return;
    const userId =
      localStorage.getItem("userId") ?? sessionStorage.getItem("userId");
    setIsAuthor(userId === getAuthorId(ChapterContent.author));
  }, [ChapterContent?.author]);

  // ── Load likes, bookmark, comments ──
  useEffect(() => {
    if (!ChapterContent?._id) return;
    setLikes(ChapterContent.likes ?? 0);
    setChapterBookmarked(ChapterContent.bookmarked ?? false);

    const fetchComments = async () => {
      try {
        const data = await GetComments(ChapterContent._id);
        setComments(data);
      } catch (err) {
        console.error("Failed to load comments:", err);
      }
    };
    fetchComments();
  }, [ChapterContent]);

  // ── Fetch prev/next ──
  useEffect(() => {
    if (!ChapterContent?.storyId || !ChapterContent?._id) return;

    const fetchSiblings = async () => {
      try {
        const hierarchy = await GetChaptersHierarchy(ChapterContent.storyId);
        const mainChapters = collectMainBranch(hierarchy).sort(
          (a, b) => a.chapterNumber - b.chapterNumber,
        );

        let anchorId = ChapterContent._id;
        if (!ChapterContent.isMainBranch) {
          const lineage = buildLineage(hierarchy, ChapterContent._id) ?? [];
          const mainAncestor = lineage.find((c) => c.isMainBranch);
          if (mainAncestor) anchorId = mainAncestor._id;
        }

        const idx = mainChapters.findIndex((c) => c._id === anchorId);
        setPrevChapter(idx > 0 ? mainChapters[idx - 1] : null);
        setNextChapter(
          idx < mainChapters.length - 1 ? mainChapters[idx + 1] : null,
        );
      } catch (err) {
        console.error("Failed to fetch siblings:", err);
      }
    };

    fetchSiblings();
  }, [
    ChapterContent?.storyId,
    ChapterContent?._id,
    ChapterContent?.isMainBranch,
  ]);

  const handleBookmarkChapter = async () => {
    if (!ChapterContent?._id) return;
    try {
      const res = await ToggleChapterBookmark(ChapterContent._id);
      setChapterBookmarked(res.bookmarked);
      showToast(
        res.bookmarked ? "Chapter bookmarked!" : "Bookmark removed.",
        "success",
      );
    } catch (err) {
      console.error("Bookmark chapter failed:", err);
      showToast("Failed to update bookmark.", "error");
    }
  };

  if (!ChapterContent) {
    return <div className="p-10 text-red-400">No chapter loaded</div>;
  }

  const handleUpdateChapter = () => {
    const params = new URLSearchParams({
      chapterId: ChapterContent._id,
      storyId: ChapterContent.storyId,
      title: encodeURIComponent(ChapterContent.title),
      content: encodeURIComponent(ChapterContent.content),
    });
    window.location.href = `/Users/StorychapterEdit?${params.toString()}`;
  };

  const handleDeleteConfirmed = async () => {
    if (!ChapterContent?._id) return;
    setActionLoading(true);
    try {
      const res = await DeleteChapter(ChapterContent._id);
      setConfirmModal(null);
      showToast(res.message ?? "Chapter deleted.", "success");
      setTimeout(() => {
        window.location.href = `/Users/StoryPreview?id=${ChapterContent.storyId}`;
      }, 1800);
    } catch (err) {
      console.error(err);
      setConfirmModal(null);
      showToast("Failed to delete chapter.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisableConfirmed = async () => {
    if (!ChapterContent?._id) return;
    setActionLoading(true);
    try {
      const res = await DisableChapter(ChapterContent._id);
      setConfirmModal(null);
      showToast(res.message ?? "Chapter disabled.", "warning");
      setTimeout(() => {
        window.location.reload();
      }, 1800);
    } catch (err) {
      console.error(err);
      setConfirmModal(null);
      showToast("Failed to disable chapter.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLike = async () => {
    if (!ChapterContent?._id) return;
    try {
      const res = await LikeChapter(ChapterContent._id);
      setLikes(res.likes);
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  const handleComment = async () => {
    if (!ChapterContent?._id || !commentText.trim()) return;
    try {
      setLoading(true);
      await CommentChapter(ChapterContent._id, commentText);
      const updated = await GetComments(ChapterContent._id);
      setComments(updated);
      setCommentText("");
    } catch (err) {
      console.error("Comment failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!ChapterContent?._id || !replyText[parentId]?.trim()) return;
    try {
      setLoading(true);
      const updated = await ReplyToComment(
        ChapterContent._id,
        parentId,
        replyText[parentId],
      );
      setComments(updated);
      setReplyText((prev) => ({ ...prev, [parentId]: "" }));
      setActiveReply(null);
    } catch (err) {
      console.error("Reply failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const actionBtn =
    "flex gap-2 items-center border border-white/10 px-3 sm:px-4 py-1.5 rounded text-sm font-semibold text-gray-300 hover:bg-[#00B8AE] hover:text-white hover:border-[#00B8AE] transition";

  return (
    <div className="flex flex-col w-full h-full px-4 sm:px-8 md:pl-10 md:pr-20 text-gray-100">
      {/* ── Toast ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Confirm Modal ── */}
      {confirmModal?.type === "delete" && (
        <ConfirmModal
          title="Delete this chapter?"
          description="This is permanent. If the chapter has branches it will be disabled instead of deleted."
          confirmLabel={actionLoading ? "Deleting..." : "Yes, Delete"}
          confirmClass="bg-red-600 hover:bg-red-700"
          icon={<FaTrash className="text-red-400" />}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {confirmModal?.type === "disable" && (
        <ConfirmModal
          title="Disable this chapter?"
          description="The chapter will be hidden from readers. You can re-enable it later."
          confirmLabel={actionLoading ? "Disabling..." : "Yes, Disable"}
          confirmClass="bg-amber-600 hover:bg-amber-700"
          icon={<FaBan className="text-amber-400" />}
          onConfirm={handleDisableConfirmed}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {/* ── TITLE SECTION ── */}
      <div className="flex flex-col w-full mt-5 sm:mt-7 gap-6 sm:gap-10">
        <div className="flex flex-col gap-5 sm:gap-9">
          <h1 className="font-bold text-2xl sm:text-4xl md:text-[48px] leading-tight md:leading-[60px] tracking-tight md:tracking-[-1.2px] text-white">
            {ChapterContent.title}
          </h1>

          {/* Author controls */}
          {isAuthor && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleUpdateChapter}
                className="text-sm px-3 py-1.5 border border-white/10 rounded text-gray-300 hover:bg-white/10 transition"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => setConfirmModal({ type: "disable" })}
                className="text-sm px-3 py-1.5 border border-white/10 rounded text-gray-300 hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-500/40 transition"
              >
                🚫 Disable
              </button>
              <button
                onClick={() => setConfirmModal({ type: "delete" })}
                className="text-sm px-3 py-1.5 border border-white/10 rounded text-red-400 hover:bg-red-500/20 transition"
              >
                🗑️ Delete
              </button>
            </div>
          )}

          {/* Author + tags + stats */}
          <div className="flex flex-col gap-4 -mt-1 sm:-mt-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-5">
              <span className="font-bold text-sm sm:text-base text-gray-200">
                {getAuthorName(ChapterContent.author)}
              </span>

              {ChapterContent.tags && ChapterContent.tags.length > 0 && (
                <>
                  <span className="hidden sm:block text-gray-600">|</span>
                  <div className="flex flex-wrap gap-2">
                    {ChapterContent.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-white/8 text-gray-300 text-xs font-semibold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-4 sm:gap-7 text-sm sm:text-base text-gray-400">
              <div className="flex gap-1.5 items-center">
                <FcLike />
                <span>{likes}</span>
              </div>
              <div className="flex gap-1.5 items-center">
                <PiGitBranch />
                <span>{ChapterContent.branchCount ?? 0}</span>
              </div>
              <div className="flex gap-1.5 items-center">
                <FaEye />
                <span>{ChapterContent.views}</span>
              </div>
              <div className="flex gap-1.5 items-center">
                <MdDateRange />
                <span>
                  {new Date(ChapterContent.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="flex flex-col w-full gap-6 sm:gap-10">
          <div
            className="prose prose-invert max-w-none text-sm sm:text-base prose-p:text-gray-300 prose-headings:text-white prose-strong:text-gray-100 prose-a:text-[#00B8AE]"
            dangerouslySetInnerHTML={{ __html: ChapterContent.content }}
          />

          {/* ── ACTION BUTTONS ── */}
          <div className="flex flex-col gap-4 sm:gap-5">
            <hr className="border-white/10" />

            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button onClick={handleLike} className={actionBtn}>
                <FcLike />
                <span>Like</span>
              </button>

              <button
                onClick={handleBookmarkChapter}
                className={
                  chapterBookmarked
                    ? "flex gap-2 items-center border border-red-500/40 px-3 sm:px-4 py-1.5 rounded text-sm font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition"
                    : actionBtn
                }
              >
                {chapterBookmarked ? <FaBookmark /> : <FaRegBookmark />}
                <span>{chapterBookmarked ? "Bookmarked" : "Bookmark"}</span>
              </button>

              <button
                onClick={() => setShowCommentInput(!showCommentInput)}
                className={actionBtn}
              >
                <FaComment />
                <span>Comment</span>
              </button>

              <button
                onClick={() => {
                  if (!ChapterContent?._id) return;
                  window.location.href = `/Users/Storycreate?storyId=${ChapterContent.storyId}&parentChapterId=${ChapterContent._id}`;
                }}
                className={actionBtn}
              >
                <PiGitBranch />
                <span>Branch</span>
              </button>

              {isAuthor && (
                <button
                  onClick={() =>
                    (window.location.href = `/Users/Storycreate?storyId=${ChapterContent.storyId}`)
                  }
                  className="flex gap-2 items-center border border-[#00B8AE]/50 px-3 sm:px-4 py-1.5 rounded text-sm font-semibold text-[#00B8AE] hover:bg-[#00B8AE] hover:text-white transition"
                >
                  <FaPlus />
                  <span>Add Chapter</span>
                </button>
              )}

              {!isAuthor && (
                <button
                  onClick={() => setShowReportModal(true)}
                  className="flex gap-2 items-center border border-white/10 px-3 sm:px-4 py-1.5 rounded text-sm font-semibold text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition"
                >
                  <FaFlag />
                  <span>Report</span>
                </button>
              )}
            </div>

            <hr className="border-white/10" />

            {/* ── Prev / Next ── */}
            <div className="flex flex-row w-full justify-end gap-3 pb-12">
              <button
                disabled={!prevChapter}
                onClick={() =>
                  prevChapter &&
                  router.push(
                    `/Users/StoryReader?storyId=${ChapterContent.storyId}&chapterId=${prevChapter._id}`,
                  )
                }
                className="bg-[#00B8AE] hover:bg-[#009e95] font-bold text-white px-4 py-1.5 rounded text-sm sm:text-base transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={!nextChapter}
                onClick={() =>
                  nextChapter &&
                  router.push(
                    `/Users/StoryReader?storyId=${ChapterContent.storyId}&chapterId=${nextChapter._id}`,
                  )
                }
                className="bg-[#00B8AE] hover:bg-[#009e95] font-bold text-white px-4 py-1.5 rounded text-sm sm:text-base transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── COMMENTS SECTION ── */}
      {showCommentInput && (
        <div className="bg-[#13131a] border border-white/8 mt-6 sm:mt-10 p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 rounded-lg">
          <h3 className="font-bold text-base sm:text-lg text-gray-100">
            Comments ({comments.length})
          </h3>

          <div className="flex gap-2 sm:gap-3">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-[#1a1a24] border border-white/10 px-3 py-2 rounded text-sm sm:text-base text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#00B8AE]/60 min-w-0 transition"
            />
            <button
              onClick={handleComment}
              disabled={loading}
              className="bg-[#00B8AE] hover:bg-[#009e95] px-3 sm:px-4 py-2 text-white rounded disabled:opacity-50 text-sm sm:text-base flex-shrink-0 font-semibold transition"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>

          <div className="flex flex-col gap-5 mt-1">
            {comments.length === 0 && (
              <span className="text-gray-600 text-sm">No comments yet.</span>
            )}
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                activeReply={activeReply}
                setActiveReply={setActiveReply}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                replyText={replyText}
                setReplyText={setReplyText}
                loading={loading}
                handleReply={handleReply}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── REPORT MODAL ── */}
      {showReportModal && (
        <ReportModal
          storyId={ChapterContent.storyId}
          storyTitle={ChapterContent.title}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
