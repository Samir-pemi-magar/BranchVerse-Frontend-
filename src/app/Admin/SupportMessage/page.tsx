"use client";
import { useEffect, useState, useCallback } from "react";
import adminAxios from "@/src/Services/adminAxios"; // Swapped to your custom authorized admin instance

type IssueType =
  | "Bug or error"
  | "Inappropriate content"
  | "Account problem"
  | "Feature request"
  | "Other";

interface SupportMessage {
  _id: string;
  issueType: IssueType;
  message: string;
  storyId?: string | null;
  storyTitle?: string | null;
  read: boolean;
  createdAt: string;
}

interface ApiResponse {
  messages: SupportMessage[];
  total: number;
  page: number;
  pages: number;
}

const ISSUE_COLORS: Record<IssueType, { bg: string; text: string }> = {
  "Bug or error": { bg: "bg-red-950/40", text: "text-red-400" },
  "Inappropriate content": { bg: "bg-orange-950/40", text: "text-orange-400" },
  "Account problem": { bg: "bg-yellow-950/40", text: "text-yellow-400" },
  "Feature request": { bg: "bg-blue-950/40", text: "text-blue-400" },
  Other: { bg: "bg-neutral-800", text: "text-neutral-400" },
};

const ISSUE_ICONS: Record<IssueType, string> = {
  "Bug or error": "🐛",
  "Inappropriate content": "🚩",
  "Account problem": "🔑",
  "Feature request": "💡",
  Other: "📝",
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function SupportMessage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selected, setSelected] = useState<SupportMessage | null>(null);
  const [markingRead, setMarkingRead] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
        ...(unreadOnly ? { unread: "true" } : {}),
      });
      // Updated to adminAxios to include JWT authorization header
      const res = await adminAxios.get(`/api/admin/support?${params}`);
      setData(res.data);
    } catch {
      setError("Failed to load support messages.");
    } finally {
      setLoading(false);
    }
  }, [page, unreadOnly]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkRead = async (id: string) => {
    setMarkingRead(id);
    try {
      // Updated to adminAxios to include JWT authorization header
      await adminAxios.patch(`/api/admin/support/${id}/read`);
      setData((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.map((m) =>
                m._id === id ? { ...m, read: true } : m,
              ),
            }
          : prev,
      );
      if (selected?._id === id) {
        setSelected((prev) => (prev ? { ...prev, read: true } : prev));
      }
    } catch {
      // silently fail
    } finally {
      setMarkingRead(null);
    }
  };

  const unreadCount = data?.messages.filter((m) => !m.read).length ?? 0;

  return (
    <div className="space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-widest text-neutral-500 uppercase mb-1">
            Moderation
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Support Messages
          </h1>
        </div>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-xs text-red-400 font-medium">
              {unreadCount} unread
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-400 text-sm px-4 py-3 rounded-lg border border-red-900/50 bg-red-950/20">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setUnreadOnly(false);
            setPage(1);
          }}
          className={`text-xs tracking-widest px-4 py-2 border transition-colors ${
            !unreadOnly
              ? "border-white text-white bg-neutral-800"
              : "border-neutral-700 text-neutral-500 hover:border-neutral-500 hover:text-neutral-300"
          }`}
        >
          ALL
        </button>
        <button
          onClick={() => {
            setUnreadOnly(true);
            setPage(1);
          }}
          className={`text-xs tracking-widest px-4 py-2 border transition-colors ${
            unreadOnly
              ? "border-white text-white bg-neutral-800"
              : "border-neutral-700 text-neutral-500 hover:border-neutral-500 hover:text-neutral-300"
          }`}
        >
          UNREAD
        </button>

        <button
          onClick={load}
          disabled={loading}
          className="ml-auto text-xs tracking-widest px-4 py-2 border border-neutral-700 text-neutral-500 hover:border-neutral-500 hover:text-neutral-300 transition-colors disabled:opacity-40"
        >
          {loading ? "LOADING…" : "REFRESH"}
        </button>
      </div>

      {/* Main layout — list + detail panel */}
      <div className="flex gap-4 min-h-[500px]">
        {/* Message list */}
        <div
          className={`flex flex-col gap-2 ${selected ? "w-1/2" : "w-full"} transition-all`}
        >
          {loading && !data ? (
            <div className="flex items-center gap-2 text-neutral-600 text-sm mt-8">
              <div className="w-4 h-4 rounded-full border-2 border-neutral-700 border-t-neutral-400 animate-spin" />
              Loading messages…
            </div>
          ) : data?.messages.length === 0 ? (
            <div className="text-neutral-600 text-sm mt-8 text-center py-16 border border-dashed border-neutral-800 rounded-xl">
              No messages found.
            </div>
          ) : (
            data?.messages.map((msg) => {
              const colors = ISSUE_COLORS[msg.issueType] ?? ISSUE_COLORS.Other;
              const isActive = selected?._id === msg._id;
              return (
                <button
                  key={msg._id}
                  onClick={() => setSelected(isActive ? null : msg)}
                  className={`w-full text-left rounded-lg border px-4 py-3 transition-all group ${
                    isActive
                      ? "bg-neutral-800 border-neutral-600"
                      : msg.read
                        ? "bg-neutral-900 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/60"
                        : "bg-neutral-900 border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800/60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Unread dot */}
                    <div className="mt-1.5 shrink-0">
                      {!msg.read ? (
                        <span className="w-2 h-2 rounded-full bg-blue-400 block" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-neutral-700 block" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Top row */}
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`text-[10px] tracking-wide px-2 py-0.5 rounded font-medium ${colors.bg} ${colors.text}`}
                        >
                          {ISSUE_ICONS[msg.issueType]} {msg.issueType}
                        </span>
                        {msg.storyTitle && (
                          <span className="text-[10px] text-neutral-500 truncate max-w-[140px]">
                            re: {msg.storyTitle}
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-600 ml-auto shrink-0">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>

                      {/* Message preview */}
                      <p className="text-sm text-neutral-300 line-clamp-2 leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}

          {/* Pagination */}
          {data && data.pages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-neutral-800 mt-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="text-xs tracking-widest px-4 py-2 border border-neutral-700 text-neutral-500 hover:border-neutral-500 hover:text-neutral-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← PREV
              </button>
              <span className="text-xs text-neutral-600">
                page {data.page} of {data.pages} &middot; {data.total} total
              </span>
              <button
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
                className="text-xs tracking-widest px-4 py-2 border border-neutral-700 text-neutral-500 hover:border-neutral-500 hover:text-neutral-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                NEXT →
              </button>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-1/2 shrink-0">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 sticky top-4 space-y-5">
              {/* Panel header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] tracking-widest text-neutral-500 uppercase mb-1.5">
                    Message detail
                  </p>
                  <span
                    className={`text-xs tracking-wide px-2 py-1 rounded font-medium ${
                      ISSUE_COLORS[selected.issueType]?.bg ?? "bg-neutral-800"
                    } ${
                      ISSUE_COLORS[selected.issueType]?.text ??
                      "text-neutral-400"
                    }`}
                  >
                    {ISSUE_ICONS[selected.issueType]} {selected.issueType}
                  </span>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-neutral-600 hover:text-neutral-300 text-lg leading-none mt-0.5 transition-colors"
                  aria-label="Close detail"
                >
                  ✕
                </button>
              </div>

              {/* Meta */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Received</span>
                  <span className="text-neutral-300">
                    {formatDate(selected.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Status</span>
                  <span
                    className={
                      selected.read ? "text-neutral-500" : "text-blue-400"
                    }
                  >
                    {selected.read ? "Read" : "Unread"}
                  </span>
                </div>
                {selected.storyTitle && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-neutral-500 shrink-0">Story</span>
                    <span className="text-neutral-300 text-right truncate">
                      {selected.storyTitle}
                    </span>
                  </div>
                )}
                {selected.storyId && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-neutral-500 shrink-0">Story ID</span>
                    <span className="text-neutral-600 font-mono text-[10px] text-right truncate">
                      {selected.storyId}
                    </span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-neutral-800" />

              {/* Message body */}
              <div>
                <p className="text-[10px] tracking-widest text-neutral-500 uppercase mb-2">
                  Message
                </p>
                <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </p>
              </div>

              {/* Actions */}
              {!selected.read && (
                <button
                  onClick={() => handleMarkRead(selected._id)}
                  disabled={markingRead === selected._id}
                  className="w-full py-2.5 text-xs tracking-widest border border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200 transition-colors disabled:opacity-40"
                >
                  {markingRead === selected._id ? "MARKING…" : "MARK AS READ"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
