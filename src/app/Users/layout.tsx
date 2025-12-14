import Footer from "@/src/component/Footer";
import Navbar from "@/src/component/Navbar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* ✅ Shared Navbar */}
      <Navbar />

      {/* ✅ Page Content */}
      {children}
      <Footer />
    </div>
  );
}
