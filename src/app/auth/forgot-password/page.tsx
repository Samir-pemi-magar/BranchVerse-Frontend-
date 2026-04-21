"use client";

import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";
import { forgotPassword } from "@/src/Services/authapi";

type ForgotForm = {
  email: string;
};

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>();

  const onSubmit = async (data: ForgotForm) => {
    const toastId = toast.loading("Sending reset link...");

    try {
      const res = await forgotPassword(data.email);
      toast.success(res.msg || "Reset link sent!", { id: toastId });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.msg || "Failed", { id: toastId });
      } else {
        toast.error("Something went wrong", { id: toastId });
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-xl shadow-md w-[400px]"
      >
        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>

        <input
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email",
            },
          })}
          type="email"
          placeholder="Enter your email"
          className="border w-full p-3 rounded-md mb-2"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mb-2">{errors.email.message}</p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-md mt-2"
        >
          Send Reset Link
        </button>
      </form>
    </div>
  );
}
