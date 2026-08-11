"use client";

import { motion } from "framer-motion";

export default function HadithCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="mt-10 text-center px-6 max-w-xl"
    >
      <h2 className="text-4xl text-emerald-700">
        وَقُل رَّبِّ زِدْنِي عِلْمًا
      </h2>

      <p className="mt-5 text-gray-600 text-lg">
        My Lord, increase me in knowledge.
      </p>
    </motion.div>
  );
}