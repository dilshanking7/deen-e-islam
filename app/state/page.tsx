"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { auth } from "@/lib/firebase";
import { updateUserProfile } from "@/lib/firestore";
import { getStates, INDIA_STATES } from "@/lib/location-data";

export default function StatePage() {
  const router = useRouter();

  const [state, setState] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(false);
  const [error, setError] = useState("");

  const [country, setCountry] = useState("");

  const [states, setStates] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("country");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setCountry(saved);
  }, []);

  useEffect(() => {
    if (!country) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInitLoading(true);
    setError("");

    const iso2 = countryIso2(country);
    if (iso2 === "IN") {
      setStates(INDIA_STATES["India"] || []);
      setInitLoading(false);
      return;
    }

    getStates(iso2)
      .then((list) => setStates(list.map((s) => s.name)))
      .catch(() => setError("States load nahi ho paye. Dobara try karein."))
      .finally(() => setInitLoading(false));
  }, [country]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return states;
    return states.filter((s) => s.toLowerCase().includes(q));
  }, [states, query]);

  const handleContinue = async () => {
    if (!state) {
      alert("Please select your state.");
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (user) {
        await updateUserProfile(user.uid, { state });
      }
      localStorage.setItem("state", state);
      router.push("/city");
    } catch (error) {
      console.log(error);
      alert("Unable to save state.");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-100 p-5">
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
      >
        <div className="text-center">
          <div className="text-6xl">🏛️</div>
          <h1 className="mt-5 text-3xl font-bold text-emerald-700">Select State</h1>
          <p className="mt-2 text-gray-500">{country || "Choose your state"}</p>
        </div>

        <div className="mt-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="State khojein..."
              className="w-full rounded-2xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-700"
            />
          </div>

          <div className="mt-3 max-h-72 overflow-y-auto rounded-2xl border border-gray-200 p-1">
            {initLoading ? (
              <p className="py-8 text-center text-sm text-gray-400">States load ho rahe hain...</p>
            ) : error ? (
              <p className="py-8 text-center text-sm text-red-500">{error}</p>
            ) : (
              filtered.map((item) => (
                <button
                  key={item}
                  onClick={() => setState(item)}
                  className={`flex w-full items-center rounded-xl px-4 py-3 text-left text-sm transition ${
                    state === item
                      ? "bg-emerald-700 text-white"
                      : "text-gray-700 hover:bg-emerald-50"
                  }`}
                >
                  <span className="font-semibold">{item}</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-4 h-2 rounded-full bg-gray-200">
            <div className="h-2 w-[65%] rounded-full bg-emerald-600" />
          </div>
          <p className="mb-6 text-center text-gray-500">Step 4 of 6</p>
          <button
            onClick={handleContinue}
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-700 py-4 text-lg font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Continue →"}
          </button>
        </div>
      </motion.div>
    </main>
  );
}

function countryIso2(name: string): string {
  const map: Record<string, string> = {
    India: "IN",
    "United States": "US",
    Pakistan: "PK",
    Bangladesh: "BD",
    Nepal: "NP",
    "Saudi Arabia": "SA",
    "United Arab Emirates": "AE",
    Qatar: "QA",
    Oman: "OM",
    Kuwait: "KW",
    Turkey: "TR",
    Malaysia: "MY",
    Indonesia: "ID",
    Egypt: "EG",
    Jordan: "JO",
    Iraq: "IQ",
    Iran: "IR",
    Afghanistan: "AF",
    Yemen: "YE",
    Syria: "SY",
    Lebanon: "LB",
    Palestine: "PS",
    Tunisia: "TN",
    Morocco: "MA",
    Algeria: "DZ",
    Libya: "LY",
    Sudan: "SD",
    Somalia: "SO",
    Nigeria: "NG",
    "United Kingdom": "GB",
    France: "FR",
    Germany: "DE",
    Canada: "CA",
    Australia: "AU",
    Singapore: "SG",
    "Sri Lanka": "LK",
    Myanmar: "MM",
    Thailand: "TH",
    Philippines: "PH",
    Russia: "RU",
    China: "CN",
    Japan: "JP",
    Brazil: "BR",
    Mexico: "MX",
    Spain: "ES",
    Italy: "IT",
    Netherlands: "NL",
    Belgium: "BE",
    Switzerland: "CH",
    Sweden: "SE",
    Norway: "NO",
    Denmark: "DK",
    Poland: "PL",
    Ukraine: "UA",
    Kazakhstan: "KZ",
    Uzbekistan: "UZ",
    Tajikistan: "TJ",
    Kyrgyzstan: "KG",
    Turkmenistan: "TM",
    Azerbaijan: "AZ",
    Georgia: "GE",
    Armenia: "AM",
    "South Africa": "ZA",
    Kenya: "KE",
    Ethiopia: "ET",
    Tanzania: "TZ",
    Uganda: "UG",
    Ghana: "GH",
    Senegal: "SN",
    Mali: "ML",
    "Burkina Faso": "BF",
    Niger: "NE",
    Chad: "TD",
    Cameroon: "CM",
    "Cote d'Ivoire": "CI",
    Guinea: "GN",
    Mauritania: "MR",
    Bahrain: "BH",
    Fiji: "FJ",
  };
  return map[name] || name.slice(0, 2).toUpperCase();
}
