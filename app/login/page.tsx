import LoginCard from "@/components/auth/LoginCard";

export default function LoginPage() {
  return (
    <main className="relative flex h-dvh min-h-0 items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-100 px-4">
      {/* Background Decoration */}
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-yellow-200/30 blur-3xl" />

      <LoginCard />
    </main>
  );
}
