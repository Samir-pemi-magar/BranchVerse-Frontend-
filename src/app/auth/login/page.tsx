"use client";
import { useRouter } from "next/navigation";
import { FaGoogle } from "react-icons/fa";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { login as loginApi } from "@/src/Services/authapi";

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function Login() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    const toastId = toast.loading("Logging in...");
    try {
      const res = await loginApi({
        email: data.email,
        password: data.password,
      });

      // Save token in localStorage
      localStorage.setItem("token", res.token);

      toast.success(res.msg || "Login successful!", { id: toastId });

      // Redirect to dashboard
      router.push("/Users/Home");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { msg?: string } } };
      toast.error(err.response?.data?.msg || "Login failed", { id: toastId });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-linear-to-tr from-[#A491D4] via-[#D1BFE3] to-[#F4E0E0] pb-5 pt-25">
      <div className="bg-white p-8 rounded-2xl shadow-md h-[815px] w-[516px] pt-[41px] px-[63px] pb-[41px] flex flex-col items-center">
        <div className="flex flex-col items-center gap-5">
          <div className="flex items-center flex-col text-[36px] font-bold">
            <p>Welcome Back to</p>
            <p>BranchVerse</p>
          </div>
          <p className="text-[#837E7E] text-[18px] font-bold">
            Continue your story telling journey
          </p>
        </div>

        <form
          className="flex flex-col items-start w-full mt-5 gap-[27px]"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-4 w-full">
            <label className="font-semibold text-[18px]">Email</label>
            <input
              {...register("email")}
              className="border border-[#C1BBBB]/49 rounded-[7px] w-full h-[55px] outline-none px-2.5"
              placeholder="Enter your Email..."
            />
          </div>

          <div className="flex flex-col gap-4 w-full">
            <label className="font-semibold text-[18px]">Password</label>
            <input
              {...register("password")}
              type="password"
              className="border border-[#C1BBBB]/49 rounded-[7px] w-full h-[55px] outline-none px-2.5"
              placeholder="Enter your Password..."
            />
          </div>

          <div className="flex flex-col items-end w-full gap-[23px] mt-[13px]">
            <p className="text-[#00B8AE] font-bold text-[18px]">
              Forgot Password?
            </p>
            <button
              type="submit"
              className="w-full h-[55px] bg-linear-to-r from-[#15B0B7] to-[#957BDA] rounded-[7px]"
            >
              Log In
            </button>
          </div>
        </form>

        <div className="flex items-center gap-3 w-full mt-11">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="text-sm text-gray-500">Or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <div className="flex items-center mt-[39px] gap-[37px] justify-between bg-white border border-[#C1BBBB] py-[17px] px-15 rounded-[7px] h-[55px] w-full">
          <FaGoogle className="h-[34px] w-[34px]" />
          <p className="text-[24px]">Login With Google</p>
        </div>

        <p className="text-[16px] flex flex-row gap-1 mt-[30px]">
          Don`t have an account? <span className="text-[#00B8AE]">Sign up</span>
        </p>
      </div>
    </div>
  );
}
