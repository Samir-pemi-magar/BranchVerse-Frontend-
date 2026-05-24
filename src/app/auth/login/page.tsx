"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { getPreferences, login as loginApi } from "@/src/Services/authapi";
import PreferencesModal from "@/src/component/PreferencesModal";
import { useEffect, useState } from "react";
import Link from "next/link";

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function Login() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<LoginFormInputs>();
  const [showPreferences, setShowPreferences] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    const toastId = toast.loading("Logging in...");
    try {
      const res = await loginApi({
        email: data.email,
        password: data.password,
      });

      localStorage.setItem("token", res.token);
      localStorage.setItem("userId", res.user._id);

      toast.success(res.msg || "Login successful!", { id: toastId });

      const prefRes = await getPreferences();

      if (!prefRes?.preferences || prefRes.preferences.genres.length === 0) {
        setShowPreferences(true);
      } else {
        router.push("/Users/Home");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { msg?: string } } };
      toast.error(err.response?.data?.msg || "Login failed", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "banned") {
      toast.error("Your account has been banned. Please contact support.");
    }
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }

        @keyframes bvDrift {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(30px, -30px) scale(1.06); }
        }
        @keyframes bvSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bv-spin {
          to { transform: rotate(360deg); }
        }

        .orb-1 { animation: bvDrift 12s ease-in-out infinite alternate; animation-delay: 0s; }
        .orb-2 { animation: bvDrift 12s ease-in-out infinite alternate; animation-delay: -4s; }
        .orb-3 { animation: bvDrift 12s ease-in-out infinite alternate; animation-delay: -8s; }

        .card-animate { animation: bvSlideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }

        .hero-gradient {
          background: linear-gradient(90deg, #15b0b7, #957bda);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .btn-login-gradient {
          background: linear-gradient(130deg, #6c4ef2 0%, #15b0b7 100%);
        }
        .btn-login-gradient::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          pointer-events: none;
        }

        .brand-icon-gradient {
          background: linear-gradient(135deg, #6c4ef2, #15b0b7);
        }

        .noise-bg {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px;
        }

        .input-focus:focus {
          border-color: rgba(108, 78, 242, 0.6) !important;
          background: rgba(108, 78, 242, 0.06) !important;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 0.5px;
          background: rgba(255,255,255,0.08);
        }

        .btn-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: bv-spin 0.7s linear infinite;
          flex-shrink: 0;
        }
      `}</style>

      <div
        className="font-dm relative min-h-screen overflow-hidden flex items-center justify-center"
        style={{ background: "#0d0d12" }}
      >
        {/* Background Orbs */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div
            className="orb-1 absolute rounded-full"
            style={{
              width: 520,
              height: 520,
              background: "#6c4ef2",
              filter: "blur(80px)",
              opacity: 0.35,
              top: -120,
              right: -80,
            }}
          />
          <div
            className="orb-2 absolute rounded-full"
            style={{
              width: 380,
              height: 380,
              background: "#15b0b7",
              filter: "blur(80px)",
              opacity: 0.35,
              bottom: -80,
              left: -60,
            }}
          />
          <div
            className="orb-3 absolute rounded-full"
            style={{
              width: 260,
              height: 260,
              background: "#e5839a",
              filter: "blur(80px)",
              opacity: 0.18,
              top: "40%",
              left: "30%",
            }}
          />
        </div>

        {/* Noise overlay */}
        <div className="noise-bg fixed inset-0 z-[1] opacity-[0.03] pointer-events-none" />

        {/* Page Wrap */}
        <div className="relative z-[2] w-full min-h-screen flex items-center justify-center px-6 py-8">
          <div className="flex w-full max-w-[1100px] items-center justify-center gap-0">
            {/* LEFT PANEL */}
            <div className="hidden lg:flex flex-1 flex-col justify-center pr-14 pl-6 max-w-[460px]">
              {/* Brand */}
              <div className="flex items-center gap-3 mb-12">
                <div className="brand-icon-gradient w-[42px] h-[42px] rounded-xl flex items-center justify-center shrink-0">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2L4 7l8 5 8-5-8-5z" />
                    <path d="M4 12l8 5 8-5" />
                    <path d="M4 17l8 5 8-5" />
                  </svg>
                </div>
                <span className="font-playfair text-[22px] font-bold text-white tracking-tight">
                  BranchVerse
                </span>
              </div>

              {/* Hero */}
              <div>
                <h1
                  className="font-playfair font-bold text-white leading-[1.1] tracking-[-1.5px] mb-5"
                  style={{ fontSize: "clamp(2.4rem, 4vw, 3.2rem)" }}
                >
                  Every choice
                  <br />
                  writes a new
                  <br />
                  <em className="hero-gradient not-italic">chapter.</em>
                </h1>
                <p
                  className="text-[15px] font-light leading-[1.7] mb-10 max-w-[340px]"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  Step back into a universe where your decisions shape the
                  story. Thousands of branching paths, one narrative — yours.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Collaborative Fiction",
                    "Branching Narratives",
                    "World-Building",
                    "Community Stories",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium rounded-full px-[14px] py-[5px] tracking-[0.4px]"
                      style={{
                        color: "rgba(255,255,255,0.55)",
                        border: "0.5px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.04)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* FORM CARD */}
            <div
              className="card-animate shrink-0 w-full max-w-[420px] rounded-[28px] px-[2.8rem] py-12 backdrop-blur-2xl"
              style={{
                background: "rgba(255,255,255,0.035)",
                border: "0.5px solid rgba(255,255,255,0.1)",
              }}
            >
              {/* Card Header */}
              <div className="mb-8">
                <h2 className="font-playfair text-[26px] font-bold text-white tracking-[-0.5px] mb-1.5">
                  Welcome back
                </h2>
                <p
                  className="text-sm font-light"
                  style={{ color: "rgba(255,255,255,0.38)" }}
                >
                  Sign in to continue your story
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-[1.1rem] mb-4">
                  {/* Email */}
                  <div className="flex flex-col gap-[7px]">
                    <label
                      className="text-[13px] font-medium tracking-[0.2px]"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      Email address
                    </label>
                    <div className="relative flex items-center">
                      <span
                        className="absolute left-[15px] flex items-center pointer-events-none z-[1]"
                        style={{ color: "rgba(255,255,255,0.25)" }}
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </span>
                      <input
                        {...register("email")}
                        type="email"
                        className="input-focus w-full h-[52px] rounded-xl text-white text-sm outline-none transition-all duration-200 pl-[44px] pr-[44px]"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "0.5px solid rgba(255,255,255,0.1)",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-[7px]">
                    <label
                      className="text-[13px] font-medium tracking-[0.2px]"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      Password
                    </label>
                    <div className="relative flex items-center">
                      <span
                        className="absolute left-[15px] flex items-center pointer-events-none z-[1]"
                        style={{ color: "rgba(255,255,255,0.25)" }}
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="3"
                            y="11"
                            width="18"
                            height="11"
                            rx="2"
                            ry="2"
                          />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                      <input
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        className="input-focus w-full h-[52px] rounded-xl text-white text-sm outline-none transition-all duration-200 pl-[44px] pr-[44px]"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "0.5px solid rgba(255,255,255,0.1)",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-[14px] z-[1] flex items-center bg-transparent border-none cursor-pointer p-1 transition-colors duration-150 hover:text-white/55"
                        style={{ color: "rgba(255,255,255,0.25)" }}
                      >
                        {showPassword ? (
                          <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remember me + Forgot password */}
                <div className="flex items-center justify-between mb-6 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-4 h-4 cursor-pointer accent-[#6c4ef2]"
                    />
                    <span
                      className="text-[13px]"
                      style={{ color: "rgba(255,255,255,0.38)" }}
                    >
                      Remember me
                    </span>
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[13px] font-medium text-[#15b0b7] no-underline hover:opacity-75 transition-opacity duration-150"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-login-gradient relative w-full h-[52px] rounded-xl text-white text-[15px] font-medium border-none cursor-pointer overflow-hidden transition-all duration-200 hover:opacity-[0.88] hover:-translate-y-px active:scale-[0.99] mb-4 tracking-[0.2px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <span className="flex items-center justify-center gap-2">
                    {isLoading && <span className="btn-spinner" />}
                    {isLoading ? "Logging in..." : "Log in"}
                  </span>
                </button>
              </form>

              {/* Divider */}
              <div className="divider flex items-center gap-3 my-[1.4rem]">
                <span
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  or continue with
                </span>
              </div>

              {/* Google Button */}
              <div
                className="w-full h-[52px] rounded-xl flex items-center justify-center gap-[11px] text-sm cursor-pointer no-underline transition-all duration-200 hover:text-white"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "0.5px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.75)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onClick={() =>
                  (window.location.href =
                    "http://localhost:4000/api/auth/google")
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  (window.location.href =
                    "http://localhost:4000/api/auth/google")
                }
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                Continue with Google
              </div>

              {/* Sign up link */}
              <p
                className="text-center mt-6 text-[13px]"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/Signup"
                  className="text-[#957bda] font-medium no-underline hover:opacity-75 transition-opacity duration-150"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <PreferencesModal
        isOpen={showPreferences}
        onClose={() => {
          setShowPreferences(false);
          router.push("/Users/Home");
        }}
      />
    </>
  );
}
