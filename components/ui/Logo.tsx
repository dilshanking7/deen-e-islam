"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  glow?: boolean;
}

export default function Logo({
  size = 80,
  showText = true,
  className = "",
  glow = true,
}: LogoProps) {
  return (
    <div
      className={`relative flex flex-col items-center ${className}`}
    >
      {glow && (
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute rounded-full blur-3xl opacity-40 bg-gradient-to-r from-green-400 via-yellow-300 to-blue-500"
          style={{ width: size * 1.6, height: size * 1.6 }}
        />
      )}

      <motion.div
        animate={{
          scale: [1, 1.04, 1],
        }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative z-10 overflow-hidden rounded-3xl bg-white/80 shadow-2xl ring-4 ring-emerald-500/20 backdrop-blur"
      >
        <Image
          src="/logo.png"
          alt="Islaam-E-Deen Logo"
          width={size}
          height={size}
          className="h-auto w-auto object-contain"
          priority
        />
      </motion.div>

      {showText && (
        <div className="relative z-10 mt-3 text-center">
          <h2 className="text-xl font-extrabold tracking-tight text-emerald-800">
            Islaam-E-Deen
          </h2>
          <p className="mt-1 text-xs font-medium text-emerald-600">
            Learn • Practice • Share Islam
          </p>
        </div>
      )}
    </div>
  );
}
