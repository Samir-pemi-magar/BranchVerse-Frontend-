import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DisableStory, DeleteStory } from "../Services/storyApi";
import ReportModal from "./Reportmodal";
import { FaEye, FaHeart } from "react-icons/fa";

interface Author {
  _id: string;
  username: string;
  avatar?: string;
}

interface Story {
  _id: string;
  title: string;
  cover: string;
  tags: string[];
  description: string;
  author: Author;
  views: number;
  likes: number;
  branchAllowed: boolean;
  branchesCount: number;
}

interface RecommendedStoryCardProps {
  story: Story;
  currentUserId?: string;
  handleLikeStory?: (id: string) => Promise<void>;
  onDelete?: (id: string) => void;
  onDisable?: (id: string) => void;
  isLiked?: boolean;
}

const RecommendedStorycard: React.FC<RecommendedStoryCardProps> = ({
  story,
  currentUserId,
  onDelete,
  onDisable,
  isLiked = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const router = useRouter();

  const isAuthor =
    String(currentUserId).trim() === String(story.author._id).trim();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
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
    e.preventDefault();
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

  return (
    <>
      {reportOpen && (
        <ReportModal
          storyId={story._id}
          storyTitle={story.title}
          onClose={() => setReportOpen(false)}
        />
      )}

      <Link
        key={story._id}
        href={`/Users/StoryPreview?id=${story._id}`}
        className="bg-white border rounded-xl shadow-md hover:shadow-lg p-3 transition cursor-pointer overflow-hidden flex flex-col"
      >
        {/* Cover image */}
        <div className="relative h-[180px] sm:h-[220px] rounded-lg overflow-hidden">
          <img
            src={`${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${story.cover}`}
            alt={story.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {story.branchAllowed && (
            <div className="absolute top-3 left-3 bg-[#00B8AE] px-2 py-1 rounded text-white text-xs font-semibold z-20">
              Branchable
            </div>
          )}

          {/* ⋮ menu — always visible */}
          <div className="absolute top-3 right-3 z-30">
            <button
              onClick={(e) => {
                e.preventDefault();
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                {isAuthor ? (
                  <>
                    <button
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={(e) => {
                        e.preventDefault();
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
                  </>
                ) : (
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMenuOpen(false);
                      setReportOpen(true);
                    }}
                  >
                    🚩 Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Story info */}
        <div className="mt-3 flex-1 flex flex-col">
          <p className="text-[18px] sm:text-[20px] font-bold text-gray-900 line-clamp-2">
            {story.title}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            By {story.author.username}
          </p>

          <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FaEye />
                <span>{story.views}</span>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <FaHeart
                  className={isLiked ? "text-red-400" : "text-gray-300"}
                />
                <span>{story.likes}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500 flex-wrap">
              <span>{story.branchesCount} Branches</span>
              <div className="flex gap-1 flex-wrap">
                {story.tags.slice(0, 3).map((t: string, i: number) => (
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
      </Link>
    </>
  );
};

export default RecommendedStorycard;
