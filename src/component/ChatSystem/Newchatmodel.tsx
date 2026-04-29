import { useState, useEffect, useRef } from "react";
import { Conversation } from "./ChatPage";
import { getOrCreateDM, createGroup } from "../../Services/authapi";
import axiosInstance from "../../Services/axiosinstance";

interface Props {
  onClose: () => void;
  onCreated: (conv: Conversation) => void;
}

interface UserResult {
  _id: string;
  username: string;
  profilePicture?: string;
}

export default function NewChatModal({ onClose, onCreated }: Props) {
  const [tab, setTab] = useState<"dm" | "group">("dm");

  // DM state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);

  // Group state
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<UserResult[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Debounce timer ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search: only fires 400ms after the user stops typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axiosInstance.get(
          `/api/auth/search?q=${encodeURIComponent(searchQuery.trim())}`,
        );
        console.log("Search response:", res.data);
        // Handle both res.data (array) and res.data.users (object with users key)
        const users: UserResult[] = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.users)
            ? res.data.users
            : [];
        setSearchResults(users);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const handleDM = async (user: UserResult) => {
    setLoading(true);
    setError("");
    try {
      const conv = await getOrCreateDM(user._id);
      onCreated(conv);
    } catch {
      setError("Could not start conversation");
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (user: UserResult) => {
    setSelectedUsers((prev) =>
      prev.find((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user],
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError("Group name is required");
      return;
    }
    if (selectedUsers.length < 2) {
      setError("Add at least 2 members");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const conv = await createGroup(
        groupName,
        selectedUsers.map((u) => u._id),
      );
      onCreated(conv);
    } catch {
      setError("Could not create group");
    } finally {
      setLoading(false);
    }
  };

  const handleTabSwitch = (t: "dm" | "group") => {
    setTab(t);
    setError("");
    setSearchResults([]);
    setSearchQuery("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white border border-gray-300 rounded-2xl w-full max-w-md mx-4 overflow-hidden text-black">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-300">
          <h2 className="text-sm font-semibold">New conversation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-300">
          {(["dm", "group"] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleTabSwitch(t)}
              className={`flex-1 py-3 text-sm transition-colors
                ${
                  tab === t
                    ? "text-black border-b-2 border-black"
                    : "text-gray-400 hover:text-gray-700"
                }`}
            >
              {t === "dm" ? "Direct message" : "Group chat"}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Search input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username..."
            autoFocus
            className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-black
              placeholder-gray-500 outline-none focus:border-gray-500 transition-colors"
          />

          {/* Group name (group tab only) */}
          {tab === "group" && (
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name..."
              className="w-full mt-3 bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-black
                placeholder-gray-500 outline-none focus:border-gray-500 transition-colors"
            />
          )}

          {/* Selected users chips (group tab) */}
          {tab === "group" && selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedUsers.map((u) => (
                <span
                  key={u._id}
                  className="flex items-center gap-1.5 bg-gray-200 rounded-full px-3 py-1 text-xs text-black"
                >
                  {u.username}
                  <button
                    onClick={() => toggleUser(u)}
                    className="text-gray-400 hover:text-black"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Searching spinner */}
          {searching && (
            <p className="text-gray-500 text-xs mt-3">Searching...</p>
          )}

          {/* Results list — only shown when not searching and there are results */}
          {!searching && searchResults.length > 0 && (
            <ul className="mt-3 border border-gray-300 rounded-xl overflow-hidden">
              {searchResults.map((user) => {
                const isSelected = !!selectedUsers.find(
                  (u) => u._id === user._id,
                );
                return (
                  <li key={user._id}>
                    <button
                      onClick={() =>
                        tab === "dm" ? handleDM(user) : toggleUser(user)
                      }
                      disabled={loading}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 transition-colors
                        ${isSelected ? "bg-gray-200" : ""}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-black flex-shrink-0">
                        {user.username[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm text-black">
                        {user.username}
                      </span>
                      {isSelected && (
                        <span className="ml-auto text-gray-500 text-xs">✓</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* No results state */}
          {!searching && searchQuery.trim() && searchResults.length === 0 && (
            <p className="text-gray-500 text-xs mt-3">No users found</p>
          )}

          {error && <p className="text-red-400 text-xs mt-3">{error}</p>}

          {/* Create group button */}
          {tab === "group" && (
            <button
              onClick={handleCreateGroup}
              disabled={
                loading || !groupName.trim() || selectedUsers.length < 2
              }
              className="w-full mt-4 py-2.5 bg-black text-white text-sm font-medium rounded-xl
                disabled:opacity-30 hover:bg-gray-800 transition-colors"
            >
              {loading ? "Creating..." : "Create group"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
