import LoginCard from "@/components/auth/LoginCard";
import DownloadButton from "@/components/pwa/DownloadButton";
import ThemeControls from "@/components/ui/ThemeControls";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-100 px-6">
      {/* Background Decoration */}
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-yellow-200/30 blur-3xl" />

      <div className="absolute right-5 top-5 flex items-center gap-3">
        <DownloadButton label="Install App" />
        <ThemeControls />
      </div>

      <LoginCard />
    </main>
  );
}
