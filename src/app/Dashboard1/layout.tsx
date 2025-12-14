import StarterNavbar from "@/src/component/StarterNavbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ✅ Shared Navbar */}
      <StarterNavbar />

      {/* ✅ Page Content */}
      {children}
    </div>
  );
}
