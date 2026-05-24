import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DisableStory, DeleteStory } from "../Services/storyApi";
import ReportModal from "./Reportmodal";
import { FaEye, FaHeart, FaRegHeart } from "react-icons/fa";

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
  handleLikeStory,
  onDelete,
  onDisable,
  isLiked = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [liked, setLiked] = useState(isLiked);
  const router = useRouter();

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

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked((p) => !p);
    if (handleLikeStory) await handleLikeStory(story._id);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500;600&display=swap');

        .rc-root {
          background: rgba(255,255,255,0.03);
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.22s cubic-bezier(0.22,1,0.36,1);
          position: relative;
        }
        .rc-root:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(21,176,183,0.3);
          transform: translateY(-4px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(21,176,183,0.2);
        }

        .rc-img-wrap {
          position: relative;
          height: 200px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .rc-img-wrap img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.4s cubic-bezier(0.22,1,0.36,1);
        }
        .rc-root:hover .rc-img-wrap img { transform: scale(1.05); }

        .rc-img-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(13,13,18,0.85) 0%, rgba(13,13,18,0.1) 55%, transparent 100%);
        }

        /* "Recommended" badge — teal accent strip on left edge */
        .rc-accent-bar {
          position: absolute; top: 0; left: 0; bottom: 0; width: 3px;
          background: linear-gradient(to bottom, #6c4ef2, #15b0b7);
        }

        .rc-branch-badge {
          position: absolute; top: 10px; left: 10px; z-index: 10;
          padding: 3px 10px; border-radius: 999px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
          color: white;
          background: linear-gradient(130deg, #6c4ef2, #15b0b7);
        }

        .rc-menu-btn {
          position: absolute; top: 10px; right: 10px; z-index: 20;
          width: 30px; height: 30px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
          color: white; font-size: 18px; font-weight: 700; line-height: 1;
          border: 0.5px solid rgba(255,255,255,0.15);
          transition: background 0.15s;
        }
        .rc-menu-btn:hover { background: rgba(0,0,0,0.75); }

        .rc-dropdown {
          position: absolute; right: 0; top: calc(100% + 6px);
          width: 148px;
          background: rgba(20,18,30,0.97);
          border: 0.5px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 12px 32px rgba(0,0,0,0.6);
          z-index: 50;
        }
        .rc-dropdown button {
          display: block; width: 100%;
          padding: 10px 14px;
          text-align: left; font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.7); background: transparent;
          transition: background 0.12s, color 0.12s;
        }
        .rc-dropdown button:hover { background: rgba(255,255,255,0.07); color: white; }
        .rc-dropdown button.danger { color: rgba(239,68,68,0.8); }
        .rc-dropdown button.danger:hover { background: rgba(239,68,68,0.1); color: #ef4444; }

        .rc-body { padding: 14px 16px 16px 18px; display: flex; flex-direction: column; flex: 1; }

        .rc-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          color: #15b0b7; margin-bottom: 6px;
        }
        .rc-title {
  font-family: 'Playfair Display', serif;
  font-weight: 700; font-size: 17px; line-height: 1.3;
  color: white;
  /* Added display property here to trigger the clamp mechanics */
  display: -webkit-box; 
  -webkit-line-clamp: 2; 
  -webkit-box-orient: vertical; 
  overflow: hidden;
}
        .rc-author { font-size: 12px; margin-top: 4px; color: rgba(255,255,255,0.35); }

        .rc-tags { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 8px; }
        .rc-tag {
          padding: 2px 8px; border-radius: 999px;
          font-size: 10px; font-weight: 600;
          background: rgba(21,176,183,0.12); border: 0.5px solid rgba(21,176,183,0.25);
          color: #15b0b7;
        }

        .rc-footer {
          margin-top: auto; padding-top: 12px;
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
        }
        .rc-stat-row { display: flex; align-items: center; gap: 10px; }
        .rc-stat { display: flex; align-items: center; gap: 4px; font-size: 12px; color: rgba(255,255,255,0.4); }

        .rc-like-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 5px 12px; border-radius: 8px; font-size: 12px; font-weight: 600;
          background: rgba(255,255,255,0.05); border: 0.5px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5);
          transition: all 0.15s;
        }
        .rc-like-btn:hover { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.25); color: #ef4444; }
        .rc-like-btn.liked { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.35); color: #ef4444; }
      `}</style>

      {reportOpen && (
        <ReportModal
          storyId={story._id}
          storyTitle={story.title}
          onClose={() => setReportOpen(false)}
        />
      )}

      <Link href={`/Users/StoryPreview?id=${story._id}`} className="rc-root">
        {/* Left accent bar */}
        <div className="rc-accent-bar" />

        {/* Cover */}
        <div className="rc-img-wrap">
          <img src={coverSrc} alt={story.title} loading="lazy" />
          <div className="rc-img-overlay" />
          {story.branchAllowed && (
            <span className="rc-branch-badge">Branchable</span>
          )}

          {/* Menu */}
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

        {/* Body */}
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
              <span
                className="rc-stat"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                ⎇ {story.branchesCount}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLike}
              className={`rc-like-btn ${liked ? "liked" : ""}`}
              aria-label="Like story"
            >
              {liked ? (
                <FaHeart style={{ fontSize: 11 }} />
              ) : (
                <FaRegHeart style={{ fontSize: 11 }} />
              )}
              <span>{story.likes}</span>
            </button>
          </div>
        </div>
      </Link>
    </>
  );
};

export default RecommendedStorycard;
