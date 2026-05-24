"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { GetProfile } from "@/src/Services/storyApi";

const HamburgerIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = ({ size = 22 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ProfileAvatar = ({
  size,
  picture,
}: {
  size: "sm" | "lg";
  picture: string | null;
}) => {
  const imgCls =
    size === "lg"
      ? "rounded-full object-cover w-[48px] h-[48px]"
      : "rounded-full object-cover w-[36px] h-[36px]";
  const fallbackCls =
    size === "lg"
      ? "w-[48px] h-[48px] rounded-full bg-[#00B8AE] flex items-center justify-center text-white font-bold text-lg"
      : "w-[36px] h-[36px] rounded-full bg-[#00B8AE] flex items-center justify-center text-white font-bold text-sm";
  return picture ? (
    <img src={picture} alt="Profile" className={imgCls} />
  ) : (
    <div className={fallbackCls}>?</div>
  );
};

const ISSUE_TYPES = [
  "Bug or error",
  "Inappropriate content",
  "Account problem",
  "Feature request",
  "Other",
];

const SupportForm = ({
  issueType,
  setIssueType,
  message,
  setMessage,
  sending,
  onSend,
  textareaClass,
}: {
  issueType: string;
  setIssueType: (v: string) => void;
  message: string;
  setMessage: (v: string) => void;
  sending: boolean;
  onSend: () => void;
  textareaClass: string;
}) => (
  <>
    <select
      value={issueType}
      onChange={(e) => setIssueType(e.target.value)}
      className="w-full rounded-md p-2 mb-2 outline-none text-sm text-gray-200"
      style={{
        background: "#1a1a26",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <option value="">Select issue type…</option>
      {ISSUE_TYPES.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
    <textarea
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      placeholder="Describe your issue…"
      className={textareaClass}
    />
    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="shrink-0"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
      Your identity is never stored or shared.
    </p>
    <button
      onClick={onSend}
      disabled={!issueType || !message.trim() || sending}
      className="bg-[#00B8AE] text-white font-bold px-4 py-2 rounded-md hover:bg-[#008f8a] w-full disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
    >
      {sending ? "Sending…" : "Send message"}
    </button>
  </>
);

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [showSupport, setShowSupport] = useState(false);
  const [message, setMessage] = useState("");
  const [issueType, setIssueType] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token =
        localStorage.getItem("token") ?? sessionStorage.getItem("token");
      if (!token) return;
      try {
        const profile = await GetProfile();
        if (profile?.profilePicture) setProfilePicture(profile.profilePicture);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const navigate = useCallback(
    (path: string) => {
      setMenuOpen(false);
      setSearchOpen(false);
      setShowSupport(false);
      router.push(path);
    },
    [router],
  );

  const resetSupportForm = () => {
    setMessage("");
    setIssueType("");
    setShowSupport(false);
  };

  const handleSend = async () => {
    if (!issueType || !message.trim()) return;
    setSending(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASEURL}/api/auth/support`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ issueType, message: message.trim() }),
        },
      );
      if (res.ok) {
        alert("Message sent! Your report is anonymous.");
        resetSupportForm();
      } else alert("Failed to send. Please try again.");
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    const params = new URLSearchParams();
    if (value.trim()) params.set("search", value.trim());
    router.push(`/Users/StoryExplorer?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearchQuery("");
    router.push("/Users/StoryExplorer");
  };

  const navLinks = [
    { label: "Home", path: "/Users/Home" },
    { label: "Stories", path: "/Users/StoryExplorer" },
    { label: "Community", path: "/Users/chat" },
    { label: "Create", path: "/Users/StoryTitle" },
  ];

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  const linkClass = (path: string) =>
    `font-bold text-[16px] transition-colors hover:text-[#00B8AE] hover:underline cursor-pointer ${
      isActive(path) ? "text-[#00B8AE] underline" : "text-gray-300"
    }`;

  return (
    <div
      className="w-full relative z-50"
      style={{
        background: "#0d0d12",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Main bar */}
      <div className="flex items-center justify-between h-[71px] px-6 md:px-12 lg:px-[93px]">
        {/* Logo */}
        <p
          className="text-[#00B8AE] font-bold text-[22px] md:text-[25px] cursor-pointer shrink-0"
          onClick={() => navigate("/Users/Home")}
        >
          BranchVerse
        </p>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex flex-row font-bold gap-[31px] text-[16px] items-center">
          {navLinks.map(({ label, path }) => (
            <p
              key={path}
              className={linkClass(path)}
              onClick={() => navigate(path)}
            >
              {label}
            </p>
          ))}

          {/* Support dropdown */}
          <div className="relative">
            <p
              className="font-bold text-[16px] text-gray-300 hover:text-[#00B8AE] hover:underline cursor-pointer transition-colors"
              onClick={() => setShowSupport(!showSupport)}
            >
              Support
            </p>
            {showSupport && (
              <div
                className="absolute top-full mt-2 left-0 w-[300px] shadow-2xl rounded-lg p-4 z-50 border border-white/10"
                style={{ background: "#161620" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-lg text-white">
                    Contact Support
                  </h2>
                  <button
                    onClick={resetSupportForm}
                    className="text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <CloseIcon size={16} />
                  </button>
                </div>
                <SupportForm
                  issueType={issueType}
                  setIssueType={setIssueType}
                  message={message}
                  setMessage={setMessage}
                  sending={sending}
                  onSend={handleSend}
                  textareaClass="w-full h-[100px] rounded-md p-2 mb-2 outline-none resize-none text-sm text-gray-200 placeholder-gray-600"
                  // style applied via inline in the component itself via passed class
                />
              </div>
            )}
          </div>
        </div>

        {/* Desktop Right Side */}
        <div className="hidden lg:flex flex-row gap-[51px] items-center">
          <div className="relative">
            <input
              className="rounded-[7px] w-[274px] h-[34px] outline-none px-2.5 pr-8 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-[#00B8AE]"
              style={{
                background: "#13131c",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              placeholder="Search BranchVerse Stories..."
              value={searchQuery}
              onChange={handleSearch}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-sm"
              >
                ✕
              </button>
            )}
          </div>
          <div
            className="cursor-pointer"
            onClick={() => navigate("/Users/Profile")}
          >
            <ProfileAvatar size="lg" picture={profilePicture} />
          </div>
        </div>

        {/* Mobile Right: Search icon + Profile + Hamburger */}
        <div className="flex lg:hidden items-center gap-4">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-gray-400 hover:text-[#00B8AE] transition-colors p-1"
            aria-label="Toggle search"
          >
            {searchOpen ? <CloseIcon size={20} /> : <SearchIcon />}
          </button>
          <div
            className="cursor-pointer"
            onClick={() => navigate("/Users/Profile")}
          >
            <ProfileAvatar size="sm" picture={profilePicture} />
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-400 hover:text-[#00B8AE] transition-colors p-1"
            aria-label="Toggle menu"
          >
            {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      {searchOpen && (
        <div
          className="lg:hidden px-6 pb-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="relative mt-3">
            <input
              ref={searchRef}
              className="w-full rounded-[7px] h-[38px] outline-none px-3 pr-9 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-[#00B8AE]"
              style={{
                background: "#13131c",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              placeholder="Search BranchVerse Stories..."
              value={searchQuery}
              onChange={handleSearch}
            />
            {searchQuery ? (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-sm"
              >
                ✕
              </button>
            ) : (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">
                <SearchIcon />
              </span>
            )}
          </div>
        </div>
      )}

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div
          className="lg:hidden px-6 py-4 flex flex-col gap-1"
          style={{
            background: "#0d0d12",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {navLinks.map(({ label, path }) => (
            <p
              key={path}
              onClick={() => navigate(path)}
              className={`py-2.5 font-bold text-[15px] cursor-pointer transition-colors ${
                isActive(path)
                  ? "text-[#00B8AE]"
                  : "text-gray-300 hover:text-[#00B8AE]"
              }`}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              {label}
            </p>
          ))}

          <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <p
              className="py-2.5 font-bold text-[15px] text-gray-300 hover:text-[#00B8AE] cursor-pointer transition-colors"
              onClick={() => setShowSupport(!showSupport)}
            >
              Support
            </p>
            {showSupport && (
              <div className="pb-3">
                <SupportForm
                  issueType={issueType}
                  setIssueType={setIssueType}
                  message={message}
                  setMessage={setMessage}
                  sending={sending}
                  onSend={handleSend}
                  textareaClass="w-full h-[90px] rounded-md p-2 mb-2 outline-none resize-none text-sm text-gray-200 placeholder-gray-600"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
