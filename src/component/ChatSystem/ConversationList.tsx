import { Conversation } from "./ChatPage";

interface Props {
  conversations: Conversation[];
  selected: Conversation | null;
  onSelect: (conv: Conversation) => void;
}
import { useState } from "react";
function getDisplayName(conv: Conversation, currentUserId: string): string {
  if (conv.type === "group") return conv.name || "Unnamed group";
  const other = conv.participants.find((p) => p._id !== currentUserId);
  return other?.username || "Unknown";
}

function getAvatar(conv: Conversation, currentUserId: string): string {
  if (conv.type === "group") return "👥";
  const other = conv.participants.find((p) => p._id !== currentUserId);
  return other?.username?.[0]?.toUpperCase() || "?";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function ConversationList({
  conversations,
  selected,
  onSelect,
}: Props) {
  // Read current user id from localStorage (set it when you save the token)
  const [currentUserId] = useState(() => localStorage.getItem("userId") || "");

  return (
    <ul className="py-2">
      {conversations.map((conv) => {
        const isSelected = selected?._id === conv._id;
        const name = getDisplayName(conv, currentUserId);
        const avatar = getAvatar(conv, currentUserId);
        const preview = conv.latestMessage?.content || "No messages yet";
        const time = conv.latestMessage ? timeAgo(conv.updatedAt) : "";

        return (
          <li key={conv._id}>
            <button
              onClick={() => onSelect(conv)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-100
                ${isSelected ? "bg-gray-200" : ""}`}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-black flex-shrink-0">
                {conv.type === "group" ? "👥" : avatar}
              </div>

              {/* Name + preview */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-black truncate">
                    {name}
                  </span>
                  {time && (
                    <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                      {time}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {preview}
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
