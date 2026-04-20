"use client";

import {
  LikeChapter,
  CommentChapter,
  GetComments,
  ReplyToComment,
  ToggleChapterBookmark,
} from "@/src/Services/storyApi";
import { useEffect, useState } from "react";
import { MdDateRange } from "react-icons/md";
import { FaEye, FaRegBookmark, FaComment, FaBookmark } from "react-icons/fa";
import { FcLike } from "react-icons/fc";
import { PiGitBranch } from "react-icons/pi";
import {
  UpdateChapter,
  DeleteChapter,
  DisableChapter,
  EnableChapter,
} from "@/src/Services/storyApi";

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
  author: string;
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

export default function StoryReaderComponent({
  ChapterContent,
}: StoryReaderProps) {
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [activeReply, setActiveReply] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [chapterBookmarked, setChapterBookmarked] = useState(false);

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

  const handleBookmarkChapter = async () => {
    if (!ChapterContent?._id) return;

    try {
      const res = await ToggleChapterBookmark(ChapterContent._id);
      setChapterBookmarked(res.bookmarked);
    } catch (err) {
      console.error("Bookmark chapter failed:", err);
    }
  };

  if (!ChapterContent) {
    return <div className="p-10 text-red-500">No chapter loaded</div>;
  }

  const isAuthor = ChapterContent.currentUserId === ChapterContent.author;

  const handleUpdateChapter = () => {
    const params = new URLSearchParams({
      chapterId: ChapterContent._id,
      storyId: ChapterContent.storyId,
      title: encodeURIComponent(ChapterContent.title),
      content: encodeURIComponent(ChapterContent.content),
    });
    window.location.href = `/Users/StorychapterEdit?${params.toString()}`;
  };

  const handleDeleteChapter = async () => {
    if (!ChapterContent?._id) return;

    const confirmDelete = confirm(
      "Are you sure? If this chapter has branches, it will be disabled instead.",
    );
    if (!confirmDelete) return;

    try {
      const res = await DeleteChapter(ChapterContent._id);
      alert(res.message);

      // redirect after delete
      window.location.href = `/Users/StoryPreview?id=${ChapterContent.storyId}`;
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisableChapter = async () => {
    if (!ChapterContent?._id) return;

    try {
      const res = await DisableChapter(ChapterContent._id);
      alert(res.message);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- LIKE ----------------
  const handleLike = async () => {
    if (!ChapterContent?._id) return;

    try {
      const res = await LikeChapter(ChapterContent._id);
      setLikes(res.likes);
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  // ---------------- COMMENT ----------------
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

  // ---------------- REPLY ----------------
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

  if (!ChapterContent) {
    return <div className="p-10 text-red-500">No chapter loaded</div>;
  }

  // ---------------- COMMENT ITEM (recursive) ----------------
  const CommentItem = ({
    comment,
    level = 0,
  }: {
    comment: Comment;
    level?: number;
  }) => {
    return (
      <div className="flex flex-col" key={comment._id}>
        <div className="flex gap-3 relative">
          {/* Profile pic */}
          <div
            className={`w-10 h-10 rounded-full bg-[#00B8AE] flex items-center justify-center text-white font-bold flex-shrink-0`}
          >
            {comment.user?.username?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="flex flex-col w-full">
            {/* Header: username + date + dots menu */}
            <div className="flex justify-between items-center relative">
              <span className="font-bold text-black">
                {comment.user?.username}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() =>
                    setActiveMenu(
                      activeMenu === comment._id ? null : comment._id,
                    )
                  }
                  className="text-gray-400 font-bold text-lg"
                >
                  ⋮
                </button>

                {activeMenu === comment._id && (
                  <div className="absolute right-0 top-6 bg-white border rounded shadow-md text-sm z-10">
                    <button
                      onClick={() => {
                        setActiveReply(comment._id);
                        setActiveMenu(null);
                      }}
                      className="px-3 py-1 w-full text-left hover:bg-gray-100"
                    >
                      Reply
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Comment text */}
            <span className="text-sm text-[#837E7E] mt-1">{comment.text}</span>

            {/* Reply input */}
            {activeReply === comment._id && (
              <div className={`flex gap-2 mt-1 ml-${level * 6}`}>
                <input
                  value={replyText[comment._id] || ""}
                  onChange={(e) =>
                    setReplyText((prev) => ({
                      ...prev,
                      [comment._id]: e.target.value,
                    }))
                  }
                  placeholder="Write a reply..."
                  className="flex-1 border px-2 py-1 rounded-sm text-sm"
                />
                <button
                  onClick={() => handleReply(comment._id)}
                  disabled={loading}
                  className="bg-[#00B8AE] text-white px-3 py-1 rounded-sm disabled:opacity-50 text-sm"
                >
                  Reply
                </button>
              </div>
            )}

            {/* Replies */}
            <div className="ml-12 mt-2 flex flex-col gap-2">
              {comment.replies?.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  level={level + 1}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ---------------- MAIN RENDER ----------------
  return (
    <div className="flex flex-col w-full h-full pr-45 pl-10">
      {/* TITLE SECTION */}
      <div className="flex flex-col w-full mt-7 gap-10">
        <div className="flex flex-col gap-9">
          <span className="font-bold text-[48px] leading-[60px] tracking-[-1.2px]">
            {ChapterContent.title}
          </span>
          {isAuthor && (
            <div className="flex gap-2">
              <button
                onClick={handleUpdateChapter}
                className="text-sm px-3 py-1 border rounded hover:bg-gray-100"
              >
                ✏️ Edit
              </button>
              <button
                onClick={handleDisableChapter}
                className="text-sm px-3 py-1 border rounded hover:bg-gray-100"
              >
                🚫 Disable
              </button>
              <button
                onClick={handleDeleteChapter}
                className="text-sm px-3 py-1 border rounded text-red-500 hover:bg-gray-100"
              >
                🗑️ Delete
              </button>
            </div>
          )}

          {/* AUTHOR + TAGS */}
          <div className="flex flex-col gap-5 -mt-3">
            <div className="flex flex-row gap-[23px]">
              <span className="font-bold text-[16px]">
                {ChapterContent.author}
              </span>
              <p>|</p>
              <div className="flex flex-wrap gap-2">
                {ChapterContent.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#F6F3FC] text-xs font-semibold px-4 py-1.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* STATS */}
            <div className="flex flex-row gap-7">
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

        {/* CONTENT */}
        <div className="flex flex-col w-full gap-10">
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: ChapterContent.content }}
          />

          {/* ACTION BUTTONS */}
          <div className="flex flex-col gap-5">
            <hr className="border-[#EBE4E4]" />
            <div className="flex gap-6 text-lg">
              <button
                onClick={handleLike}
                className="flex gap-2 items-center border-2 px-4 py-1 hover:bg-[#00B8AE] border-gray-200 rounded-sm hover:text-white font-semibold transition"
              >
                <FcLike />
                <span>Like</span>
              </button>
              <button
                onClick={handleBookmarkChapter}
                className={`flex gap-2 items-center border-2 px-4 py-1 rounded-sm font-semibold transition ${
                  chapterBookmarked
                    ? "bg-red-100 border-red-200 text-red-700 hover:bg-red-200"
                    : "border-gray-200 hover:bg-[#00B8AE] hover:text-white"
                }`}
              >
                {chapterBookmarked ? <FaBookmark /> : <FaRegBookmark />}
                <span>{chapterBookmarked ? "Bookmarked" : "Bookmark"}</span>
              </button>
              <button
                onClick={() => setShowCommentInput(!showCommentInput)}
                className="flex gap-2 items-center border-2 px-4 py-1 hover:bg-[#00B8AE] border-gray-200 rounded-sm hover:text-white font-semibold transition"
              >
                <FaComment />
                <span>Comment</span>
              </button>
              <button className="flex gap-2 items-center border-2 px-4 py-1 hover:bg-[#00B8AE] border-gray-200 rounded-sm hover:text-white font-semibold transition">
                <PiGitBranch />
                <span>Branch</span>
              </button>
            </div>
            <hr className="border-[#EBE4E4]" />

            <div className="flex flex-row w-full justify-end gap-5">
              <button className="bg-[#00B8AE] font-bold text-white px-4 py-1 rounded-sm text-center">
                previous
              </button>
              <button className="bg-[#00B8AE] font-bold text-white px-4 py-1 rounded-sm text-center">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* COMMENTS SECTION */}
      {showCommentInput && (
        <div className="bg-[#FAFAFB] mt-10 p-5 flex flex-col gap-5">
          <h3 className="font-bold text-lg">Comments ({comments.length})</h3>

          {/* INPUT */}
          <div className="flex gap-3">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border px-3 py-2 rounded-sm"
            />
            <button
              onClick={handleComment}
              disabled={loading}
              className="bg-[#00B8AE] px-4 py-2 text-white rounded-sm disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>

          {/* COMMENTS LIST */}
          <div className="flex flex-col gap-4 mt-4">
            {comments.length === 0 && (
              <span className="text-gray-400">No comments yet.</span>
            )}
            {comments.map((comment) => (
              <CommentItem key={comment._id} comment={comment} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
