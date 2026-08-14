import RegisterCard from "@/components/auth/RegisterCard";

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-y-auto overflow-x-hidden bg-gradient-to-br from-emerald-50 via-white to-green-100 px-4 py-6">

      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-yellow-200/30 blur-3xl" />

      <RegisterCard />

    </main>
  );
}