"use client";

import { useEffect, useState, useMemo } from "react";
import { GetChaptersHierarchy } from "../Services/storyApi";

export interface Chapter {
  _id: string;
  storyId: string;
  title: string;
  content?: string;
  parentChapterId: string | null;
  chapterNumber: number;
  isMainBranch: boolean;
  branchTitle: string | null;
  author?: string;
  likes?: number;
  views?: number;
  createdAt?: string;
}

interface HierarchyChapter extends Chapter {
  branches?: HierarchyChapter[];
}

interface SidebarProps {
  coverSrc: string;
  chapterContent: Chapter | null;
}

export default function StoryReaderSidebar({
  coverSrc,
  chapterContent,
}: SidebarProps) {
  const [hierarchy, setHierarchy] = useState<HierarchyChapter[]>([]);

  useEffect(() => {
    if (!chapterContent?.storyId) return;

    const fetchHierarchy = async () => {
      try {
        const data = await GetChaptersHierarchy(chapterContent.storyId);
        setHierarchy(data);
      } catch (err) {
        console.error("Failed to load hierarchy", err);
      }
    };

    fetchHierarchy();
  }, [chapterContent?.storyId]);

  const lineage = useMemo(() => {
    if (!chapterContent || hierarchy.length === 0) return [];

    const buildLineage = (
      nodes: HierarchyChapter[],
      targetId: string,
      path: Chapter[] = [],
    ): Chapter[] | null => {
      for (const node of nodes) {
        const newPath = [...path, node];
        if (node._id === targetId) return newPath;
        if (node.branches && node.branches.length > 0) {
          const found = buildLineage(node.branches, targetId, newPath);
          if (found) return found;
        }
      }
      return null;
    };

    return buildLineage(hierarchy, chapterContent._id) ?? [];
  }, [chapterContent, hierarchy]);

  return (
    <div className="relative w-full h-full min-h-[280px] sm:min-h-[400px] rounded overflow-hidden">
      {/* Cover Image */}
      <img
        src={coverSrc}
        alt={chapterContent?.title ?? "cover"}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/images/placeholder-cover.png";
        }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4 sm:p-6 gap-3">
        <span className="text-white font-bold text-base sm:text-lg">
          Branch Lineage
        </span>

        <div className="flex flex-col gap-2 max-h-[40vh] sm:max-h-[60vh] overflow-y-auto pr-1">
          {lineage.length === 0 && (
            <span className="text-white/60 text-sm">Loading lineage...</span>
          )}

          {lineage.map((chapter, index) => {
            const isOrigin = index === 0;
            const isCurrent = chapter._id === chapterContent?._id;
            const isLast = index === lineage.length - 1;

            return (
              <div
                key={chapter._id}
                className={`flex justify-between items-center rounded px-3 sm:px-4 py-2 gap-2 transition ${
                  isCurrent
                    ? "bg-cyan-400"
                    : isOrigin
                      ? "bg-purple-400"
                      : "bg-yellow-400"
                }`}
              >
                <span className="text-black font-semibold text-xs sm:text-sm truncate min-w-0">
                  {chapter.branchTitle || chapter.title}
                </span>

                <span
                  className={`text-white text-xs px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0 ${
                    isOrigin
                      ? "bg-red-500"
                      : isLast
                        ? "bg-teal-500"
                        : "bg-orange-500"
                  }`}
                >
                  {isOrigin ? "Origin" : isCurrent ? "Current" : "Thread"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
