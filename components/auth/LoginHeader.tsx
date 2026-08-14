"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function LoginHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          duration: 0.6,
          delay: 0.15,
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
        className="mx-auto inline-block"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="overflow-hidden rounded-2xl bg-white p-1.5 shadow-xl ring-4 ring-emerald-500/20"
        >
          <Image
            src="/logo.png"
            alt="Islaam-E-Deen Logo"
            width={64}
            height={64}
            className="h-[52px] w-[52px] object-contain"
            priority
          />
        </motion.div>
      </motion.div>

      {/* Website Name */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-3 text-2xl font-extrabold tracking-wide text-emerald-700"
      >
        Islaam-E-Deen
      </motion.h1>

      {/* Greeting */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="mt-1 text-gray-600"
      >
        Assalamu Alaikum 🤍
      </motion.p>

      {/* Welcome */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-1 text-xs text-gray-500"
      >
        Welcome back. Continue your journey of knowledge.
      </motion.p>
    </motion.div>
  );
}
