"use client";

import { createUserProfile } from "@/lib/firestore";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/auth";

export default function RegisterForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!fullName || !username || !email || !password || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      // Register user in Firebase Auth
      const user = await registerUser(email, password);

      // Save additional profile details in Firestore
      await createUserProfile(user.uid, {
        fullName,
        username,
        email,
        language: "",
        country: "",
        state: "",
        city: "",
        pincode: "",
        completedOnboarding: false,
      });

      setSuccess("Account Created Successfully 🎉");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      const errorCast = err as { code?: string; message?: string };

      switch (errorCast.code) {
        case "auth/email-already-in-use":
          setError("This email is already registered.");
          break;
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        case "auth/weak-password":
          setError("Password is too weak.");
          break;
        default:
          setError(errorCast.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleRegister}
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="mt-8 space-y-4"
    >
      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full rounded-2xl border border-gray-200 p-4 outline-none focus:border-emerald-600"
      />

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full rounded-2xl border border-gray-200 p-4 outline-none focus:border-emerald-600"
      />

      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-2xl border border-gray-200 p-4 outline-none focus:border-emerald-600"
      />

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-2xl border border-gray-200 p-4 pr-14 outline-none focus:border-emerald-600"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-5 top-1/2 -translate-y-1/2"
        >
          {showPassword ? "🙈" : "👁"}
        </button>
      </div>

      <div className="relative">
        <input
          type={showConfirm ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-2xl border border-gray-200 p-4 pr-14 outline-none focus:border-emerald-600"
        />

        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-5 top-1/2 -translate-y-1/2"
        >
          {showConfirm ? "🙈" : "👁"}
        </button>
      </div>

      {error && (
        <p className="text-center text-sm text-red-600">
          {error}
        </p>
      )}

      {success && (
        <p className="text-center text-sm text-green-600">
          {success}
        </p>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-emerald-700 py-4 font-bold text-white transition hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating Account..." : "Create Account"}
      </motion.button>
    </motion.form>
  );
}