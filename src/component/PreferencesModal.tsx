// PreferencesModal.tsx
"use client";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import toast from "react-hot-toast";
import { savePreferences } from "../Services/authapi";

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const genres = [
  "Fantasy",
  "Sci-Fi",
  "Romance",
  "Mystery",
  "Horror",
  "Adventure",
  "Thriller",
  "Drama",
  "Historical",
  "Mythology",
  "Slice of Life",
  "Action",
  "Comedy",
  "Psychological",
  "Supernatural",
];

export default function PreferencesModal({
  isOpen,
  onClose,
}: PreferencesModalProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [interests, setInterests] = useState("");
  const [customGenre, setCustomGenre] = useState("");

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  };

  const addCustomGenre = () => {
    const trimmed = customGenre.trim();
    if (!trimmed) {
      toast.error("Custom genre cannot be empty");
      return;
    }
    if (selectedGenres.includes(trimmed)) {
      toast.error("Genre already added");
      return;
    }
    setSelectedGenres((prev) => [...prev, trimmed]);
    setCustomGenre("");
  };

  const handleSave = async () => {
    if (selectedGenres.length === 0) {
      toast.error("Select at least one genre");
      return;
    }
    try {
      await savePreferences({ genres: selectedGenres, interests });
      toast.success("Preferences saved!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save preferences");
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-linear-to-tr from-[#A491D4] via-[#D1BFE3] to-[#F4E0E0]" />
        </Transition.Child>

        {/* Added overflow-y-auto + py-4 so modal scrolls on short screens */}
        <div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            {/* max-h + overflow-y-auto lets panel scroll internally on very small screens */}
            <Dialog.Panel className="w-full max-w-md p-4 sm:p-6 bg-white rounded-2xl shadow-lg max-h-[90vh] overflow-y-auto">
              <Dialog.Title className="text-xl sm:text-2xl font-bold mb-4">
                Your Preferences
              </Dialog.Title>

              <p className="mb-2 font-semibold text-sm sm:text-base">
                Select genres:
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`px-3 py-1 rounded-full border text-sm ${
                      selectedGenres.includes(genre)
                        ? "bg-[#00B8AE] text-white"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>

              <p className="mb-2 font-semibold text-sm sm:text-base">
                Add custom genre:
              </p>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addCustomGenre())
                  }
                  placeholder="e.g., Cyberpunk"
                  className="flex-1 min-w-0 border border-gray-300 rounded px-3 py-2 text-sm"
                />
                <button
                  onClick={addCustomGenre}
                  className="bg-gray-800 text-white px-4 rounded text-sm shrink-0"
                >
                  Add
                </button>
              </div>

              <p className="mb-2 font-semibold text-sm sm:text-base">
                Other interests:
              </p>
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="e.g., dragons, magic..."
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-sm"
              />

              <button
                onClick={handleSave}
                className="w-full bg-[#00B8AE] text-white rounded px-4 py-2 font-bold text-sm sm:text-base"
              >
                Save
              </button>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
