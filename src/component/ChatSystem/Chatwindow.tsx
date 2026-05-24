"use client";
import { useEffect, useRef, useState } from "react";
import { Conversation } from "./ChatPage";
import MessageBubble, { Message } from "./Messagebubble";
import {
  getMessages,
  sendMessage,
  deleteMessage,
} from "../../Services/authapi";
import socket from "../../../src/socket";

interface Props {
  conversation: Conversation;
  onMessageSent: () => void;
}

function getDisplayName(conv: Conversation, currentUserId: string): string {
  if (conv.type === "group") return conv.name || "Unnamed group";
  const other = conv.participants.find((p) => p._id !== currentUserId);
  return other?.username || "Unknown";
}

export default function ChatWindow({ conversation, onMessageSent }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    setCurrentUserId(
      localStorage.getItem("userId") ?? sessionStorage.getItem("userId") ?? "",
    );
  }, []);

  useEffect(() => {
    setMessages([]);
    setPage(1);
    setLoading(true);
    fetchMessages(1);

    socket.emit("joinRoom", conversation._id);

    socket.on("messageReceived", (msg: Message) => {
      setMessages((prev) => {
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on("typing", (roomId: string) => {
      if (roomId === conversation._id) setIsTyping(true);
    });
    socket.on("stopTyping", () => setIsTyping(false));

    return () => {
      socket.emit("leaveRoom", conversation._id);
      socket.off("messageReceived");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [conversation._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async (p: number) => {
    try {
      const data = await getMessages(conversation._id, p);
      if (p === 1) {
        setMessages(data.messages);
      } else {
        setMessages((prev) => [...data.messages, ...prev]);
      }
      setHasMore(p < data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    setContent("");
    try {
      const saved = await sendMessage(conversation._id, trimmed);
      setMessages((prev) => {
        if (prev.find((m) => m._id === saved._id)) return prev;
        return [...prev, saved];
      });
      socket.emit("sendMessage", saved);
      onMessageSent();
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = () => {
    if (!typing) {
      setTyping(true);
      socket.emit("typing", conversation._id);
    }
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setTyping(false);
      socket.emit("stopTyping", conversation._id);
    }, 2000);
  };

  const handleDelete = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, isDeleted: true, content: "[deleted]" }
            : m,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const displayName = getDisplayName(conversation, currentUserId);

  return (
    <div className="flex flex-col h-full bg-[#0d0d12] min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-800 bg-[#0d0d12] flex-shrink-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1a1a24] flex items-center justify-center text-sm font-semibold text-white flex-shrink-0">
          {conversation.type === "group" ? "👥" : displayName[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {displayName}
          </p>
          <p className="text-xs text-gray-400">
            {conversation.type === "group"
              ? `${conversation.participants.length} members`
              : "Direct message"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 flex flex-col gap-1 bg-[#0d0d12] min-h-0">
        {hasMore && (
          <button
            onClick={() => {
              const next = page + 1;
              setPage(next);
              fetchMessages(next);
            }}
            className="text-xs text-gray-500 hover:text-gray-300 self-center mb-2 underline"
          >
            Load older messages
          </button>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            Loading...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            No messages yet. Say hello! 👋
          </div>
        ) : (
          messages.map((msg, i) => {
            const prevMsg = messages[i - 1];
            const showSender =
              conversation.type === "group" &&
              msg.sender._id !== currentUserId &&
              prevMsg?.sender._id !== msg.sender._id;

            return (
              <MessageBubble
                key={msg._id}
                message={msg}
                isOwn={msg.sender._id === currentUserId}
                showSender={showSender}
                onDelete={handleDelete}
              />
            );
          })
        )}

        {isTyping && (
          <div className="flex items-center gap-2 text-gray-500 text-xs mt-1">
            <span className="flex gap-1">
              <span
                className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </span>
            typing...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 sm:px-5 py-3 sm:py-4 border-t border-gray-800 bg-[#0d0d12] flex-shrink-0">
        <div className="flex items-end gap-2 sm:gap-3 bg-[#1a1a24] rounded-2xl px-3 sm:px-4 py-2 sm:py-3">
          <textarea
            rows={1}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 resize-none outline-none max-h-32 min-w-0"
          />
          <button
            onClick={handleSend}
            disabled={!content.trim()}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black text-sm font-bold
              disabled:opacity-20 hover:bg-gray-200 transition-colors flex-shrink-0"
          >
            ↑
          </button>
        </div>
        <p className="text-[10px] text-gray-500 mt-1.5 ml-1 hidden sm:block">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
