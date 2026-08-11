"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginFooter() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.1, duration: 0.6 }}
      className="mt-8"
    >
      {/* Bottom Links */}

      <div className="flex items-center justify-between text-sm">

        <Link
          href="/register"
          className="font-medium text-emerald-700 transition hover:text-emerald-900"
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

      <p className="mt-6 text-center text-xs text-gray-400">
        🔒 Your information is securely protected.
      </p>

      {/* Copyright */}

      <p className="mt-2 text-center text-xs text-gray-400">
        © 2026 Islaam-E-Deen
      </p>
    </motion.div>
  );
}