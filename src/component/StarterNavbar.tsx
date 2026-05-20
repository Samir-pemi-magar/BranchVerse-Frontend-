"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StarterNavbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="fixed w-full bg-white border-b border-[#EBE4E4] z-50">
      <div className="flex items-center justify-between h-[71px] px-6 md:px-12 lg:pl-[93px] lg:pr-[193px]">
        {/* Logo */}
        <p
          className="text-[#00B8AE] font-bold text-[22px] md:text-[25px] cursor-pointer"
          onClick={() => router.push("/")}
        >
          BranchVerse
        </p>

        {/* Desktop links */}
        <div className="hidden sm:flex font-bold flex-row gap-[43px] text-[16px]">
          <p
            onClick={() => router.push("/auth/login")}
            className="cursor-pointer hover:underline hover:text-[#00B8AE] transition-colors text-gray-800"
          >
            Login
          </p>
          <p
            onClick={() => router.push("/auth/Signup")}
            className="cursor-pointer hover:underline hover:text-[#00B8AE] transition-colors text-gray-800"
          >
            Sign up
          </p>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden text-gray-700 hover:text-[#00B8AE] transition-colors p-1"
          aria-label="Toggle menu"
        >
          {menuOpen ? (
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
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
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t border-[#EBE4E4] bg-white px-6 py-3 flex flex-col">
          <p
            onClick={() => {
              router.push("/auth/login");
              setMenuOpen(false);
            }}
            className="py-3 font-bold text-[15px] text-gray-700 hover:text-[#00B8AE] border-b border-gray-100 cursor-pointer transition-colors"
          >
            Login
          </p>
          <p
            onClick={() => {
              router.push("/auth/Signup");
              setMenuOpen(false);
            }}
            className="py-3 font-bold text-[15px] text-gray-700 hover:text-[#00B8AE] cursor-pointer transition-colors"
          >
            Sign up
          </p>
        </div>
      )}
    </div>
  );
}
