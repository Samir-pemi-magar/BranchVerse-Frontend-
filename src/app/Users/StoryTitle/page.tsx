// StoryTitle.tsx
"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { CreateStory } from "@/src/Services/storyApi";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";

export interface StoryFormData {
  title: string;
  description?: string;
  tags: string[];
  cover: FileList;
  branchAllowed: boolean;
  genre: string[];
}

const GENRES = ["Fantasy", "Romance", "Sci-Fi", "Horror", "Mystery"];

export default function StoryTitle() {
  const { register, handleSubmit, setValue, watch } = useForm<StoryFormData>({
    defaultValues: { tags: [], branchAllowed: false },
  });
  const router = useRouter();

  const [tagInput, setTagInput] = useState("");
  const tags = watch("tags");
  const selectedGenres = watch("genre") || [];
  const coverFiles = watch("cover");

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<StoryFormData | null>(null);
  const [customGenre, setCustomGenre] = useState("");
  const [creating, setCreating] = useState(false);

  const addCustomGenre = () => {
    if (!customGenre.trim()) return;
    setValue("genre", [...selectedGenres, customGenre.trim()]);
    setCustomGenre("");
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    setValue("tags", [...tags, tagInput.trim()]);
    setTagInput("");
  };

  const removeTag = (index: number) => {
    setValue(
      "tags",
      tags.filter((_, i) => i !== index),
    );
  };

  const onSubmit = (data: StoryFormData) => {
    setPendingData(data);
    setShowConfirm(true);
  };

  const submitStory = async (isBranchable: boolean) => {
    if (!pendingData) return;
    setShowConfirm(false);
    setCreating(true);

    try {
      const compressed = await imageCompression(pendingData.cover[0], {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 600,
        useWebWorker: true,
        initialQuality: 0.7,
      });

      const formData = new FormData();
      formData.append("title", pendingData.title);
      formData.append("description", pendingData.description || "");
      formData.append("branchAllowed", String(isBranchable));
      pendingData.tags.forEach((tag) => formData.append("tags[]", tag));
      pendingData.genre?.forEach((g) => formData.append("genre[]", g));
      formData.append("cover", compressed);

      const res = await CreateStory(formData);
      if (!res.storyId) {
        alert("Story created but no storyId returned.");
        return;
      }
      router.push(`/Users/Storycreate?storyId=${res.storyId}`);
    } catch (err) {
      console.error("Create story error:", err);
      alert("Failed to create story: " + JSON.stringify(err));
    } finally {
      setCreating(false);
      setPendingData(null);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }

        @keyframes orb-drift {
          from { transform: translate(0,0) scale(1); }
          to { transform: translate(25px,-25px) scale(1.05); }
        }
        @keyframes slide-up {
          from { opacity:0; transform:translateY(24px); }
          to { opacity:1; transform:translateY(0); }
        }
        @keyframes modal-in {
          from { opacity:0; transform:scale(0.92); }
          to { opacity:1; transform:scale(1); }
        }

        .orb-1 { animation: orb-drift 14s ease-in-out infinite alternate; }
        .orb-2 { animation: orb-drift 14s ease-in-out infinite alternate; animation-delay:-5s; }
        .orb-3 { animation: orb-drift 14s ease-in-out infinite alternate; animation-delay:-9s; }
        .card-in { animation: slide-up 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .modal-in { animation: modal-in 0.3s cubic-bezier(0.22,1,0.36,1) both; }

        .noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px;
        }

        .dark-input {
          background: rgba(255,255,255,0.05);
          border: 0.5px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.88);
          border-radius: 12px;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .dark-input:focus {
          border-color: rgba(108,78,242,0.5);
          background: rgba(108,78,242,0.04);
        }
        .dark-input::placeholder { color: rgba(255,255,255,0.2); }

        .dark-textarea {
          background: rgba(255,255,255,0.05);
          border: 0.5px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.88);
          border-radius: 12px;
          outline: none;
          resize: none;
          transition: border-color 0.2s, background 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .dark-textarea:focus {
          border-color: rgba(108,78,242,0.5);
          background: rgba(108,78,242,0.04);
        }
        .dark-textarea::placeholder { color: rgba(255,255,255,0.2); }

        .genre-chip {
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          border: 0.5px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.5);
          font-family: 'DM Sans', sans-serif;
        }
        .genre-chip:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); }
        .genre-chip.active {
          background: rgba(108,78,242,0.25);
          border-color: rgba(108,78,242,0.5);
          color: #957bda;
        }

        .publish-btn {
          background: linear-gradient(130deg, #6c4ef2 0%, #15b0b7 100%);
          position: relative;
          overflow: hidden;
          transition: all 0.2s;
        }
        .publish-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          pointer-events: none;
        }
        .publish-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .publish-btn:active { transform: scale(0.99); }

        .cover-label {
          border: 1.5px dashed rgba(255,255,255,0.12);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s;
          background: rgba(255,255,255,0.03);
        }
        .cover-label:hover {
          border-color: rgba(108,78,242,0.4);
          background: rgba(108,78,242,0.04);
        }
      `}</style>

      <div
        className="font-dm relative min-h-screen"
        style={{ background: "#0d0d12" }}
      >
        {/* Orbs */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div
            className="orb-1 absolute rounded-full"
            style={{
              width: 480,
              height: 480,
              background: "#6c4ef2",
              filter: "blur(80px)",
              opacity: 0.28,
              top: -100,
              right: -60,
            }}
          />
          <div
            className="orb-2 absolute rounded-full"
            style={{
              width: 340,
              height: 340,
              background: "#15b0b7",
              filter: "blur(80px)",
              opacity: 0.28,
              bottom: -60,
              left: -60,
            }}
          />
          <div
            className="orb-3 absolute rounded-full"
            style={{
              width: 220,
              height: 220,
              background: "#e5839a",
              filter: "blur(80px)",
              opacity: 0.14,
              top: "40%",
              left: "30%",
            }}
          />
        </div>
        <div className="noise fixed inset-0 z-[1] opacity-[0.03] pointer-events-none" />

        {/* Loading Overlay */}
        {creating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div
              className="flex flex-col items-center gap-4 px-10 py-10 rounded-[28px]"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "0.5px solid rgba(255,255,255,0.12)",
              }}
            >
              <div
                className="w-10 h-10 rounded-full border-[3px] border-transparent animate-spin"
                style={{
                  borderTopColor: "#6c4ef2",
                  borderRightColor: "#15b0b7",
                }}
              />
              <p className="font-playfair text-lg font-bold text-white">
                Creating your story…
              </p>
              <p
                className="text-sm"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Uploading cover & saving
              </p>
            </div>
          </div>
        )}

        {/* Main */}
        <div className="relative z-[2] w-full max-w-[1300px] mx-auto px-4 sm:px-8 py-10 sm:py-16">
          <div className="card-in flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col gap-2">
              <span
                className="text-xs font-medium px-3 py-1 rounded-full w-fit"
                style={{
                  background: "rgba(108,78,242,0.2)",
                  color: "#957bda",
                  border: "0.5px solid rgba(108,78,242,0.3)",
                }}
              >
                ✨ New Story
              </span>
              <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Begin Your Universe
              </h1>
              <p
                className="text-sm"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Every great story starts with a title. Fill in the details and
                let the world branch from here.
              </p>
            </div>

            {/* Two column layout */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left — form fields */}
              <div className="flex flex-col gap-5 flex-1">
                {/* Title */}
                <div className="flex flex-col gap-2">
                  <label
                    className="text-xs font-medium tracking-wide uppercase"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    Story Title
                  </label>
                  <input
                    {...register("title", { required: true })}
                    className="dark-input w-full h-12 px-4 text-base"
                    placeholder="Enter a captivating title…"
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2">
                  <label
                    className="text-xs font-medium tracking-wide uppercase"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    Short Description
                  </label>
                  <textarea
                    {...register("description")}
                    className="dark-textarea w-full h-[160px] px-4 py-3 text-sm"
                    placeholder="What is your story about? Give readers a glimpse…"
                  />
                </div>

                {/* Tags */}
                <div className="flex flex-col gap-2">
                  <label
                    className="text-xs font-medium tracking-wide uppercase"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: "rgba(21,176,183,0.2)",
                          color: "#15b0b7",
                          border: "0.5px solid rgba(21,176,183,0.3)",
                        }}
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(i)}
                          className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity text-xs leading-none"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addTag())
                      }
                      className="dark-input flex-1 h-10 px-3 text-sm"
                      placeholder="Add a tag and press Enter…"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 h-10 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.6)",
                        border: "0.5px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Genre */}
                <div className="flex flex-col gap-2">
                  <label
                    className="text-xs font-medium tracking-wide uppercase"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    Genre
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map((g) => {
                      const isSelected = selectedGenres.includes(g);
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setValue(
                                "genre",
                                selectedGenres.filter((x) => x !== g),
                              );
                            } else {
                              setValue("genre", [...selectedGenres, g]);
                            }
                          }}
                          className={`genre-chip ${isSelected ? "active" : ""}`}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={customGenre}
                      onChange={(e) => setCustomGenre(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addCustomGenre())
                      }
                      className="dark-input flex-1 h-10 px-3 text-sm"
                      placeholder="Other genre…"
                    />
                    <button
                      type="button"
                      onClick={addCustomGenre}
                      className="px-4 h-10 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.6)",
                        border: "0.5px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      Add
                    </button>
                  </div>
                  {selectedGenres.filter((g) => !GENRES.includes(g)).length >
                    0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedGenres
                        .filter((g) => !GENRES.includes(g))
                        .map((g, i) => (
                          <span
                            key={i}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              background: "rgba(108,78,242,0.2)",
                              color: "#957bda",
                              border: "0.5px solid rgba(108,78,242,0.3)",
                            }}
                          >
                            {g}
                            <button
                              type="button"
                              onClick={() =>
                                setValue(
                                  "genre",
                                  selectedGenres.filter((x) => x !== g),
                                )
                              }
                              className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity text-xs leading-none"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right — cover upload */}
              <div className="flex flex-col gap-2 w-full lg:w-[320px] shrink-0">
                <label
                  className="text-xs font-medium tracking-wide uppercase"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Story Cover
                </label>
                <input
                  type="file"
                  accept="image/*"
                  {...register("cover", { required: true })}
                  className="hidden"
                  id="coverInput"
                />
                {coverFiles && coverFiles.length > 0 ? (
                  <div
                    className="relative w-full h-[280px] lg:h-full min-h-[280px] rounded-2xl overflow-hidden group cursor-pointer"
                    onClick={() =>
                      document.getElementById("coverInput")?.click()
                    }
                  >
                    <img
                      src={URL.createObjectURL(coverFiles[0])}
                      alt="Cover Preview"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                      <span
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium px-4 py-2 rounded-xl"
                        style={{ background: "rgba(108,78,242,0.8)" }}
                      >
                        Change Cover
                      </span>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="coverInput"
                    className="cover-label w-full h-[280px] lg:h-full min-h-[280px] flex flex-col items-center justify-center gap-3"
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: "rgba(108,78,242,0.15)",
                        border: "0.5px solid rgba(108,78,242,0.3)",
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="rgba(108,78,242,0.8)"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "rgba(255,255,255,0.5)" }}
                      >
                        Click to upload cover
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "rgba(255,255,255,0.25)" }}
                      >
                        PNG, JPG up to 5MB
                      </span>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Branching info box */}
            <div
              className="rounded-2xl p-5 flex flex-col gap-3"
              style={{
                background: "rgba(108,78,242,0.08)",
                border: "0.5px solid rgba(108,78,242,0.2)",
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(108,78,242,0.2)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M5 10.038C5.32593 9.70547 5.71491 9.44134 6.14419 9.26104C6.57347 9.08075 7.0344 8.98791 7.5 8.98798H9.5C10.0871 8.98818 10.6555 8.78178 11.1056 8.40495C11.5557 8.02813 11.8589 7.50491 11.962 6.92698C11.4934 6.79646 11.0885 6.49965 10.8229 6.09209C10.5574 5.68454 10.4495 5.19418 10.5194 4.71281C10.5893 4.23144 10.8323 3.79205 11.2028 3.47689C11.5733 3.16173 12.046 2.9924 12.5324 3.0006C13.0187 3.00881 13.4854 3.19397 13.8451 3.52145C14.2048 3.84892 14.4328 4.29626 14.4864 4.77971C14.5401 5.26317 14.4157 5.74961 14.1366 6.14798C13.8575 6.54635 13.4427 6.82934 12.97 6.94398C12.8591 7.78581 12.446 8.55862 11.8076 9.11846C11.1692 9.6783 10.3491 9.98697 9.5 9.98698H7.5C6.9088 9.98682 6.33666 10.1962 5.88519 10.5779C5.43373 10.9596 5.13215 11.489 5.034 12.072C5.50167 12.2015 5.9063 12.4966 6.17247 12.9024C6.43865 13.3082 6.54822 13.7968 6.48078 14.2774C6.41333 14.758 6.17346 15.1976 5.80586 15.5144C5.43827 15.8312 4.96803 16.0036 4.48278 15.9993C3.99753 15.9951 3.53036 15.8146 3.16834 15.4915C2.80632 15.1683 2.57414 14.7246 2.51506 14.2429C2.45599 13.7612 2.57405 13.2745 2.84725 12.8735C3.12045 12.4724 3.53015 12.1843 4 12.063V3.93698C3.52868 3.81528 3.11791 3.52587 2.8447 3.12298C2.5715 2.72009 2.45461 2.23139 2.51595 1.74848C2.57728 1.26557 2.81264 0.821613 3.17789 0.499819C3.54314 0.178025 4.01322 0.000488281 4.5 0.000488281C4.98679 0.000488281 5.45687 0.178025 5.82212 0.499819C6.18737 0.821613 6.42273 1.26557 6.48406 1.74848C6.5454 2.23139 6.42851 2.72009 6.15531 3.12298C5.8821 3.52587 5.47133 3.81528 5 3.93698V10.038Z"
                      fill="#957bda"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Origin Story
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    This will be the root — others can branch from it later
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                className="publish-btn font-dm text-white font-medium text-sm px-8 py-3 rounded-xl"
              >
                Continue to Branching →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div
            className="modal-in w-full max-w-[420px] rounded-[28px] px-8 py-10 flex flex-col gap-6"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "0.5px solid rgba(255,255,255,0.12)",
            }}
          >
            <div className="flex flex-col gap-2 text-center">
              <div
                className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-2"
                style={{
                  background: "linear-gradient(135deg,#6c4ef2,#15b0b7)",
                }}
              >
                <svg width="26" height="26" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M5 10.038C5.32593 9.70547 5.71491 9.44134 6.14419 9.26104C6.57347 9.08075 7.0344 8.98791 7.5 8.98798H9.5C10.0871 8.98818 10.6555 8.78178 11.1056 8.40495C11.5557 8.02813 11.8589 7.50491 11.962 6.92698C11.4934 6.79646 11.0885 6.49965 10.8229 6.09209C10.5574 5.68454 10.4495 5.19418 10.5194 4.71281C10.5893 4.23144 10.8323 3.79205 11.2028 3.47689C11.5733 3.16173 12.046 2.9924 12.5324 3.0006C13.0187 3.00881 13.4854 3.19397 13.8451 3.52145C14.2048 3.84892 14.4328 4.29626 14.4864 4.77971C14.5401 5.26317 14.4157 5.74961 14.1366 6.14798C13.8575 6.54635 13.4427 6.82934 12.97 6.94398C12.8591 7.78581 12.446 8.55862 11.8076 9.11846C11.1692 9.6783 10.3491 9.98697 9.5 9.98698H7.5C6.9088 9.98682 6.33666 10.1962 5.88519 10.5779C5.43373 10.9596 5.13215 11.489 5.034 12.072C5.50167 12.2015 5.9063 12.4966 6.17247 12.9024C6.43865 13.3082 6.54822 13.7968 6.48078 14.2774C6.41333 14.758 6.17346 15.1976 5.80586 15.5144C5.43827 15.8312 4.96803 16.0036 4.48278 15.9993C3.99753 15.9951 3.53036 15.8146 3.16834 15.4915C2.80632 15.1683 2.57414 14.7246 2.51506 14.2429C2.45599 13.7612 2.57405 13.2745 2.84725 12.8735C3.12045 12.4724 3.53015 12.1843 4 12.063V3.93698C3.52868 3.81528 3.11791 3.52587 2.8447 3.12298C2.5715 2.72009 2.45461 2.23139 2.51595 1.74848C2.57728 1.26557 2.81264 0.821613 3.17789 0.499819C3.54314 0.178025 4.01322 0.000488281 4.5 0.000488281C4.98679 0.000488281 5.45687 0.178025 5.82212 0.499819C6.18737 0.821613 6.42273 1.26557 6.48406 1.74848C6.5454 2.23139 6.42851 2.72009 6.15531 3.12298C5.8821 3.52587 5.47133 3.81528 5 3.93698V10.038Z"
                    fill="white"
                  />
                </svg>
              </div>
              <h2 className="font-playfair text-2xl font-bold text-white">
                Branching Options
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Should readers be allowed to create their own branches from this
                story?
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => submitStory(true)}
                className="publish-btn w-full py-3 rounded-xl text-white text-sm font-medium"
              >
                🌿 Yes, allow branching
              </button>
              <button
                onClick={() => submitStory(false)}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "0.5px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                🔒 No, keep it closed
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-xs text-center transition-opacity hover:opacity-100"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
