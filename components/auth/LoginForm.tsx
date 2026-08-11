"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { sendEmailVerification } from "firebase/auth";
import { loginUser, loginWithGoogle, resetPassword } from "@/lib/auth";
import { getUserProfile, findUserByUsername } from "@/lib/firestore";

export default function LoginForm() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("remember-email") || "";
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("remember-email");
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const handleForgotPassword = async () => {
    setError("");
    setSuccess("");

    let email = forgotEmail.trim();

    if (!email.includes("@")) {
      const normalized = email.replace(/^@/, "");
      try {
        const profile = await findUserByUsername(normalized);
        if (profile?.email) email = profile.email;
      } catch {
        /* ignore */
      }
    }

    if (!email.includes("@")) {
      setError("Enter a valid email address to reset your password.");
      return;
    }

    try {
      await resetPassword(email);
      setSuccess("Password reset link sent. Please check your email.");
      setForgotOpen(false);
      setForgotEmail("");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || "";
      if (code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else {
        setError("Failed to send reset link. Please try again.");
      }
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let loginEmail = identifier.trim();

      // If user entered a username (not an email), resolve it to an email first
      if (!loginEmail.includes("@")) {
        const normalizedUsername = loginEmail.replace(/^@/, "");
        const profile = await findUserByUsername(normalizedUsername);

        if (!profile) {
          setError("Username not found. Check and try again.");
          setLoading(false);
          return;
        }

        loginEmail = profile.email;
      }

      const user = await loginUser(loginEmail, password);

      if (!user.emailVerified) {
        await sendEmailVerification(user);
        setError("Please verify your email. Verification email has been sent again.");
        setLoading(false);
        return;
      }

      if (rememberMe) {
        localStorage.setItem("remember-email", identifier);
      } else {
        localStorage.removeItem("remember-email");
      }

      // Fetch user profile from Firestore to verify onboarding state
      const profile = await getUserProfile(user.uid);

      setSuccess("Welcome Back 🤍");

      // Dynamic redirection based on completedOnboarding flag
      setTimeout(() => {
        if (profile?.completedOnboarding) {
          router.push("/home");
        } else {
          router.push("/welcome");
        }
      }, 1500);
    } catch (err: unknown) {
      const errorCast = err as { code?: string };

      switch (errorCast.code) {
        case "auth/user-not-found":
          setError("No account found.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password.");
          break;
        case "auth/invalid-credential":
          setError("Invalid email or password.");
          break;
        case "auth/invalid-email":
          setError("Invalid email.");
          break;
        default:
          setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const user = await loginWithGoogle();

      const profile = await getUserProfile(user.uid);

      setSuccess("Google Login Successful 🤍");

      setTimeout(() => {
        if (profile?.completedOnboarding) {
          router.push("/home");
        } else {
          router.push("/welcome");
        }
      }, 1200);
    } catch (err: unknown) {
      const errorCast = err as { code?: string };
      if (errorCast.code === "auth/popup-closed-by-user") {
        setError("Popup band kar diya. Dobara try karein.");
      } else if (errorCast.code === "auth/popup-blocked") {
        setError("Popup blocked hai. Browser me popup allow karein.");
      } else {
        setError("Google login me problem hui. Firebase console me Google Sign-In enabled hai?");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleLogin}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="mt-8 space-y-5"
    >
      {/* Email / Username */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-600">
          Email or Username
        </label>
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          autoComplete="email"
          placeholder="Enter your email or username"
          className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 outline-none transition-all duration-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
        />
      </div>

      {/* Password */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-600">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Enter your password"
            className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 pr-14 outline-none transition-all duration-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 top-1/2 -translate-y-1/2"
          >
            {showPassword ? "🙈" : "👁"}
          </button>
        </div>
      </div>

      {/* Remember */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="accent-emerald-700"
          />
          Remember Me
        </label>
        <button
          type="button"
          onClick={() => {
            setError("");
            setSuccess("");
            setForgotOpen(true);
          }}
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          Forgot Password?
        </button>
      </div>

      {forgotOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4"
        >
          <p className="text-sm font-semibold text-emerald-800">
            Reset Password
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Enter your email or username and we&apos;ll send you a reset link.
          </p>
          <input
            type="text"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            placeholder="Email or username"
            className="mt-3 w-full rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
          />
          <button
            type="button"
            onClick={handleForgotPassword}
            className="mt-3 w-full rounded-xl bg-emerald-700 py-2.5 text-sm font-bold text-white hover:bg-emerald-800"
          >
            Send Reset Link
          </button>
        </motion.div>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl bg-red-50 py-3 text-center text-sm font-medium text-red-600"
        >
          {error}
        </motion.p>
      )}

      {success && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl bg-emerald-50 py-3 text-center text-sm font-medium text-emerald-700"
        >
          {success}
        </motion.p>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={loading}
        type="submit"
        className="w-full rounded-2xl bg-gradient-to-r from-emerald-700 via-green-700 to-emerald-800 py-4 text-lg font-bold text-white shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Authenticating..." : "Login Securely"}
      </motion.button>

      <div className="relative py-2">
        <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-200" />
        <p className="relative mx-auto w-fit bg-white px-3 text-sm text-gray-400">
          OR
        </p>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white py-4 font-semibold shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="h-5 w-5" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.7l6.2 5.2C36.7 39.8 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
        </svg>
        Continue with Google
      </motion.button>

      <div className="text-center">
        <p className="mt-6 text-sm text-gray-500">
          Don&apos;t have an account?
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="ml-2 font-semibold text-emerald-700 hover:underline"
          >
            Create Account
          </button>
        </p>
      </div>
    </motion.form>
  );
}