import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import {
  DisableStory,
  DeleteStory,
  ToggleStoryBookmark,
} from "../Services/storyApi";
import { FaEye } from "react-icons/fa";

// -----------------------
// Interfaces
// -----------------------
interface Story {
  _id: string;
  title: string;
  cover: string;
  description: string;
  createdAt: string;
  branchAllowed: boolean;
  branchesCount: number;
  views: number;
  likes: number;
  tags: string[];
  author: {
    username: string;
    _id: string;
  };
}

interface StoryCardProps {
  story: Story;
  currentUserId?: string;
  handleLikeStory: (id: string) => Promise<void>;
  onDelete?: (id: string) => void;
  onDisable?: (id: string) => void;
}

// -----------------------
// Component
// -----------------------
const StoryCard: React.FC<StoryCardProps> = ({
  story,
  currentUserId,
  handleLikeStory,
  onDelete,
  onDisable,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(false);

  const isAuthor =
    String(currentUserId).trim() === String(story.author._id).trim();

  const timeAgo = (date: string) => {
    const diff = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000,
    );
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this story?")) return;

    try {
      if (onDelete) {
        await onDelete(story._id);
      } else {
        await DeleteStory(story._id);
      }
      setMenuOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      else alert("Failed to delete story");
    }
  };

  const handleDisable = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Do you want to disable this story?")) return;

    try {
      await DisableStory(story._id);
      if (onDisable) await onDisable(story._id);
      setMenuOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      else alert("Failed to disable story");
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const res = await ToggleStoryBookmark(story._id);
      setBookmarked(res.bookmarked);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      onClick={() => router.push(`/Users/StoryPreview?id=${story._id}`)}
      className="bg-white border rounded-xl shadow-sm hover:shadow-lg transition cursor-pointer overflow-hidden flex flex-col relative"
    >
      {/* Cover Image */}
      <div className="relative h-[200px]">
        <img
          src={`${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${story.cover}`}
          alt={story.title}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* Branchable Badge */}
        {story.branchAllowed && (
          <div className="absolute top-3 left-3 z-20 bg-[#00B8AE] px-2 py-1 rounded text-white text-xs font-semibold">
            Branchable
          </div>
        )}

        {/* Author Menu */}
        {isAuthor && (
          <div className="absolute top-3 right-3 z-30">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              className="text-white bg-black/40 px-2 py-1 rounded-md font-bold text-xl"
            >
              ⋮
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-36 bg-white border rounded shadow-lg z-40"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/Users/EditStory?id=${story._id}`);
                  }}
                >
                  Edit
                </button>

                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={handleDisable}
                >
                  Disable
                </button>

                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Story Info */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
          {story.title}
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          By {story.author.username} • {timeAgo(story.createdAt)}
        </p>

        <p className="text-sm text-gray-600 mt-3 line-clamp-3">
          {story.description}
        </p>

        {/* Stats */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaEye />
              <span>{story.views}</span>
            </div>

            <div
              className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleLikeStory(story._id);
              }}
            >
              ❤️ <span>{story.likes}</span>
            </div>

            <button
              type="button"
              onClick={handleBookmark}
              aria-label="Bookmark story"
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#00B8AE]/50 active:bg-gray-200 ${
                bookmarked
                  ? "text-red-500 bg-red-50 hover:bg-red-100"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500">
              {story.branchesCount} branches
            </div>

            <div className="flex gap-1">
              {story.tags.slice(0, 3).map((t, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryCard;
