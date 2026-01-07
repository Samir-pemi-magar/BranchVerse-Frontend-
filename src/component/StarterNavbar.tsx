"use client";

import { useRouter } from "next/navigation";
export default function StarterNavbar() {
  const router = useRouter();
  return (
    <div className="fixed w-full h-[71px] bg-white border-b border-[#EBE4E4] pl-[93px] pr-[193px] py-[26px] items-center flex flex-row justify-between">
      <p className="text-[#00B8AE] font-bold text-[25px] hover:cursor-pointer">
        BranchVerse
      </p>
      <div className="font-bold flex flex-row gap-[43px] text-[16px]">
        <p
          onClick={() => router.push("/auth/login")}
          className="cursor-pointer hover:underline hover:text-[#00B8AE]"
        >
          Login
        </p>
        <p
          onClick={() => router.push("/auth/Signup")}
          className="cursor-pointer hover:underline hover:text-[#00B8AE]"
        >
          Sign up
        </p>
      </div>
    </div>
  );
}
