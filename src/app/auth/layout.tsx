import StarterNavbar from "@/src/component/StarterNavbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <StarterNavbar />

      {/* Push content below the fixed 71px navbar */}
      <main className="flex-1 pt-[71px]">{children}</main>
    </div>
  );
}
