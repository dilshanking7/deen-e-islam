"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { auth } from "@/lib/firebase";
import { updateUserProfile } from "@/lib/firestore";

export default function PincodePage() {
  const router = useRouter();

  const [pincode, setPincode] = useState("");

  async function handleContinue() {
    if (pincode.length !== 6) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      router.push("/login");
      return;
    }

    await updateUserProfile(user.uid, {
      pincode,
    });

    router.push("/profile");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-100 p-5">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
      >

        <div className="text-center">

          <div className="text-6xl">📮</div>

          <h1 className="mt-5 text-3xl font-bold text-emerald-700">
            Enter Pincode
          </h1>

          <p className="mt-2 text-gray-500">
            Enter your area&apos;s postal code.
          </p>

        </div>

        <div className="mt-8">

          <input
            type="text"
            maxLength={6}
            value={pincode}
            onChange={(e) =>
              setPincode(
                e.target.value.replace(/\D/g, "")
              )
            }
            placeholder="e.g. 000000"
            className="w-full rounded-2xl border border-gray-300 p-4 text-center text-xl tracking-widest outline-none focus:border-emerald-700"
          />

        </div>

        <div className="mt-10">

          <div className="mb-4 h-2 rounded-full bg-gray-200">

            <div className="h-2 w-[85%] rounded-full bg-emerald-600"/>

          </div>

          <p className="mb-6 text-center text-gray-500">
            Step 6 of 7
          </p>

          <button
            onClick={handleContinue}
            className="w-full rounded-2xl bg-emerald-700 py-4 text-lg font-bold text-white hover:bg-emerald-800"
          >
            Continue →
          </button>

        </div>

      </motion.div>

    </main>
  );
}