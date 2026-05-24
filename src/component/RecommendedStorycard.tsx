import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DisableStory,
  DeleteStory,
  ToggleStoryBookmark,
} from "../Services/storyApi";
import ReportModal from "./Reportmodal";
import { FaEye, FaHeart, FaBookmark, FaRegBookmark } from "react-icons/fa";

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
  onDelete?: (id: string) => void;
  onDisable?: (id: string) => void;
  isBookmarked?: boolean;
}

const RecommendedStorycard: React.FC<RecommendedStoryCardProps> = ({
  story,
  currentUserId,
  onDelete,
  onDisable,
  isBookmarked = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const router = useRouter();

  useEffect(() => {
    setBookmarked(isBookmarked);
  }, [isBookmarked]);

  const isAuthor =
    String(currentUserId).trim() === String(story.author._id).trim();

  const coverSrc = story.cover?.startsWith("http")
    ? story.cover
    : `${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${story.cover}`;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this story?")) return;
    try {
      if (onDelete) await onDelete(story._id);
      else await DeleteStory(story._id);
      setMenuOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete story");
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
      alert(err instanceof Error ? err.message : "Failed to disable story");
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await ToggleStoryBookmark(story._id);
      setBookmarked(res.bookmarked);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <style>{`
        /* ... keep all your existing rc-* styles ... */

        .rc-icon-btn {
          width: 30px; height: 30px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.05);
          border: 0.5px solid rgba(255,255,255,0.08);
          transition: all 0.15s;
        }
        .rc-icon-btn:hover { background: rgba(255,255,255,0.1); }
        .rc-icon-btn.bookmarked {
          background: rgba(21,176,183,0.15);
          border-color: rgba(21,176,183,0.3);
        }
      `}</style>

      {reportOpen && (
        <ReportModal
          storyId={story._id}
          storyTitle={story.title}
          onClose={() => setReportOpen(false)}
        />
      )}

      <Link href={`/Users/StoryPreview?id=${story._id}`} className="rc-root">
        <div className="rc-accent-bar" />

        <div className="rc-img-wrap">
          <img src={coverSrc} alt={story.title} loading="lazy" />
          <div className="rc-img-overlay" />
          {story.branchAllowed && (
            <span className="rc-branch-badge">Branchable</span>
          )}

          <div style={{ position: "absolute", top: 10, right: 10, zIndex: 30 }}>
            <button
              className="rc-menu-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen((p) => !p);
              }}
            >
              ⋮
            </button>
            {menuOpen && (
              <div
                className="rc-dropdown"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                {isAuthor ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/Users/EditStory?id=${story._id}`);
                      }}
                    >
                      Edit
                    </button>
                    <button onClick={handleDisable}>Disable</button>
                    <button className="danger" onClick={handleDelete}>
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    className="danger"
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

        <div className="rc-body">
          <p className="rc-label">✦ Recommended</p>
          <h3 className="rc-title">{story.title}</h3>
          <p className="rc-author">by {story.author.username}</p>

          {story.tags.length > 0 && (
            <div className="rc-tags">
              {story.tags.slice(0, 3).map((t, i) => (
                <span key={i} className="rc-tag">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="rc-footer">
            <div className="rc-stat-row">
              <span className="rc-stat">
                <FaEye style={{ color: "rgba(255,255,255,0.3)" }} />
                {story.views}
              </span>
              <span className="rc-stat">
                <FaHeart
                  style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}
                />
                {story.likes}
              </span>
              <span
                className="rc-stat"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                ⎇ {story.branchesCount}
              </span>
            </div>

            <button
              type="button"
              onClick={handleBookmark}
              className={`rc-icon-btn ${bookmarked ? "bookmarked" : ""}`}
              aria-label="Bookmark story"
            >
              {bookmarked ? (
                <FaBookmark style={{ fontSize: 12, color: "#15b0b7" }} />
              ) : (
                <FaRegBookmark
                  style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}
                />
              )}
            </button>
          </div>
        </div>
      </Link>
    </>
  );
};

export default RecommendedStorycard;
