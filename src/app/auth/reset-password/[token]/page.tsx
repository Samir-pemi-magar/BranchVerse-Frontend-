"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { resetPassword } from "@/src/Services/authapi";

type Form = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Form>();

  const password = watch("password");

  const onSubmit = async (data: Form) => {
    const toastId = toast.loading("Resetting password...");

    try {
      const res = await resetPassword(token as string, data.password);
      toast.success(res.msg || "Password reset successful", { id: toastId });
      router.push("/auth/login");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as {
          response?: { data?: { msg?: string } };
        };

        toast.error(axiosError.response?.data?.msg || "Failed", {
          id: toastId,
        });
      } else {
        toast.error("Failed", { id: toastId });
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-xl shadow-md w-[400px]"
      >
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>

        {/* New Password */}
        <input
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
          type="password"
          placeholder="New password"
          className="border w-full p-3 rounded-md mb-2"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mb-2">{errors.password.message}</p>
        )}

        {/* Confirm Password */}
        <input
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => value === password || "Passwords do not match",
          })}
          type="password"
          placeholder="Confirm password"
          className="border w-full p-3 rounded-md mb-2"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mb-2">
            {errors.confirmPassword.message}
          </p>
        )}

        <button className="w-full bg-green-600 text-white p-3 rounded-md mt-2">
          Reset Password
        </button>
      </form>
    </div>
  );
}
