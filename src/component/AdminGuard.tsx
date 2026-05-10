// src/component/AdminGuard.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import adminAxios from "@/src/Services/adminAxios";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    adminAxios
      .get("/api/admin/me")
      .then(() => setVerified(true))
      .catch(() => router.push("/admin/login"));
  }, [router]);

  if (!verified) return <p className="text-center mt-20">Verifying access…</p>;
  return <>{children}</>;
}
