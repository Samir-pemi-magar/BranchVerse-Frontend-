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
  __v: number;
}

interface SidebarProps {
  coverSrc: string;
  chapterContent: Chapter | null; // you can replace `any` with your `Chapter` type
}

export default function StoryReaderSidebar({
  coverSrc,
  chapterContent,
}: SidebarProps) {
  return (
    <div className="relative w-full h-full rounded overflow-hidden">
      {/* Cover Image */}
      <img
        src={coverSrc}
        alt={chapterContent?.title ?? "cover"}
        className="w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-6 gap-3">
        <span className="text-white font-bold text-lg">Branch Lineage</span>

        {/* Branch items */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center bg-purple-400 rounded px-4 py-2">
            <span className="text-black font-semibold">
              The Melancholy of Haruhi Suzumiya
            </span>
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              Origin
            </span>
          </div>

          <div className="flex justify-between items-center bg-yellow-400 rounded px-4 py-2">
            <span className="text-black font-semibold">
              The Melancholy of Herald
            </span>
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              Thread
            </span>
          </div>

          <div className="flex justify-between items-center bg-cyan-400 rounded px-4 py-2">
            <span className="text-black font-semibold">
              The BranchVerse Anomaly: FYP Project
            </span>
            <span className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full">
              Current
            </span>
          </div>

          <div className="flex justify-between items-center bg-yellow-400 rounded px-4 py-2">
            <span className="text-black font-semibold">FYP Project efvhwb</span>
            <span className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full">
              Branch
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
