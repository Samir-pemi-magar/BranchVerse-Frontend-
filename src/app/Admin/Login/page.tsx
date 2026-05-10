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
    console.log("Submitting:", data);
    const toastId = toast.loading("Logging in...");
    try {
      const res = await adminAxios.post("/api/admin/login", data);
      console.log("Response:", res.data);
      localStorage.setItem("adminToken", res.data.token);
      toast.success("Welcome, Admin!", { id: toastId });
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      console.error("Full error:", err);
      const e = err as { response?: { data?: { msg?: string } } };
      console.log("Server says:", e.response?.data); // add this
      toast.error(e.response?.data?.msg || "Login failed", { id: toastId });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-xl shadow w-96 flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-center">Admin Login</h1>
        <input
          {...register("email", { required: true })}
          type="email"
          placeholder="Admin Email"
          className="border rounded p-2"
        />
        <input
          {...register("password", { required: true })}
          type="password"
          placeholder="Password"
          className="border rounded p-2"
        />
        <button
          type="submit"
          className="bg-purple-600 text-white rounded p-2 font-semibold"
        >
          Log In
        </button>
      </form>
    </div>
  );
}
