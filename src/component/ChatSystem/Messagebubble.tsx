interface Message {
  _id: string;
  content: string;
  sender: { _id: string; username: string };
  createdAt: string;
  isDeleted?: boolean;
}

interface Props {
  message: Message;
  isOwn: boolean;
  showSender: boolean; // show sender name in group chats
  onDelete?: (id: string) => void;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessageBubble({
  message,
  isOwn,
  showSender,
  onDelete,
}: Props) {
  return (
    <div
      className={`flex ${isOwn ? "justify-end" : "justify-start"} group mb-1`}
    >
      <div
        className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}
      >
        {/* Sender name (group chats only, not own messages) */}
        {showSender && !isOwn && (
          <span className="text-xs text-gray-400 mb-1 ml-1">
            {message.sender.username}
          </span>
        )}

        <div className="flex items-end gap-2">
          {/* Delete button (own messages only) */}
          {isOwn && onDelete && !message.isDeleted && (
            <button
              onClick={() => onDelete(message._id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-400 text-xs mb-1"
              title="Delete"
            >
              ✕
            </button>
          )}

          {/* Bubble */}
          <div
            className={`px-4 py-2 rounded-2xl text-sm leading-relaxed
              ${
                isOwn
                  ? "bg-white text-black rounded-br-sm"
                  : "bg-gray-100 text-black rounded-bl-sm"
              }
              ${message.isDeleted ? "italic opacity-40" : ""}
            `}
          >
            {message.content}
          </div>
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-gray-400 mt-1 mx-1">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}

export type { Message };
