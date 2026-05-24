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
    formState: { errors, isSubmitting },
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');

        @keyframes orb-drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(20px, -20px) scale(1.05); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .orb-1 { animation: orb-drift 14s ease-in-out infinite alternate; }
        .orb-2 { animation: orb-drift 14s ease-in-out infinite alternate; animation-delay: -6s; }
        .fade-up { animation: fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }

        .noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          border: 0.5px solid rgba(255, 255, 255, 0.09);
          border-radius: 20px;
          backdrop-filter: blur(12px);
        }

        .dark-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 0.5px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.85);
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          padding: 13px 16px;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          caret-color: #15b0b7;
        }
        .dark-input::placeholder { color: rgba(255, 255, 255, 0.2); }
        .dark-input:focus {
          border-color: rgba(21, 176, 183, 0.45);
          background: rgba(21, 176, 183, 0.04);
        }
        .dark-input.input-error {
          border-color: rgba(248, 113, 113, 0.45);
          background: rgba(248, 113, 113, 0.04);
        }

        .gradient-btn {
          width: 100%;
          background: linear-gradient(130deg, #6c4ef2 0%, #15b0b7 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 15px;
          padding: 13px 0;
          cursor: pointer;
          transition: all 0.2s;
        }
        .gradient-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .gradient-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .section-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.3);
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>

      <div
        className="relative min-h-screen flex items-center justify-center px-4"
        style={{ background: "#0d0d12", fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Orbs */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div
            className="orb-1 absolute rounded-full"
            style={{
              width: 480,
              height: 480,
              background: "#6c4ef2",
              filter: "blur(110px)",
              opacity: 0.18,
              top: -120,
              right: -80,
            }}
          />
          <div
            className="orb-2 absolute rounded-full"
            style={{
              width: 340,
              height: 340,
              background: "#15b0b7",
              filter: "blur(90px)",
              opacity: 0.18,
              bottom: -80,
              left: -80,
            }}
          />
        </div>
        <div className="noise fixed inset-0 z-[1] opacity-[0.03] pointer-events-none" />

        {/* Card */}
        <div className="fade-up relative z-[2] glass-card w-full max-w-[420px] px-8 py-10 flex flex-col gap-7">
          {/* Icon */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(108,78,242,0.2), rgba(21,176,183,0.2))",
                border: "0.5px solid rgba(255,255,255,0.1)",
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C9.243 2 7 4.243 7 7v2H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2v-9a2 2 0 00-2-2h-2V7c0-2.757-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3v2H9V7c0-1.654 1.346-3 3-3zm0 10a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"
                  fill="url(#lock-grad)"
                />
                <defs>
                  <linearGradient
                    id="lock-grad"
                    x1="0"
                    y1="0"
                    x2="24"
                    y2="24"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#6c4ef2" />
                    <stop offset="100%" stopColor="#15b0b7" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="text-center">
              <span className="section-label">Account Recovery</span>
              <h1
                className="text-white mt-1"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 26,
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                Forgot Password?
              </h1>
              <p
                className="mt-2 text-sm"
                style={{ color: "rgba(255,255,255,0.38)", lineHeight: 1.6 }}
              >
                Enter your email and we will send you a link to reset your
                password.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{ height: "0.5px", background: "rgba(255,255,255,0.07)" }}
          />

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <div className="flex flex-col gap-2">
              <label className="section-label">Email Address</label>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email",
                  },
                })}
                type="email"
                placeholder="you@example.com"
                className={`dark-input ${errors.email ? "input-error" : ""}`}
              />
              {errors.email && (
                <p
                  className="text-sm flex items-center gap-1.5"
                  style={{
                    color: "#f87171",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 4v4m0 2v.5"
                      stroke="#f87171"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="gradient-btn mt-1"
            >
              {isSubmitting ? "Sending…" : "Send Reset Link"}
            </button>
          </form>

          {/* Footer link */}
          <p
            className="text-center text-sm"
            style={{
              color: "rgba(255,255,255,0.28)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Remembered it?{" "}
            <a
              href="/auth/login"
              className="font-semibold transition-colors"
              style={{ color: "#15b0b7" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1dd3db")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#15b0b7")}
            >
              Back to Login
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
