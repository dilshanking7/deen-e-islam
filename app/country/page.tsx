"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { auth } from "@/lib/firebase";
import { updateUserProfile } from "@/lib/firestore";
import { getCountries } from "@/lib/location-data";

export default function CountryPage() {
  const router = useRouter();

  const [all, setAll] = useState<{ name: string; iso2: string; emoji: string }[]>([]);
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCountries()
      .then((list) => setAll(list.map((c) => ({ name: c.name, iso2: c.iso2, emoji: c.emoji }))))
      .catch(() => {
        setError("Country list load nahi ho payi. Internet check karein.");
      })
      .finally(() => setInitLoading(false));
  }, []);

  const filtered = query
    ? all.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()))
    : all;

  const handleContinue = async () => {
    if (!country) {
      alert("Please select your country.");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      alert("User not found. Please login again.");
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      await updateUserProfile(user.uid, { country });
      localStorage.setItem("country", country);
      router.push("/state");
    } catch (error) {
      console.error(error);
      alert("Failed to save country.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-100 p-5">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
      >
        <div className="text-center">
          <div className="text-6xl">🌍</div>
          <h1 className="mt-5 text-3xl font-bold text-emerald-700">Select Country</h1>
          <p className="mt-2 text-gray-500">
            Duniya ki har mulk yahan hai — apna mulk chunein
          </p>
        </div>

        <div className="mt-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Mulk ka naam likhein... (India, Saudi Arabia...)"
              className="w-full rounded-2xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-700"
            />
          </div>

          <div className="mt-3 max-h-72 overflow-y-auto rounded-2xl border border-gray-200 p-1">
            {initLoading ? (
              <p className="py-8 text-center text-sm text-gray-400">
                Mulk load ho rahe hain...
              </p>
            ) : error ? (
              <p className="py-8 text-center text-sm text-red-500">{error}</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.iso2}
                  onClick={() => setCountry(c.name)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                    country === c.name
                      ? "bg-emerald-700 text-white"
                      : "text-gray-700 hover:bg-emerald-50"
                  }`}
                >
                  <span>{c.emoji}</span>
                  <span className="font-semibold">{c.name}</span>
                </button>
              ))
            )}
          </div>

          {country && (
            <p className="mt-3 text-center text-sm font-semibold text-emerald-700">
              Selected: {country}
            </p>
          )}
        </div>

        <div className="mt-6">
          <div className="mb-4 h-2 w-full rounded-full bg-gray-200">
            <div className="h-2 w-[50%] rounded-full bg-emerald-600" />
          </div>
          <p className="mb-6 text-center text-gray-500">Step 3 of 6</p>
          <button
            disabled={loading}
            onClick={handleContinue}
            className="w-full rounded-2xl bg-emerald-700 py-4 text-lg font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Continue →"}
          </button>
        </div>
      </motion.div>
    </main>
  );
}
