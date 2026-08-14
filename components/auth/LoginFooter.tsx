"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginFooter() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="mt-5"
    >
      {/* Bottom Links */}
      <div className="flex items-center justify-between text-xs">
        <Link
          href="/register"
          className="font-semibold text-emerald-700 transition hover:text-emerald-900"
        >
          Create Account
        </Link>

        <Link
          href="/privacy-policy"
          className="text-gray-500 transition hover:text-gray-700"
        >
          Privacy Policy
        </Link>
      </div>

      {/* Security */}
      <p className="mt-4 text-center text-[11px] text-gray-400">
        🔒 Your information is securely protected.
      </p>

      {/* Copyright */}
      <p className="mt-1 text-center text-[11px] text-gray-400">
        © 2026 Islaam-E-Deen
      </p>
    </motion.div>
  );
}
