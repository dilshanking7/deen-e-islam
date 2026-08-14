"use client";

import BackgroundGlow from "./BackgroundGlow";
import LoginHeader from "./LoginHeader";
import RegisterForm from "./RegisterForm";
import LoginFooter from "./LoginFooter";

export default function RegisterCard() {
  return (
    <div className="relative my-6 w-full max-w-sm overflow-hidden rounded-[28px] bg-white/85 backdrop-blur-xl shadow-2xl border border-white/40 p-5">

      <BackgroundGlow />

      <div className="relative z-10">

        <LoginHeader />

        <RegisterForm />

        <LoginFooter />

      </div>

    </div>
  );
}