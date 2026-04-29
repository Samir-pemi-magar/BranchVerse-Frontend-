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
    setCurrentUserId(localStorage.getItem("userId") || "");
  }, []);

  // Load messages and join socket room whenever conversation changes
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

  // Scroll to bottom when new messages arrive
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
      // Add to your own state directly
      setMessages((prev) => {
        if (prev.find((m) => m._id === saved._id)) return prev;
        return [...prev, saved];
      });
      // This only goes to OTHER users in the room (socket.to(...) on server)
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
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-300 bg-white">
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-black">
          {conversation.type === "group" ? "👥" : displayName[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-black">{displayName}</p>
          <p className="text-xs text-gray-500">
            {conversation.type === "group"
              ? `${conversation.participants.length} members`
              : "Direct message"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-1 bg-white">
        {/* Load more */}
        {hasMore && (
          <button
            onClick={() => {
              const next = page + 1;
              setPage(next);
              fetchMessages(next);
            }}
            className="text-xs text-gray-500 hover:text-gray-700 self-center mb-2 underline"
          >
            Load older messages
          </button>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            Loading...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
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

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-gray-500 text-xs mt-1">
            <span className="flex gap-1">
              <span
                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </span>
            typing...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-gray-300 bg-white">
        <div className="flex items-end gap-3 bg-gray-100 rounded-2xl px-4 py-3">
          <textarea
            rows={1}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm text-black placeholder-gray-500 resize-none outline-none max-h-32"
          />
          <button
            onClick={handleSend}
            disabled={!content.trim()}
            className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold
              disabled:opacity-20 hover:bg-gray-800 transition-colors flex-shrink-0"
          >
            ↑
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
