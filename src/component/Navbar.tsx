import Image from "next/image";
export default function Navbar() {
  return (
    <div className="w-full h-[71px] bg-white border-b border-[#EBE4E4] px-[93px] py-[26px] items-center flex flex-row justify-between">
      <div className="gap-[181px] flex">
        <p className="text-[#00B8AE] font-bold text-[25px]">BranchVerse</p>
        <div className="flex flex-row font-bold gap-[31px] text-[16px] items-center ">
          <p className="hover:underline hover:text-[#00B8AE]">Home</p>
          <p className="hover:underline hover:text-[#00B8AE]">Stories</p>
          <p className="hover:underline hover:text-[#00B8AE]">Community</p>
          <p className="hover:underline hover:text-[#00B8AE]">Support</p>
          <p className="hover:underline hover:text-[#00B8AE]">Create</p>
        </div>
      </div>
      <div className="flex flex-row gap-[51px] items-center">
        <input
          className="border border-[#A7A3A3]/49 rounded-[7px] w-[274px] h-[34px] outline-none px-2.5"
          placeholder="Search BranchVerse Stories..."
        ></input>
        <Image src="/" alt="Profile" width={58} height={55} />
      </div>
    </div>
  );
}
