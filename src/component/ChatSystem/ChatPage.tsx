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
  const [showSidebar, setShowSidebar] = useState(true); // mobile: show list or chat

  useEffect(() => {
    attachToken();
    if (!socket.connected) {
      socket.connect();
    }
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
    setShowSidebar(false); // on mobile, go straight to chat
  };

  const handleSelect = (conv: Conversation) => {
    setSelected(conv);
    setShowSidebar(false); // on mobile, switch to chat view
  };

  return (
    <div className="flex h-screen bg-[#0d0d12] text-white font-['DM_Sans',sans-serif] overflow-hidden">
      {/* Sidebar — always visible on md+, toggled on mobile */}
      <aside
        className={`
          flex flex-col border-r border-gray-800 bg-[#0d0d12]
          w-full md:w-80 md:min-w-[280px] md:flex-shrink-0
          ${showSidebar ? "flex" : "hidden"} md:flex
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h1 className="text-lg font-semibold tracking-tight text-white">
            Messages
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="w-8 h-8 rounded-full bg-[#1a1a24] hover:bg-[#2a2a35] flex items-center justify-center transition-colors text-lg text-gray-300 hover:text-white"
            title="New chat"
          >
            +
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
              Loading...
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm gap-2">
              <span className="text-3xl">💬</span>
              <p>No conversations yet</p>
              <button
                onClick={() => setShowModal(true)}
                className="text-gray-400 hover:text-white underline text-xs"
              >
                Start one
              </button>
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              selected={selected}
              onSelect={handleSelect}
            />
          )}
        </div>
      </aside>

      {/* Main chat area — always visible on md+, toggled on mobile */}
      <main
        className={`
          flex-1 flex flex-col bg-[#0d0d12] min-w-0
          ${!showSidebar ? "flex" : "hidden"} md:flex
        `}
      >
        {/* Mobile back button */}
        <div className="md:hidden flex items-center px-4 py-2 border-b border-gray-800 bg-[#0d0d12]">
          <button
            onClick={() => setShowSidebar(true)}
            className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
          >
            ← Back
          </button>
        </div>

        {selected ? (
          <ChatWindow
            conversation={selected}
            onMessageSent={fetchConversations}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-3">
            <span className="text-6xl opacity-30">✉️</span>
            <p className="text-lg text-gray-500 text-center px-4">
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
