"use client";

import { motion } from "framer-motion";

export default function SplashAnimation({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative flex flex-col items-center justify-center"
    >
      {children}
    </motion.div>
  );
}