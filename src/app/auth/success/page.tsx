"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/src/Services/axiosinstance";

export default function GoogleSuccess() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userId = params.get("userId");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    // Store token just like regular login
    localStorage.setItem("token", token);
    if (userId) localStorage.setItem("userId", userId);

    // Check if user has preferences
    axiosInstance
      .get("/api/auth/preferences")
      .then((res) => {
        if (
          !res.data?.preferences ||
          res.data.preferences.genres.length === 0
        ) {
          router.push("/auth/preferences"); // or show modal
        } else {
          router.push("/Users/Home");
        }
      })
      .catch(() => {
        router.push("/Users/Home");
      });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-xl">Signing you in with Google...</p>
    </div>
  );
}
