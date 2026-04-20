"use client";

import { getSingleStory, UpdateStory } from "@/src/Services/storyApi";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function EditStoryPage() {
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
  const [showConfirm, setShowConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PRESET_GENRES = ["Fantasy", "Romance", "Sci-Fi", "Horror", "Mystery"];

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

  const handleSave = async (branchOverride?: boolean) => {
    if (loading || !storyId) return;
    const finalBranchAllowed = branchOverride ?? branchAllowed;
    try {
      setLoading(true);
      await UpdateStory(storyId, {
        title,
        description,
        tags,
        genre,
        branchAllowed: finalBranchAllowed,
        cover: coverFile ?? undefined,
      });
      alert("Story updated successfully!");
      router.back();
    } catch (err: unknown) {
      if (err instanceof Error) alert("Error: " + err.message);
      else alert("Unexpected error: " + JSON.stringify(err));
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed))
      setTags((prev) => [...prev, trimmed]);
    setTagInput("");
  };

  const addCustomGenre = () => {
    const trimmed = customGenre.trim();
    if (trimmed && !genre.includes(trimmed))
      setGenre((prev) => [...prev, trimmed]);
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
    if (file) setCoverPreview(URL.createObjectURL(file));
  };

  if (!storyId) return <p className="p-10 text-red-500">Missing story ID</p>;
  if (fetching) return <p className="p-10 text-gray-700">Loading story...</p>;

  return (
    <>
      <div className="py-[50px] w-full h-auto bg-white px-[140px] flex flex-col items-center">
        {error && (
          <div className="rounded-lg bg-red-100 p-4 text-red-700 w-full mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-[26px] w-full">
          <p className="font-semibold text-[20px]">Story Information</p>

          <div className="flex flex-row w-full h-fit gap-x-[118px]">
            {/* Left: Title, Description, Tags, Genre */}
            <div className="flex flex-col gap-4">
              {/* Story Title */}
              <section className="flex flex-col gap-[9px]">
                <p className="font-semibold text-[15px]">Story Title</p>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border border-[#A7A3A3]/49 rounded-[7px] w-[660px] h-12 outline-none px-2.5"
                  placeholder="Enter name of the story..."
                />
              </section>

              {/* Description */}
              <section className="flex flex-col gap-[9px]">
                <p className="font-semibold text-[15px]">Short Description</p>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border border-[#A7A3A3]/49 rounded-[7px] w-[660px] h-[201px] outline-none px-2.5 resize-none"
                  placeholder="Please enter a short description or leave it empty..."
                />
              </section>

              {/* Tags */}
              <section className="flex flex-col gap-[9px]">
                <p className="text-[16px] font-semibold">Tags</p>
                <section className="flex flex-row gap-x-[13px] items-center flex-wrap gap-y-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 w-fit h-fit px-5 py-2 text-black bg-[#F6F3FC] rounded-[15px]"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() =>
                          setTags((prev) => prev.filter((t) => t !== tag))
                        }
                        className="text-gray-300 hover:text-red-400 ml-1 text-xs"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                    className="border border-[#A7A3A3]/49 rounded-[7px] w-[157px] h-10 outline-none px-2.5"
                    placeholder="Add new tags..."
                  />
                </section>
              </section>

              {/* Genre */}
              <section className="flex flex-col gap-[9px]">
                <p className="font-semibold text-[15px]">Genre</p>

                {/* Preset checkboxes */}
                <div className="flex flex-row gap-4 flex-wrap">
                  {PRESET_GENRES.map((g) => (
                    <label key={g} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={genre.includes(g)}
                        onChange={() => togglePresetGenre(g)}
                      />
                      <span className="text-[14px]">{g}</span>
                    </label>
                  ))}
                </div>

                {/* Custom genre input */}
                <div className="flex flex-col gap-1 mt-2">
                  <p className="text-[14px] font-medium">Other Genre</p>
                  <input
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
                    className="border border-[#A7A3A3]/49 rounded-[7px] h-10 px-2.5 w-[300px]"
                  />
                  {/* Show non-preset genres as removable chips */}
                  {genre.filter((g) => !PRESET_GENRES.includes(g)).length >
                    0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {genre
                        .filter((g) => !PRESET_GENRES.includes(g))
                        .map((g) => (
                          <span
                            key={g}
                            className="flex items-center gap-1 w-fit px-5 py-2 text-black bg-[#F6F3FC] rounded-[15px] text-sm"
                          >
                            {g}
                            <button
                              type="button"
                              onClick={() =>
                                setGenre((prev) => prev.filter((x) => x !== g))
                              }
                              className="text-gray-300 hover:text-red-400 ml-1 text-xs"
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
              <p className="text-[15px] font-semibold">Story Cover</p>

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
                  className="w-[620px] h-[301px] object-cover rounded-[7px] border border-[#A7A3A3]/50 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                />
              ) : (
                <label
                  htmlFor="coverInput"
                  className="flex items-center justify-center w-[620px] h-[301px] border border-[#A7A3A3]/50 rounded-[7px] cursor-pointer text-gray-400"
                >
                  Click to select cover image
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Branching Option */}
        <div className="w-full h-auto flex flex-col gap-6 mt-12 p-6 bg-[#F9F7FD] rounded-xl shadow-sm">
          <p className="font-bold text-xl text-[#4B3E8B]">Branching Option</p>

          <div className="flex flex-col gap-4">
            <p className="font-semibold text-base text-gray-700">
              Branching setting for this story
            </p>

            <section className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="branchAllowed"
                  checked={branchAllowed}
                  onChange={(e) => setBranchAllowed(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor="branchAllowed"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  Allow other users to create branches from this story
                </label>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="px-4 py-2 bg-[#9E77DC] rounded-full text-white font-semibold text-sm">
                  {branchAllowed ? "Branching On" : "Branching Off"}
                </span>
                <span className="text-xs text-gray-500">
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
            onClick={() => setShowConfirm(true)}
            disabled={loading}
            className="px-5 py-1 w-fit h-fit bg-[#6f6d73] hover:bg-[#9E77DC] rounded-[7px] text-[16px] font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl w-[420px] p-6 shadow-xl flex flex-col gap-4">
            <h2 className="text-[18px] font-semibold text-center">
              Branching Option
            </h2>

            <p className="text-[14px] text-center text-gray-600">
              Do you want to allow other users to create branches from this
              story?
            </p>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => handleSave(true)}
                className="px-4 py-1.5 rounded-md bg-[#9E77DC] text-white hover:opacity-90"
              >
                Yes, Allow
              </button>

              <button
                onClick={() => handleSave(false)}
                className="px-4 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
