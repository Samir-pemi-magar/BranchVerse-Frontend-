"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { CreateStory } from "@/src/Services/storyApi";
import { useRouter } from "next/navigation";

export interface StoryFormData {
  title: string;
  description?: string;
  tags: string[];
  cover: FileList;
  branchAllowed: boolean;
  genre: string[];
}

export default function StoryTitle() {
  const { register, handleSubmit, setValue, watch } = useForm<StoryFormData>({
    defaultValues: {
      tags: [],
      branchAllowed: false,
    },
  });
  const router = useRouter();

  const [tagInput, setTagInput] = useState("");
  const tags = watch("tags");

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<StoryFormData | null>(null);
  const [customGenre, setCustomGenre] = useState("");

  const addCustomGenre = () => {
    if (!customGenre.trim()) return;
    // Merge custom genre into form data
    const currentGenres = watch("genre") || [];
    setValue("genre", [...currentGenres, customGenre.trim()]);
    setCustomGenre(""); // reset input
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    setValue("tags", [...tags, tagInput.trim()]);
    setTagInput("");
  };

  const onSubmit = (data: StoryFormData) => {
    setPendingData(data);
    setShowConfirm(true);
  };

  const submitStory = async (isBranchable: boolean) => {
    if (!pendingData) return;

    const formData = new FormData();
    formData.append("title", pendingData.title);
    formData.append("description", pendingData.description || "");
    formData.append("branchAllowed", String(isBranchable));

    pendingData.tags.forEach((tag) => formData.append("tags[]", tag));
    pendingData.genre?.forEach((g) => formData.append("genre[]", g));

    formData.append("cover", pendingData.cover[0]);

    try {
      const res = await CreateStory(formData);
      console.log("Story created:", res.storyId);
      router.push(`/Users/Storycreate?storyId=${res.storyId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setShowConfirm(false);
      setPendingData(null);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="py-[50px] w-full h-auto bg-white px-[140px] flex flex-col items-center"
      >
        <div className="flex flex-col gap-[26px] w-full">
          <p className="font-semibold text-[20px]">Story Information</p>

          <div className="flex flex-row w-full h-fit gap-x-[118px]">
            <div className="flex flex-col gap-4">
              {/* Story Title */}
              <section className="flex flex-col gap-[9px]">
                <p className="font-semibold text-[15px]">Story Title</p>
                <input
                  {...register("title", { required: true })}
                  className="border border-[#A7A3A3]/49 rounded-[7px] w-[660px] h-12 outline-none px-2.5"
                  placeholder="Enter name of the story..."
                />
              </section>

              {/* Description */}
              <section className="flex flex-col gap-[9px]">
                <p className="font-semibold text-[15px]">Short Description</p>
                <textarea
                  {...register("description")}
                  className="border border-[#A7A3A3]/49 rounded-[7px] w-[660px] h-[201px] outline-none px-2.5 resize-none"
                  placeholder="Please enter a short description or leave it empty..."
                />
              </section>

              {/* Tags */}
              <section className="flex flex-col gap-[9px]">
                <p className="text-[16px] font-semibold">Tags</p>

                <section className="flex flex-row gap-x-[13px] items-center">
                  {tags.map((tag, index) => (
                    <p
                      key={index}
                      className="w-fit h-fit px-5 py-2 text-black bg-[#F6F3FC] rounded-[15px]"
                    >
                      #{tag}
                    </p>
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

              <section className="flex flex-col gap-[9px]">
                <p className="font-semibold text-[15px]">Genre</p>

                {/* Checkboxes in a row */}
                <div className="flex flex-row gap-4 flex-wrap">
                  {["Fantasy", "Romance", "Sci-Fi", "Horror", "Mystery"].map(
                    (g) => (
                      <label key={g} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          value={g}
                          {...register("genre")}
                        />
                        <span className="text-[14px]">{g}</span>
                      </label>
                    ),
                  )}
                </div>

                {/* Custom genre input below checkboxes */}
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
                    className="border border-[#A7A3A3]/49 rounded-[7px] h-10 px-2.5"
                  />
                </div>
              </section>
            </div>

            {/* Cover */}
            <div className="flex flex-col gap-[9px]">
              <p className="text-[15px] font-semibold">Story Cover</p>

              {/* Hidden file input reference */}
              <input
                type="file"
                accept="image/*"
                {...register("cover", { required: true })}
                className="hidden"
                id="coverInput"
              />

              {/* Preview image */}
              {watch("cover") && watch("cover").length > 0 ? (
                <img
                  src={URL.createObjectURL(watch("cover")[0])}
                  alt="Cover Preview"
                  className="w-[620px] h-[301px] object-cover rounded-[7px] border border-[#A7A3A3]/50 cursor-pointer"
                  onClick={() => {
                    const fileInput = document.getElementById(
                      "coverInput",
                    ) as HTMLInputElement;
                    fileInput.click(); // Open file selector on click
                  }}
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

        {/* Branch */}
        <div className="w-full h-auto flex flex-col gap-6 mt-12 p-6 bg-[#F9F7FD] rounded-xl shadow-sm">
          <p className="font-bold text-xl text-[#4B3E8B]">Branching Option</p>

          <div className="flex flex-col gap-4">
            <p className="font-semibold text-base text-gray-700">
              This story is the main branch
            </p>

            <section className="flex flex-col gap-2">
              <p className="text-sm font-medium text-gray-600">Parent Story</p>

              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-[#9E77DC] rounded-full text-white font-semibold text-sm">
                  Origin
                </span>
                <span className="text-xs text-gray-500">
                  This is the root story; other branches can be created from
                  here.
                </span>
              </div>
            </section>
          </div>
        </div>

        {/* Submit */}
        <div className="w-full text-right mt-[60px]">
          <button
            type="submit"
            className="px-5 py-1 w-fit h-fit bg-[#6f6d73] hover:bg-[#9E77DC] rounded-[7px] text-[16px] font-semibold text-white"
          >
            Create
          </button>
        </div>
      </form>

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
                onClick={() => submitStory(true)}
                className="px-4 py-1.5 rounded-md bg-[#9E77DC] text-white hover:opacity-90"
              >
                Yes, Allow
              </button>

              <button
                onClick={() => submitStory(false)}
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
