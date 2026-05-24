"use client";

import { getSingleStory, UpdateStory } from "@/src/Services/storyApi";
import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function EditStoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const storyId = searchParams.get("id");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [genre, setGenre] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [customGenre, setCustomGenre] = useState("");
  const [branchAllowed, setBranchAllowed] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PRESET_GENRES = ["Fantasy", "Romance", "Sci-Fi", "Horror", "Mystery"];

  // Fetch story data
  useEffect(() => {
    if (!storyId) return;
    const loadStory = async () => {
      setFetching(true);
      setError(null);
      try {
        const data = await getSingleStory(storyId);
        setTitle(data.title ?? "");
        setDescription(data.description ?? "");
        setTags(data.tags ?? []);
        setGenre(data.genre ?? []);
        setBranchAllowed(data.branchAllowed ?? false);
        if (data.cover) {
          setCoverPreview(
            `${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${data.cover}`,
          );
        }
      } catch (err) {
        setError("Failed to load story. Please try again.");
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    loadStory();
  }, [storyId]);

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (coverPreview && coverPreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  const handleSave = async () => {
    if (loading || !storyId) return;
    try {
      setLoading(true);
      await UpdateStory(storyId, {
        title,
        description,
        tags,
        genre,
        branchAllowed,
        cover: coverFile ?? undefined,
      });
      alert("Story updated successfully!");
      router.back();
    } catch (err: unknown) {
      if (err instanceof Error) alert("Error: " + err.message);
      else alert("Unexpected error: " + JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  };

  const addCustomGenre = () => {
    const trimmed = customGenre.trim();
    if (trimmed && !genre.includes(trimmed)) {
      setGenre((prev) => [...prev, trimmed]);
    }
    setCustomGenre("");
  };

  const togglePresetGenre = (g: string) => {
    setGenre((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setCoverFile(file);
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  if (!storyId)
    return (
      <div className="min-h-screen bg-[#0d0d12]">
        <p className="p-10 text-red-400">Missing story ID</p>
      </div>
    );
  if (fetching)
    return (
      <div className="min-h-screen bg-[#0d0d12]">
        <p className="p-10 text-gray-400">Loading story...</p>
      </div>
    );

  return (
    <div className="py-[50px] w-full min-h-screen bg-[#0d0d12] text-gray-100 px-[140px] flex flex-col items-center">
      {error && (
        <div className="rounded-lg bg-red-900/30 border border-red-800 p-4 text-red-300 w-full mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-[26px] w-full">
        <p className="font-semibold text-[20px] text-white">
          Story Information
        </p>

        <div className="flex flex-row w-full h-fit gap-x-[118px]">
          {/* Left: Title, Description, Tags, Genre */}
          <div className="flex flex-col gap-4">
            {/* Story Title */}
            <section className="flex flex-col gap-[9px]">
              <label
                htmlFor="title"
                className="font-semibold text-[15px] text-gray-200"
              >
                Story Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-[#16161e] border border-gray-700 rounded-[7px] w-[660px] h-12 outline-none px-2.5 text-white placeholder-gray-500 focus:border-[#9E77DC] transition-colors"
                placeholder="Enter name of the story..."
              />
            </section>

            {/* Description */}
            <section className="flex flex-col gap-[9px]">
              <label
                htmlFor="description"
                className="font-semibold text-[15px] text-gray-200"
              >
                Short Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-[#16161e] border border-gray-700 rounded-[7px] w-[660px] h-[201px] outline-none px-2.5 resize-none py-2 text-white placeholder-gray-500 focus:border-[#9E77DC] transition-colors"
                placeholder="Please enter a short description or leave it empty..."
              />
            </section>

            {/* Tags */}
            <section className="flex flex-col gap-[9px]">
              <p className="text-[16px] font-semibold text-gray-200">Tags</p>
              <section className="flex flex-row gap-x-[13px] items-center flex-wrap gap-y-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 w-fit h-fit px-5 py-2 text-gray-200 bg-[#1e1e28] border border-gray-800 rounded-[15px]"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() =>
                        setTags((prev) => prev.filter((t) => t !== tag))
                      }
                      className="text-gray-400 hover:text-red-400 ml-1 text-xs transition-colors"
                      aria-label={`Remove ${tag} tag`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="bg-[#16161e] border border-gray-700 rounded-[7px] w-[157px] h-10 outline-none px-2.5 text-white placeholder-gray-500 focus:border-[#9E77DC] transition-colors"
                  placeholder="Add new tags..."
                />
              </section>
            </section>

            {/* Genre */}
            <section className="flex flex-col gap-[9px]">
              <p className="font-semibold text-[15px] text-gray-200">Genre</p>

              {/* Preset checkboxes */}
              <div className="flex flex-row gap-4 flex-wrap">
                {PRESET_GENRES.map((g) => (
                  <label
                    key={g}
                    className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={genre.includes(g)}
                      onChange={() => togglePresetGenre(g)}
                      className="cursor-pointer accent-[#9E77DC] w-4 h-4 bg-[#16161e] border-gray-700 rounded"
                    />
                    <span className="text-[14px]">{g}</span>
                  </label>
                ))}
              </div>

              {/* Custom genre input */}
              <div className="flex flex-col gap-1 mt-2">
                <label
                  htmlFor="customGenre"
                  className="text-[14px] font-medium text-gray-300"
                >
                  Other Genre
                </label>
                <input
                  id="customGenre"
                  type="text"
                  placeholder="Enter custom genre..."
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomGenre();
                    }
                  }}
                  className="bg-[#16161e] border border-gray-700 rounded-[7px] h-10 px-2.5 w-[300px] text-white placeholder-gray-500 focus:border-[#9E77DC] transition-colors"
                />
                {/* Show non-preset genres as removable chips */}
                {genre.filter((g) => !PRESET_GENRES.includes(g)).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {genre
                      .filter((g) => !PRESET_GENRES.includes(g))
                      .map((g) => (
                        <span
                          key={g}
                          className="flex items-center gap-1 w-fit px-5 py-2 text-gray-200 bg-[#1e1e28] border border-gray-800 rounded-[15px] text-sm"
                        >
                          {g}
                          <button
                            type="button"
                            onClick={() =>
                              setGenre((prev) => prev.filter((x) => x !== g))
                            }
                            className="text-gray-400 hover:text-red-400 ml-1 text-xs transition-colors"
                            aria-label={`Remove ${g} genre`}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right: Cover Image */}
          <div className="flex flex-col gap-[9px]">
            <p className="text-[15px] font-semibold text-gray-200">
              Story Cover
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
              id="coverInput"
            />

            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Cover Preview"
                className="w-[620px] h-[301px] object-cover rounded-[7px] border border-gray-700 cursor-pointer transition-opacity hover:opacity-80"
                onClick={() => fileInputRef.current?.click()}
              />
            ) : (
              <label
                htmlFor="coverInput"
                className="flex items-center justify-center w-[620px] h-[301px] border border-gray-700 bg-[#16161e] rounded-[7px] cursor-pointer text-gray-500 hover:bg-[#1e1e28] hover:text-gray-300 transition-colors"
              >
                Click to select cover image
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Branching Option */}
      <div className="w-full h-auto flex flex-col gap-6 mt-12 p-6 bg-[#13131a] rounded-xl shadow-sm border border-gray-800">
        <p className="font-bold text-xl text-[#9E77DC]">Branching Option</p>

        <div className="flex flex-col gap-4">
          <p className="font-semibold text-base text-gray-300">
            Branching setting for this story
          </p>

          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="branchAllowed"
                checked={branchAllowed}
                onChange={(e) => setBranchAllowed(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-[#9E77DC] bg-[#16161e] border-gray-700 rounded"
              />
              <label
                htmlFor="branchAllowed"
                className="text-sm text-gray-400 cursor-pointer select-none hover:text-gray-200 transition-colors"
              >
                Allow other users to create branches from this story
              </label>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <span
                className={`px-4 py-1.5 rounded-full font-semibold text-sm transition-colors ${branchAllowed ? "bg-[#9E77DC] text-white" : "bg-[#1e1e28] text-gray-400"}`}
              >
                {branchAllowed ? "Branching On" : "Branching Off"}
              </span>
              <span className="text-sm text-gray-500">
                {branchAllowed
                  ? "Other users can create branches from this story."
                  : "Only you can write this story."}
              </span>
            </div>
          </section>
        </div>
      </div>

      {/* Submit */}
      <div className="w-full text-right mt-[60px]">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || !title.trim()}
          className="px-8 py-2.5 w-fit h-fit bg-[#2a2a35] hover:bg-[#9E77DC] rounded-[7px] text-[16px] font-semibold text-white disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// Wrap the component that uses useSearchParams in a Suspense boundary
export default function EditStoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0d0d12] flex items-center justify-center p-10 text-gray-400 text-center">
          Loading story editor...
        </div>
      }
    >
      <EditStoryContent />
    </Suspense>
  );
}
