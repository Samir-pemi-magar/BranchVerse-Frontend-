"use client";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { GetProfile } from "@/src/Services/storyApi";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [showSupport, setShowSupport] = useState(false);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const profile = await GetProfile();
        if (profile?.profilePicture) {
          setProfilePicture(profile.profilePicture);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, []);

  const handleSend = () => {
    if (!message) return;
    console.log("Message sent to admin:", message);
    alert("Message sent!");
    setMessage("");
    setShowSupport(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    const params = new URLSearchParams();
    if (value.trim()) params.set("search", value.trim());
    router.push(`/Users/StoryExplorer?${params.toString()}`);
  };

  // ✅ Helper to build nav link classes based on active route
  const navClass = (path: string) =>
    `hover:underline hover:text-[#00B8AE] hover:cursor-pointer transition-colors ${
      pathname === path || pathname.startsWith(path + "/")
        ? "text-[#00B8AE] underline"
        : "text-gray-800"
    }`;

  return (
    <div className="w-full h-[71px] bg-white border-b border-[#EBE4E4] px-[93px] py-[26px] items-center flex flex-row justify-between relative">
      {/* Left Side */}
      <div className="gap-[181px] flex">
        <p
          className="text-[#00B8AE] font-bold text-[25px] hover:cursor-pointer"
          onClick={() => router.push("/Users/Home")}
        >
          BranchVerse
        </p>

        <div className="flex flex-row font-bold gap-[31px] text-[16px] items-center">
          <p
            className={navClass("/Users/Home")}
            onClick={() => router.push("/Users/Home")}
          >
            Home
          </p>

          <p
            className={navClass("/Users/StoryExplorer")}
            onClick={() => router.push("/Users/StoryExplorer")}
          >
            Stories
          </p>

          <div className="relative">
            <p
              className="hover:underline hover:text-[#00B8AE] hover:cursor-pointer transition-colors text-gray-800"
              onClick={() => setShowSupport(!showSupport)}
            >
              Support
            </p>
            {showSupport && (
              <div className="absolute top-full mt-2 left-0 w-[300px] bg-white border border-gray-300 shadow-lg rounded-lg p-4 z-50">
                <h2 className="font-bold text-lg mb-2">Support</h2>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full h-[100px] border border-gray-300 rounded-md p-2 mb-2 outline-none resize-none"
                />
                <button
                  onClick={handleSend}
                  className="bg-[#00B8AE] text-white font-bold px-4 py-2 rounded-md hover:bg-[#008f8a] w-full"
                >
                  Send
                </button>
              </div>
            )}
          </div>

          <p
            className={navClass("/Users/chat")}
            onClick={() => router.push("/Users/chat")}
          >
            Community
          </p>

          <p
            className={navClass("/Users/StoryTitle")}
            onClick={() => router.push("/Users/StoryTitle")}
          >
            Create
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex flex-row gap-[51px] items-center">
        <div className="relative">
          <input
            className="border border-[#A7A3A3]/49 rounded-[7px] w-[274px] h-[34px] outline-none px-2.5 pr-8"
            placeholder="Search BranchVerse Stories..."
            value={searchQuery}
            onChange={handleSearch}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                router.push("/Users/StoryExplorer");
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
          )}
        </div>

        <div
          className="cursor-pointer"
          onClick={() => router.push("/Users/Profile")}
        >
          {profilePicture ? (
            <img
              src={profilePicture}
              alt="Profile"
              className="rounded-full object-cover w-[58px] h-[55px]"
            />
          ) : (
            <div className="w-[58px] h-[55px] rounded-full bg-[#00B8AE] flex items-center justify-center text-white font-bold text-lg">
              ?
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
