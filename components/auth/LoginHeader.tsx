"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function LoginHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="text-center"
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          duration: 0.7,
          delay: 0.2,
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
        className="mx-auto inline-block"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="overflow-hidden rounded-3xl bg-white p-2 shadow-xl ring-4 ring-emerald-500/20"
        >
          <Image
            src="/logo.png"
            alt="Islaam-E-Deen Logo"
            width={88}
            height={88}
            className="h-[72px] w-[72px] object-contain"
            priority
          />
        </motion.div>
      </motion.div>

      {/* Website Name */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-5 text-4xl font-extrabold tracking-wide text-emerald-700"
      >
        Islaam-E-Deen
      </motion.h1>

      {/* Greeting */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-3 text-gray-600 text-lg"
      >
        Assalamu Alaikum 🤍
      </motion.p>

      {/* Welcome */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-2 text-sm text-gray-500"
      >
        Welcome back. Continue your journey of knowledge.
      </motion.p>
    </motion.div>
  );
}
