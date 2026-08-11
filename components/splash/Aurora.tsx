"use client";

import { motion } from "framer-motion";

export default function Aurora() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">

      {/* Green */}
      <motion.div
        animate={{
          x: [-40, 40, -40],
          y: [-20, 20, -20],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-80 h-80 rounded-full bg-green-400 blur-[120px] opacity-30"
      />

      {/* Gold */}
      <motion.div
        animate={{
          x: [30, -30, 30],
          y: [20, -20, 20],
          scale: [1.1, 0.9, 1.1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-72 h-72 rounded-full bg-yellow-300 blur-[120px] opacity-30"
      />

      {/* Blue */}
      <motion.div
        animate={{
          x: [0, 60, 0],
          y: [40, -30, 40],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-72 h-72 rounded-full bg-blue-400 blur-[120px] opacity-25"
      />

      {/* Purple */}
      <motion.div
        animate={{
          x: [-50, 50, -50],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-64 h-64 rounded-full bg-purple-400 blur-[120px] opacity-20"
      />

    </div>
  );
}