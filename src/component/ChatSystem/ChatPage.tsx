"use client";
import { useState, useEffect } from "react";
import ConversationList from "./ConversationList";
import ChatWindow from "./Chatwindow";
import NewChatModal from "./Newchatmodel";
import { getMyConversations } from "../../Services/authapi";
import socket, { attachToken } from "../../socket";

export interface Participant {
  _id: string;
  username: string;
  profilePicture?: string;
}

export interface Conversation {
  _id: string;
  type: "dm" | "group";
  name?: string;
  participants: Participant[];
  latestMessage?: {
    content: string;
    sender: { username: string };
    createdAt: string;
  };
  updatedAt: string;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attachToken();
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    socket.on("newMessageNotification", () => {
      fetchConversations();
    });
    return () => {
      socket.off("newMessageNotification");
    };
  }, []);

  const fetchConversations = async () => {
    try {
      const data = await getMyConversations();
      setConversations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationCreated = (conv: Conversation) => {
    setConversations((prev) => {
      const exists = prev.find((c) => c._id === conv._id);
      if (exists) return prev;
      return [conv, ...prev];
    });
    setSelected(conv);
    setShowModal(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-['DM_Sans',sans-serif] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 min-w-[280px] flex flex-col border-r border-gray-200 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold tracking-tight text-gray-900">
            Messages
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-lg text-gray-600 hover:text-gray-900"
            title="New chat"
          >
            +
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              Loading...
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm gap-2">
              <span className="text-3xl">💬</span>
              <p>No conversations yet</p>
              <button
                onClick={() => setShowModal(true)}
                className="text-gray-500 hover:text-gray-800 underline text-xs"
              >
                Start one
              </button>
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              selected={selected}
              onSelect={setSelected}
            />
          )}
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col bg-white">
        {selected ? (
          <ChatWindow
            conversation={selected}
            onMessageSent={fetchConversations}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-3">
            <span className="text-6xl">✉️</span>
            <p className="text-lg text-gray-400">
              Select a conversation to start chatting
            </p>
          </div>
        )}
      </main>

      {/* New chat modal */}
      {showModal && (
        <NewChatModal
          onClose={() => setShowModal(false)}
          onCreated={handleConversationCreated}
        />
      )}
    </div>
  );
}
