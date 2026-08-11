"use client";

import BackgroundGlow from "./BackgroundGlow";
import LoginHeader from "./LoginHeader";
import RegisterForm from "./RegisterForm";
import LoginFooter from "./LoginFooter";

export default function RegisterCard() {
  return (
    <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl shadow-2xl border border-white/40 p-8">

      <BackgroundGlow />

      <div className="relative z-10">

        <LoginHeader />

        <RegisterForm />

        <LoginFooter />

      </div>

    </div>
  );
}