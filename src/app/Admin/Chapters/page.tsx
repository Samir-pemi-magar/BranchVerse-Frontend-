"use client";
import { useEffect, useState, useCallback } from "react";
import {
  GetAllChaptersAdmin,
  AdminDisableChapter,
  AdminEnableChapter,
  AdminDeleteChapter,
  AdminChapter,
} from "@/src/Services/adminApi";

const Badge = ({ disabled }: { disabled: boolean }) => (
  <span
    className={`text-[10px] tracking-wider px-2 py-0.5 border ${
      disabled
        ? "bg-red-950/40 text-red-400 border-red-900"
        : "bg-green-950/40 text-green-400 border-green-900"
    }`}
  >
    {disabled ? "DISABLED" : "ACTIVE"}
  </span>
);

const BranchBadge = ({ isMain }: { isMain: boolean }) => (
  <span
    className={`text-[10px] tracking-wider px-2 py-0.5 border ${
      isMain
        ? "bg-blue-950/40 text-blue-400 border-blue-900"
        : "bg-neutral-800 text-neutral-500 border-neutral-700"
    }`}
  >
    {isMain ? "MAIN" : "BRANCH"}
  </span>
);

const Btn = ({
  label,
  onClick,
  danger = false,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-3 py-1 text-[11px] tracking-wider border transition-colors font-mono ${
      disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
    } ${
      danger
        ? "border-red-900 text-red-400 hover:text-red-300 hover:border-red-500"
        : "border-neutral-700 text-neutral-400 hover:text-neutral-100 hover:border-neutral-500"
    }`}
  >
    {label}
  </button>
);

export default function ChaptersPage() {
  const [chapters, setChapters] = useState<AdminChapter[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(
    async (p = 1, q = search) => {
      setLoading(true);
      try {
        const res = await GetAllChaptersAdmin(p, 20, q);
        setChapters(res.chapters);
        setTotal(res.total);
        setPage(res.page);
        setPages(res.pages);
      } catch {
        setMsg("Failed to load chapters.");
      } finally {
        setLoading(false);
      }
    },
    [search],
  );

  useEffect(() => {
    load(1, search);
  }, []);

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 3000);
  };

  const action = async (fn: () => Promise<{ msg: string }>, id: string) => {
    setActing(id);
    try {
      const r = await fn();
      flash(r.msg);
      load(page, search);
    } catch (e: unknown) {
      flash(
        typeof e === "object" && e !== null && "msg" in e
          ? (e as { msg: string }).msg
          : "Error",
      );
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8 sm:mb-10">
        <p className="text-xs tracking-widest text-neutral-500 mb-2 uppercase">
          Moderation
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Chapters
        </h1>
      </div>

      {/* Search bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(1, search)}
          placeholder="Search by title or story…"
          className="flex-1 min-w-0 px-4 py-2.5 bg-neutral-900 border border-neutral-700 text-neutral-200 text-sm font-mono placeholder:text-neutral-600 outline-none focus:border-neutral-500 transition-colors"
        />
        <button
          onClick={() => load(1, search)}
          className="px-5 py-2.5 bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs tracking-widest hover:border-neutral-500 hover:text-neutral-100 transition-colors font-mono shrink-0"
        >
          SEARCH
        </button>
        <span className="w-full sm:w-auto sm:ml-auto text-xs text-neutral-600">
          {total} total
        </span>
      </div>

      {msg && (
        <div className="text-sm text-neutral-300 mb-4 px-4 py-2.5 border border-neutral-700 bg-neutral-900">
          {msg}
        </div>
      )}

      {/* Desktop table — hidden on mobile */}
      <div className="hidden md:block border border-neutral-800 overflow-hidden">
        <div className="grid grid-cols-[1.2fr_1fr_0.8fr_80px_90px_180px] px-5 py-3 bg-neutral-900 border-b border-neutral-800 text-[10px] tracking-widest text-neutral-600 uppercase">
          <span>Chapter Title</span>
          <span>Story</span>
          <span>Author</span>
          <span>Type</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="px-5 py-8 text-neutral-600 text-sm">LOADING…</div>
        ) : chapters.length === 0 ? (
          <div className="px-5 py-8 text-neutral-600 text-sm">
            NO CHAPTERS FOUND
          </div>
        ) : (
          chapters.map((c, i) => (
            <div
              key={c._id}
              className={`grid grid-cols-[1.2fr_1fr_0.8fr_80px_90px_180px] px-5 py-3.5 items-center ${
                i < chapters.length - 1 ? "border-b border-neutral-800/60" : ""
              } ${i % 2 === 0 ? "bg-neutral-900" : "bg-neutral-900/60"}`}
            >
              <span className="text-sm text-neutral-200 truncate pr-3">
                {c.title}
              </span>
              <span className="text-xs text-neutral-500 truncate pr-3">
                {c.storyId?.title ?? "—"}
              </span>
              <span className="text-xs text-neutral-500">
                {c.author.username}
              </span>
              <BranchBadge isMain={c.isMainBranch} />
              <Badge disabled={c.disabled} />
              <div className="flex gap-2">
                {c.disabled ? (
                  <Btn
                    label="ENABLE"
                    onClick={() =>
                      action(() => AdminEnableChapter(c._id), c._id)
                    }
                    disabled={acting === c._id}
                  />
                ) : (
                  <Btn
                    label="DISABLE"
                    onClick={() =>
                      action(() => AdminDisableChapter(c._id), c._id)
                    }
                    disabled={acting === c._id}
                  />
                )}
                <Btn
                  label="DELETE"
                  onClick={() => {
                    if (confirm(`Delete "${c.title}"? This cannot be undone.`))
                      action(() => AdminDeleteChapter(c._id), c._id);
                  }}
                  danger
                  disabled={acting === c._id}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mobile cards — hidden on desktop */}
      <div className="md:hidden flex flex-col gap-3">
        {loading ? (
          <div className="px-5 py-8 text-neutral-600 text-sm border border-neutral-800">
            LOADING…
          </div>
        ) : chapters.length === 0 ? (
          <div className="px-5 py-8 text-neutral-600 text-sm border border-neutral-800">
            NO CHAPTERS FOUND
          </div>
        ) : (
          chapters.map((c) => (
            <div
              key={c._id}
              className="border border-neutral-800 bg-neutral-900 p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm text-neutral-200 font-medium leading-snug">
                  {c.title}
                </span>
                <div className="flex gap-1.5 shrink-0">
                  <BranchBadge isMain={c.isMainBranch} />
                  <Badge disabled={c.disabled} />
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-neutral-500">
                  <span className="text-neutral-600">Story: </span>
                  {c.storyId?.title ?? "—"}
                </span>
                <span className="text-xs text-neutral-500">
                  <span className="text-neutral-600">Author: </span>
                  {c.author.username}
                </span>
              </div>

              <div className="flex gap-2 pt-1 border-t border-neutral-800">
                {c.disabled ? (
                  <Btn
                    label="ENABLE"
                    onClick={() =>
                      action(() => AdminEnableChapter(c._id), c._id)
                    }
                    disabled={acting === c._id}
                  />
                ) : (
                  <Btn
                    label="DISABLE"
                    onClick={() =>
                      action(() => AdminDisableChapter(c._id), c._id)
                    }
                    disabled={acting === c._id}
                  />
                )}
                <Btn
                  label="DELETE"
                  onClick={() => {
                    if (confirm(`Delete "${c.title}"? This cannot be undone.`))
                      action(() => AdminDeleteChapter(c._id), c._id);
                  }}
                  danger
                  disabled={acting === c._id}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex flex-wrap gap-1 mt-5 justify-end">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => load(p, search)}
              className={`w-8 h-8 text-xs font-mono transition-colors ${
                p === page
                  ? "bg-neutral-700 border border-neutral-500 text-white"
                  : "bg-transparent border border-neutral-800 text-neutral-600 hover:border-neutral-600 hover:text-neutral-400"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
