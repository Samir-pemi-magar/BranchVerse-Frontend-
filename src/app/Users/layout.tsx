import Footer from "@/src/component/Footer";
import Navbar from "@/src/component/Navbar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center">
      <Navbar />

      {/* This must grow */}
      <div className="flex-1 w-full">{children}</div>

      <Footer />
    </div>
  );
}
