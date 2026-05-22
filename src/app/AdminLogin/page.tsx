"use client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import adminAxios from "@/src/Services/adminAxios";

type AdminLoginForm = { email: string; password: string };

export default function AdminLogin() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<AdminLoginForm>();

  const onSubmit = async (data: AdminLoginForm) => {
    const toastId = toast.loading("Logging in...");
    try {
      const res = await adminAxios.post("/api/admin/login", data);
      localStorage.setItem("adminToken", res.data.token);
      toast.success("Welcome, Admin!", { id: toastId });
      router.push("/Admin/Dashboard");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { msg?: string } } };
      toast.error(e.response?.data?.msg || "Login failed", { id: toastId });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-950 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm bg-neutral-900 border border-neutral-800 p-6 sm:p-8 flex flex-col gap-4"
      >
        <div className="mb-2">
          <p className="text-[10px] tracking-widest text-neutral-500 uppercase mb-1">
            Admin Panel
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Sign In
          </h1>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] tracking-widest text-neutral-500 uppercase">
            Email
          </label>
          <input
            {...register("email", { required: true })}
            type="email"
            placeholder="admin@example.com"
            className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 text-neutral-200 text-sm font-mono placeholder:text-neutral-600 outline-none focus:border-neutral-500 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] tracking-widest text-neutral-500 uppercase">
            Password
          </label>
          <input
            {...register("password", { required: true })}
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 text-neutral-200 text-sm font-mono placeholder:text-neutral-600 outline-none focus:border-neutral-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          className="mt-2 w-full px-5 py-3 bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs tracking-widest hover:border-neutral-500 hover:text-neutral-100 transition-colors font-mono cursor-pointer"
        >
          LOG IN
        </button>
      </form>
    </div>
  );
}
