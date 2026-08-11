"use client";

import { motion } from "framer-motion";

export default function BackgroundGlow() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[32px]">

      {/* Emerald Glow */}
      <motion.div
        animate={{
          x: [-30, 30, -30],
          y: [-20, 20, -20],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-28 -left-24 h-72 w-72 rounded-full bg-emerald-400/25 blur-3xl"
      />

      {/* Gold Glow */}
      <motion.div
        animate={{
          x: [20, -20, 20],
          y: [20, -20, 20],
          scale: [1, 1.06, 1],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-yellow-300/20 blur-3xl"
      />

    </div>
  );
}