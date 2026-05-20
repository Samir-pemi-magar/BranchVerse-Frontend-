"use client";
import { useEffect, useState, useCallback } from "react";
import {
  GetAllStoriesAdmin,
  AdminDisableStory,
  AdminEnableStory,
  AdminDeleteStory,
  AdminStory,
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

export default function StoriesPage() {
  const [stories, setStories] = useState<AdminStory[]>([]);
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
        const res = await GetAllStoriesAdmin(p, 20, q);
        setStories(res.stories);
        setTotal(res.total);
        setPage(res.page);
        setPages(res.pages);
      } catch {
        setMsg("Failed to load stories.");
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
          Stories
        </h1>
      </div>

      {/* Search bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(1, search)}
          placeholder="Search by title…"
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
      <div className="hidden md:block border border-neutral-800">
        <div className="grid grid-cols-[1.5fr_1fr_90px_200px] px-5 py-3 bg-neutral-900 border-b border-neutral-800 text-[10px] tracking-widest text-neutral-600 uppercase">
          <span>Title</span>
          <span>Author</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="px-5 py-8 text-neutral-600 text-sm">LOADING…</div>
        ) : stories.length === 0 ? (
          <div className="px-5 py-8 text-neutral-600 text-sm">
            NO STORIES FOUND
          </div>
        ) : (
          stories.map((s, i) => (
            <div
              key={s._id}
              className={`grid grid-cols-[1.5fr_1fr_90px_200px] px-5 py-3.5 items-center ${
                i < stories.length - 1 ? "border-b border-neutral-800/60" : ""
              } ${i % 2 === 0 ? "bg-neutral-900" : "bg-neutral-900/60"}`}
            >
              <span className="text-sm text-neutral-200 truncate pr-3">
                {s.title}
              </span>
              <span className="text-xs text-neutral-500">
                {s.author.username}
              </span>
              <Badge disabled={s.disabled} />
              <div className="flex gap-2">
                {s.disabled ? (
                  <Btn
                    label="ENABLE"
                    onClick={() => action(() => AdminEnableStory(s._id), s._id)}
                    disabled={acting === s._id}
                  />
                ) : (
                  <Btn
                    label="DISABLE"
                    onClick={() =>
                      action(() => AdminDisableStory(s._id), s._id)
                    }
                    disabled={acting === s._id}
                  />
                )}
                <Btn
                  label="DELETE"
                  onClick={() => {
                    if (confirm(`Delete "${s.title}"? This cannot be undone.`))
                      action(() => AdminDeleteStory(s._id), s._id);
                  }}
                  danger
                  disabled={acting === s._id}
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
        ) : stories.length === 0 ? (
          <div className="px-5 py-8 text-neutral-600 text-sm border border-neutral-800">
            NO STORIES FOUND
          </div>
        ) : (
          stories.map((s) => (
            <div
              key={s._id}
              className="border border-neutral-800 bg-neutral-900 p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm text-neutral-200 font-medium leading-snug">
                  {s.title}
                </span>
                <Badge disabled={s.disabled} />
              </div>

              <span className="text-xs text-neutral-500">
                <span className="text-neutral-600">Author: </span>
                {s.author.username}
              </span>

              <div className="flex gap-2 pt-1 border-t border-neutral-800">
                {s.disabled ? (
                  <Btn
                    label="ENABLE"
                    onClick={() => action(() => AdminEnableStory(s._id), s._id)}
                    disabled={acting === s._id}
                  />
                ) : (
                  <Btn
                    label="DISABLE"
                    onClick={() =>
                      action(() => AdminDisableStory(s._id), s._id)
                    }
                    disabled={acting === s._id}
                  />
                )}
                <Btn
                  label="DELETE"
                  onClick={() => {
                    if (confirm(`Delete "${s.title}"? This cannot be undone.`))
                      action(() => AdminDeleteStory(s._id), s._id);
                  }}
                  danger
                  disabled={acting === s._id}
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
