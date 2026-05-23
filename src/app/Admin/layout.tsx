"use client";
import AdminGuard from "@/src/component/AdminGuard";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/Admin/Dashboard", label: "Dashboard" },
  { href: "/Admin/Users", label: "Users" },
  { href: "/Admin/Stories", label: "Stories" },
  { href: "/Admin/Chapters", label: "Chapters" },
  { href: "/Admin/SupportMessage", label: "Support Messages" }, // Added here
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin-login");
  };

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-neutral-950 font-mono text-neutral-200">
        {/* Sidebar */}
        <aside className="fixed top-0 left-0 bottom-0 w-56 bg-neutral-900 border-r border-neutral-800 flex flex-col z-50">
          {/* Logo */}
          <div className="px-6 pt-7 pb-5 border-b border-neutral-800">
            <p className="text-xs tracking-widest text-neutral-500 mb-1">
              SYSTEM
            </p>
            <p className="text-lg font-bold text-white tracking-tight">ADMIN</p>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4">
            {NAV.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                    active
                      ? "text-white bg-neutral-800 border-l-2 border-white"
                      : "text-neutral-500 border-l-2 border-transparent hover:text-neutral-200 hover:bg-neutral-800/50"
                  }`}
                >
                  <span
                    className={`text-[8px] ${active ? "text-white" : "text-neutral-700"}`}
                  >
                    ▪
                  </span>
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-6 py-5 border-t border-neutral-800">
            <button
              onClick={handleLogout}
              className="w-full py-2 text-xs tracking-widest text-neutral-500 border border-neutral-700 hover:text-neutral-200 hover:border-neutral-500 transition-colors"
            >
              LOGOUT
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="ml-56 flex-1 p-10 min-h-screen">{children}</main>
      </div>
    </AdminGuard>
  );
}
