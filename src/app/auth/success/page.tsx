"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/src/Services/axiosinstance";
import PreferencesModal from "@/src/component/PreferencesModal";

export default function GoogleSuccess() {
  const router = useRouter();
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userId = params.get("userId");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    localStorage.setItem("token", token);
    if (userId) localStorage.setItem("userId", userId);

    axiosInstance
      .get("/api/auth/preferences")
      .then((res) => {
        if (
          !res.data?.preferences ||
          res.data.preferences.genres.length === 0
        ) {
          setShowPreferences(true); // show modal instead of redirecting
        } else {
          router.push("/Users/Home");
        }
      })
      .catch(() => {
        router.push("/Users/Home");
      });
  }, []);

  return (
    <>
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Signing you in with Google...</p>
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
