import StarterNavbar from "@/src/component/StarterNavbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <StarterNavbar />

      {/* Offset fixed navbar height */}
      <main className="pt-[71px]">{children}</main>
    </div>
  );
}
