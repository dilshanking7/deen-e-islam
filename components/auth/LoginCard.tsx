"use client";

import { motion } from "framer-motion";

import BackgroundGlow from "./BackgroundGlow";
import LoginHeader from "./LoginHeader";
import LoginForm from "./LoginForm";
import LoginFooter from "./LoginFooter";

export default function LoginCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/40 bg-white/80 p-8 shadow-2xl backdrop-blur-xl"
    >
      {/* Animated Background */}
      <BackgroundGlow />

      {/* Content */}
      <div className="relative z-10">

        <LoginHeader />

        <LoginForm />

        <LoginFooter />

      </div>
    </motion.div>
  );
}