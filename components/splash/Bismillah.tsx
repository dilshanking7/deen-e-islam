"use client";

import { motion } from "framer-motion";

export default function Bismillah() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
        filter: "blur(10px)",
      }}
      animate={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      transition={{
        duration: 1.2,
        delay: 0.3,
        ease: "easeOut",
      }}
      className="relative z-20 mt-6 flex flex-col items-center"
    >
      <h2
        className="text-6xl md:text-7xl text-emerald-700 font-bold"
        dir="rtl"
      >
        ﷽
      </h2>

      <p className="mt-3 text-gray-500 text-sm md:text-base tracking-[0.25em] uppercase">
        In the Name of Allah, the Most Compassionate, the Most Merciful
      </p>
    </motion.div>
  );
}