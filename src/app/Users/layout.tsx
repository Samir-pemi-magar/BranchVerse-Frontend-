"use client";
import Footer from "@/src/component/Footer";
import Navbar from "@/src/component/Navbar";
import { usePathname } from "next/navigation";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isStoryReader = pathname?.startsWith("/Users/StoryReader");

  if (isStoryReader) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center">
      <Navbar />
      <div className="flex-1 w-full">{children}</div>
      <Footer />
    </div>
  );
}
