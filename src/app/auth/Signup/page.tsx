"use client";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { signup as signupApi } from "@/src/Services/authapi";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const router = useRouter();
  const password = watch("password", "");

  const getStrength = (pwd: string) =>
    pwd.length < 6 ? 1 : pwd.length < 10 ? 2 : 4;

  const getStrengthLabel = (pwd: string) =>
    pwd.length < 6 ? "Weak" : pwd.length < 10 ? "Medium" : "Strong";

  const getBarClass = (i: number, pwd: string) => {
    const strength = getStrength(pwd);
    if (i >= strength) return "";
    if (strength === 1) return "bg-[#E24B4A]";
    if (strength === 2) return "bg-[#EF9F27]";
    return "bg-[#1D9E75]";
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    const toastId = toast.loading("Resending verification email...");
    try {
      // Call your resend API here, e.g.:
      // await resendVerificationApi({ email: registeredEmail });
      toast.success("Verification email resent!", { id: toastId });
      startResendCooldown();
    } catch {
      toast.error("Failed to resend. Please try again.", { id: toastId });
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    const toastId = toast.loading("Signing you up...");
    try {
      const res = await signupApi({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      if (res.status === 201) {
        toast.success("Account created!", { id: toastId });
        setRegisteredEmail(data.email);
        setVerificationSent(true);
        startResendCooldown();
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string; msg?: string } };
      };
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.msg ||
          "Signup failed. Please try again.",
        { id: toastId },
      );
    }
  };

  const EyeOpen = () => (
    <svg
      width="16"
      height="16"
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
  );

  const EyeOff = () => (
    <svg
      width="16"
      height="16"
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
  );

  // ─── Verification screen ───────────────────────────────────────────
  const VerificationScreen = () => (
    <div
      className="flex flex-col items-center text-center py-4"
      style={{ animation: "bvSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) both" }}
    >
      {/* Icon */}
      <div className="relative mb-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(108,78,242,0.12)",
            border: "0.5px solid rgba(108,78,242,0.3)",
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="url(#emailGrad)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <defs>
              <linearGradient
                id="emailGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#6c4ef2" />
                <stop offset="100%" stopColor="#15b0b7" />
              </linearGradient>
            </defs>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        {/* Check badge */}
        <div
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: "#1D9E75", border: "2px solid #0d0d12" }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      <h2 className="font-playfair text-[24px] font-bold text-white tracking-[-0.5px] mb-2">
        Verify your email
      </h2>
      <p
        className="text-sm font-light mb-1"
        style={{ color: "rgba(255,255,255,0.38)" }}
      >
        We sent a verification link to
      </p>
      <p className="text-sm font-medium mb-5" style={{ color: "#957bda" }}>
        {registeredEmail}
      </p>
      <p
        className="text-[13px] font-light leading-[1.6] max-w-[300px] mb-8"
        style={{ color: "rgba(255,255,255,0.3)" }}
      >
        Click the link in the email to activate your account. It may take a
        minute to arrive — check your spam folder if you don`t see it.
      </p>

      {/* Resend */}
      <p
        className="text-[13px] mb-1"
        style={{ color: "rgba(255,255,255,0.25)" }}
      >
        Didn`t receive it?
      </p>
      <button
        onClick={handleResend}
        disabled={resendCooldown > 0}
        className="text-[13px] font-medium mb-8 bg-transparent border-none cursor-pointer transition-opacity duration-150"
        style={{
          color: resendCooldown > 0 ? "rgba(149,123,218,0.4)" : "#957bda",
          cursor: resendCooldown > 0 ? "default" : "pointer",
        }}
      >
        {resendCooldown > 0
          ? `Resend in ${resendCooldown}s`
          : "Resend verification email"}
      </button>

      {/* Back to login */}
      <button
        onClick={() => router.push("/auth/login")}
        className="w-full h-[52px] rounded-xl flex items-center justify-center gap-2 text-sm transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "0.5px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.6)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Sign In
      </button>
    </div>
  );

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

        .orb-1 { animation: bvDrift 12s ease-in-out infinite alternate; }
        .orb-2 { animation: bvDrift 12s ease-in-out infinite alternate; animation-delay: -4s; }
        .orb-3 { animation: bvDrift 12s ease-in-out infinite alternate; animation-delay: -8s; }

        .card-animate { animation: bvSlideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }

        .hero-gradient-signup {
          background: linear-gradient(90deg, #957bda, #15b0b7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .btn-submit-gradient {
          background: linear-gradient(130deg, #6c4ef2 0%, #15b0b7 100%);
        }
        .btn-submit-gradient::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          pointer-events: none;
        }

        .brand-icon-gradient { background: linear-gradient(135deg, #6c4ef2, #15b0b7); }

        .noise-bg {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px;
        }

        .input-base {
          background: rgba(255,255,255,0.05);
          border: 0.5px solid rgba(255,255,255,0.1);
          transition: border-color 0.2s, background 0.2s;
          -webkit-appearance: none;
        }
        .input-base::placeholder { color: rgba(255,255,255,0.2); }
        .input-base:focus {
          outline: none;
          border-color: rgba(108, 78, 242, 0.6);
          background: rgba(108, 78, 242, 0.06);
        }
        .input-error {
          border-color: rgba(226, 75, 74, 0.6) !important;
          background: rgba(226, 75, 74, 0.05) !important;
        }

        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 0.5px;
          background: rgba(255,255,255,0.08);
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
              left: -80,
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
              right: -60,
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
              top: "35%",
              right: "28%",
            }}
          />
        </div>
        <div className="noise-bg fixed inset-0 z-[1] opacity-[0.03] pointer-events-none" />

        <div className="relative z-[2] w-full min-h-screen flex items-center justify-center px-6 py-10">
          <div className="flex w-full max-w-[1100px] items-center justify-center gap-0">
            {/* FORM CARD */}
            <div
              className="card-animate shrink-0 w-full max-w-[440px] rounded-[28px] px-[2.8rem] py-12 backdrop-blur-2xl"
              style={{
                background: "rgba(255,255,255,0.035)",
                border: "0.5px solid rgba(255,255,255,0.1)",
              }}
            >
              {/* Brand header — always visible */}
              {!verificationSent && (
                <div className="mb-7">
                  <div className="flex items-center gap-[10px] mb-6">
                    <div className="brand-icon-gradient w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0">
                      <svg
                        width="18"
                        height="18"
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
                    <span className="font-playfair text-[19px] font-bold text-white tracking-tight">
                      BranchVerse
                    </span>
                  </div>
                  <h2 className="font-playfair text-[26px] font-bold text-white tracking-[-0.5px] mb-1.5">
                    Create your account
                  </h2>
                  <p
                    className="text-sm font-light leading-[1.5]"
                    style={{ color: "rgba(255,255,255,0.38)" }}
                  >
                    Join a community of writers shaping stories together.
                  </p>
                </div>
              )}

              {verificationSent ? (
                <VerificationScreen />
              ) : (
                <>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    {/* ... all your existing form fields unchanged ... */}
                    <div className="flex flex-col gap-4 mb-4">
                      {/* Username */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          className="text-[13px] font-medium tracking-[0.2px]"
                          style={{ color: "rgba(255,255,255,0.55)" }}
                        >
                          Username
                        </label>
                        <div className="relative flex items-center">
                          <span
                            className="absolute left-[15px] flex items-center pointer-events-none z-[1]"
                            style={{ color: "rgba(255,255,255,0.25)" }}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          </span>
                          <input
                            {...register("username", {
                              required: "Username is required",
                            })}
                            className={`input-base w-full h-[50px] rounded-xl text-white text-sm pl-[44px] pr-[44px] font-dm ${errors.username ? "input-error" : ""}`}
                            placeholder="Choose a username..."
                            autoComplete="username"
                          />
                        </div>
                        {errors.username && (
                          <span className="text-xs text-[#f09595] mt-0.5 pl-0.5">
                            {errors.username.message}
                          </span>
                        )}
                      </div>

                      {/* Email */}
                      <div className="flex flex-col gap-1.5">
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
                              width="16"
                              height="16"
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
                            {...register("email", {
                              required: "Email is required",
                              pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Invalid email address",
                              },
                            })}
                            type="email"
                            className={`input-base w-full h-[50px] rounded-xl text-white text-sm pl-[44px] pr-[44px] font-dm ${errors.email ? "input-error" : ""}`}
                            placeholder="you@example.com"
                            autoComplete="email"
                          />
                        </div>
                        {errors.email && (
                          <span className="text-xs text-[#f09595] mt-0.5 pl-0.5">
                            {errors.email.message}
                          </span>
                        )}
                      </div>

                      {/* Password */}
                      <div className="flex flex-col gap-1.5">
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
                              width="16"
                              height="16"
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
                            {...register("password", {
                              required: "Password is required",
                              minLength: {
                                value: 6,
                                message: "Minimum 6 characters",
                              },
                            })}
                            type={showPassword ? "text" : "password"}
                            className={`input-base w-full h-[50px] rounded-xl text-white text-sm pl-[44px] pr-[44px] font-dm ${errors.password ? "input-error" : ""}`}
                            placeholder="Create a password..."
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-[14px] z-[1] flex items-center bg-transparent border-none cursor-pointer p-1 transition-colors duration-150 hover:text-white/55"
                            style={{ color: "rgba(255,255,255,0.25)" }}
                          >
                            {showPassword ? <EyeOff /> : <EyeOpen />}
                          </button>
                        </div>
                        {password.length > 0 && (
                          <>
                            <div className="flex gap-1 mt-1.5">
                              {[0, 1, 2, 3].map((i) => (
                                <div
                                  key={i}
                                  className={`flex-1 h-[3px] rounded-full transition-all duration-300 ${getBarClass(i, password) || "bg-white/[0.08]"}`}
                                />
                              ))}
                            </div>
                            <div
                              className="text-[11px] text-right mt-1"
                              style={{ color: "rgba(255,255,255,0.3)" }}
                            >
                              {getStrengthLabel(password)}
                            </div>
                          </>
                        )}
                        {errors.password && (
                          <span className="text-xs text-[#f09595] mt-0.5 pl-0.5">
                            {errors.password.message}
                          </span>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          className="text-[13px] font-medium tracking-[0.2px]"
                          style={{ color: "rgba(255,255,255,0.55)" }}
                        >
                          Confirm password
                        </label>
                        <div className="relative flex items-center">
                          <span
                            className="absolute left-[15px] flex items-center pointer-events-none z-[1]"
                            style={{ color: "rgba(255,255,255,0.25)" }}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                          </span>
                          <input
                            {...register("confirmPassword", {
                              required: "Please confirm your password",
                              validate: (value) =>
                                value === password || "Passwords do not match",
                            })}
                            type={showConfirm ? "text" : "password"}
                            className={`input-base w-full h-[50px] rounded-xl text-white text-sm pl-[44px] pr-[44px] font-dm ${errors.confirmPassword ? "input-error" : ""}`}
                            placeholder="Repeat your password..."
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-[14px] z-[1] flex items-center bg-transparent border-none cursor-pointer p-1 transition-colors duration-150 hover:text-white/55"
                            style={{ color: "rgba(255,255,255,0.25)" }}
                          >
                            {showConfirm ? <EyeOff /> : <EyeOpen />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <span className="text-xs text-[#f09595] mt-0.5 pl-0.5">
                            {errors.confirmPassword.message}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-submit-gradient relative w-full h-[52px] rounded-xl text-white text-[15px] font-medium border-none cursor-pointer overflow-hidden transition-all duration-200 tracking-[0.2px] mt-2.5 mb-4 hover:opacity-[0.88] hover:-translate-y-px active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-dm"
                    >
                      {isSubmitting ? "Creating account..." : "Create account"}
                    </button>
                  </form>

                  <div className="divider flex items-center gap-3 my-5">
                    <span
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.25)" }}
                    >
                      or continue with
                    </span>
                  </div>

                  <div
                    className="w-full h-[52px] rounded-xl flex items-center justify-center gap-[11px] text-sm cursor-pointer transition-all duration-200 hover:text-white"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "0.5px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.75)",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                    onClick={() =>
                      (window.location.href = `${process.env.NEXT_PUBLIC_BASEURL}/api/auth/google`)
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      (window.location.href = `${process.env.NEXT_PUBLIC_BASEURL}/api/auth/google`)
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

                  <p
                    className="text-center mt-6 text-[13px]"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    Already have an account?{" "}
                    <Link
                      href="/auth/login"
                      className="text-[#957bda] font-medium no-underline hover:opacity-75 transition-opacity duration-150"
                    >
                      Sign in
                    </Link>
                  </p>
                </>
              )}
            </div>

            {/* RIGHT PANEL — unchanged */}
            <div className="hidden lg:flex flex-1 flex-col justify-center pl-14 pr-6 max-w-[460px]">
              {/* ... your existing right panel ... */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
