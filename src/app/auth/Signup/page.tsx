import { FaGoogle } from "react-icons/fa";
export default function Signup() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-linear-to-bl from-[#A491D4] via-[#D1BFE3] to-[#F4E0E0] pb-10 pt-27">
      <div className="bg-white p-8 rounded-2xl shadow-md h-[1019px] w-[516px] pt-[41px] px-[63px] pb-[41px] flex flex-col items-center">
        <div className="flex flex-col items-center gap-5">
          <div className="flex items-center flex-col text-[36px] font-bold">
            <p>Join BranchVerse</p>
          </div>
          <p className="text-[#837E7E] text-[18px] font-bold text-center">
            Collaborate, create, and share your stories with a vibrant community
            of writers.
          </p>
        </div>
        <div className="flex flex-col items-start w-full mt-5 gap-[27px]">
          <div className="flex flex-col gap-4 w-full">
            <label className="font-semibold text-[18px]">Username</label>
            <input
              className="border border-[#C1BBBB]/49 rounded-[7px] w-full h-[55px] outline-none px-2.5"
              placeholder="Enter your Username..."
            />
          </div>
          <div className="flex flex-col gap-4 w-full">
            <label className="font-semibold text-[18px]">Email</label>
            <input
              className="border border-[#C1BBBB]/49 rounded-[7px] w-full h-[55px] outline-none px-2.5"
              placeholder="Enter your Email..."
            />
          </div>
          <div className="flex flex-col gap-4 w-full">
            <label className="font-semibold text-[18px]">Password</label>
            <input
              className="border border-[#C1BBBB]/49 rounded-[7px] w-full h-[55px] outline-none px-2.5"
              placeholder="Enter your Password..."
            />
          </div>
          <div className="flex flex-col gap-4 w-full">
            <label className="font-semibold text-[18px]">
              Confirm Password
            </label>
            <input
              className="border border-[#C1BBBB]/49 rounded-[7px] w-full h-[55px] outline-none px-2.5"
              placeholder="Confirm your Password..."
            />
          </div>
        </div>
        <div className="flex flex-col items-end w-full gap-[23px] mt-10">
          <button className="w-full h-[55px] bg-linear-to-r from-[#15B0B7] to-[#957BDA] rounded-[7px]">
            Sign up
          </button>
        </div>
        <div className="flex items-center gap-3 w-full mt-11">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="text-sm text-gray-500">Or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>
        <div className="flex items-center mt-[39px] justify-between  bg-white border border-[#C1BBBB] py-[17px] px-15 rounded-[7px] h-[55px] w-full">
          <FaGoogle className="h-[34px] w-[34px]" />{" "}
          <p className="text-[24px]">Signup With Google</p>
        </div>
        <p className="text-[16px] flex flex-row gap-1 mt-[39px]">
          Don`t have an account? <p className="text-[#00B8AE]">Login</p>
        </p>
      </div>
    </div>
  );
}
