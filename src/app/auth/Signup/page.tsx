"use client";
import { useForm } from "react-hook-form";
import { FaGoogle } from "react-icons/fa";
import toast from "react-hot-toast";
import { signup as signupApi } from "@/src/Services/authapi";

interface SignupFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Signup() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>();

  const password = watch("password", ""); // default value

  const onSubmit = async (data: SignupFormData) => {
    const toastId = toast.loading("Signing you up...");
    try {
      const res = await signupApi({
        username: data.username,
        email: data.email,
        password: data.password,
      });

      if (res.status === 201) {
        toast.success("Signup successful!", { id: toastId });
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Signup failed", {
        id: toastId,
      });
    }
  };

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

        <form
          className="flex flex-col items-start w-full mt-5 gap-[27px]"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Username */}
          <div className="flex flex-col gap-4 w-full">
            <label className="font-semibold text-[18px]">Username</label>
            <input
              {...register("username", { required: "Username is required" })}
              className={`border rounded-[7px] w-full h-[55px] outline-none px-2.5 ${
                errors.username ? "border-red-500" : "border-[#C1BBBB]/49"
              }`}
              placeholder="Enter your Username..."
            />
            {errors.username && (
              <span className="text-red-500 text-sm">
                {errors.username.message}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-4 w-full">
            <label className="font-semibold text-[18px]">Email</label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
              className={`border rounded-[7px] w-full h-[55px] outline-none px-2.5 ${
                errors.email ? "border-red-500" : "border-[#C1BBBB]/49"
              }`}
              placeholder="Enter your Email..."
            />
            {errors.email && (
              <span className="text-red-500 text-sm">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-4 w-full">
            <label className="font-semibold text-[18px]">Password</label>
            <input
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Minimum 6 characters" },
              })}
              className={`border rounded-[7px] w-full h-[55px] outline-none px-2.5 ${
                errors.password ? "border-red-500" : "border-[#C1BBBB]/49"
              }`}
              placeholder="Enter your Password..."
            />
            {errors.password && (
              <span className="text-red-500 text-sm">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-4 w-full">
            <label className="font-semibold text-[18px]">
              Confirm Password
            </label>
            <input
              type="password"
              {...register("confirmPassword", {
                required: "Confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              className={`border rounded-[7px] w-full h-[55px] outline-none px-2.5 ${
                errors.confirmPassword
                  ? "border-red-500"
                  : "border-[#C1BBBB]/49"
              }`}
              placeholder="Confirm your Password..."
            />
            {errors.confirmPassword && (
              <span className="text-red-500 text-sm">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex flex-col items-end w-full gap-[23px] mt-10">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[55px] bg-linear-to-r from-[#15B0B7] to-[#957BDA] rounded-[7px] disabled:opacity-50"
            >
              {isSubmitting ? "Signing up..." : "Sign up"}
            </button>
          </div>
        </form>

        {/* OR divider */}
        <div className="flex items-center gap-3 w-full mt-11">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="text-sm text-gray-500">Or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Google Signup */}
        <div className="flex items-center mt-[39px] justify-between bg-white border border-[#C1BBBB] py-[17px] px-15 rounded-[7px] h-[55px] w-full cursor-pointer">
          <FaGoogle className="h-[34px] w-[34px]" />
          <p className="text-[24px]">Signup With Google</p>
        </div>

        <p className="text-[16px] flex flex-row gap-1 mt-[39px]">
          Already have an account?{" "}
          <span
            className="text-[#00B8AE] cursor-pointer"
            onClick={() => (window.location.href = "/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
