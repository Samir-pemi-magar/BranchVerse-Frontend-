"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [showSupport, setShowSupport] = useState(false);
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message) return;

    console.log("Message sent to admin:", message);
    alert("Message sent!");
    setMessage("");
    setShowSupport(false);
  };

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
            className="hover:underline hover:text-[#00B8AE] hover:cursor-pointer"
            onClick={() => router.push("/Users/Home")}
          >
            Home
          </p>

          <p
            className="hover:underline hover:text-[#00B8AE] hover:cursor-pointer"
            onClick={() => router.push("/Users/StoryExplorer")}
          >
            Stories
          </p>

          {/* ✅ Support with dropdown below */}
          <div className="relative">
            <p
              className="hover:underline hover:text-[#00B8AE] hover:cursor-pointer"
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

          <p className="hover:underline hover:text-[#00B8AE] hover:cursor-pointer">
            Community
          </p>

          <p
            className="hover:underline hover:text-[#00B8AE] hover:cursor-pointer"
            onClick={() => router.push("/Users/StoryTitle")}
          >
            Create
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex flex-row gap-[51px] items-center">
        <input
          className="border border-[#A7A3A3]/49 rounded-[7px] w-[274px] h-[34px] outline-none px-2.5"
          placeholder="Search BranchVerse Stories..."
        />

        {/* Replace src with actual profile image */}
        <Image
          src="/profile.png"
          alt="Profile"
          width={58}
          height={55}
          className="rounded-full cursor-pointer"
        />
      </div>
    </div>
  );
}
