"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { auth } from "@/lib/firebase";
import { updateUserProfile } from "@/lib/firestore";
import {
  getDistricts,
  getStates,
  getCities,
} from "@/lib/location-data";

export default function CityPage() {
  const router = useRouter();

  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [initLoading, setInitLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const c = localStorage.getItem("country");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (c) setCountry(c);
    const s = localStorage.getItem("state");
    if (s) setState(s);
  }, []);

  const isIndia = country === "India";
  const districts = useMemo(() => (isIndia ? getDistricts(state) : []), [isIndia, state]);

  const [fetchedCities, setFetchedCities] = useState<string[]>([]);
  const cities = fetchedCities;

  useEffect(() => {
    if (!country || !state) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInitLoading(true);
    setError("");
    const iso2 = (country: string) =>
      ({
        India: "IN",
        "United States": "US",
        Pakistan: "PK",
        Bangladesh: "BD",
        "Saudi Arabia": "SA",
        "United Arab Emirates": "AE",
        Qatar: "QA",
        Turkey: "TR",
        Malaysia: "MY",
        Indonesia: "ID",
        "United Kingdom": "GB",
        Canada: "CA",
        Australia: "AU",
      })[country] || "";

    (async () => {
      try {
        const iso = iso2(country);
        if (!iso) {
          setFetchedCities([]);
          return;
        }
        const states = await getStates(iso);
        const current = states.find((s) => s.name === state);
        if (!current) {
          setFetchedCities([]);
          return;
        }
        const list = await getCities(current.id);
        setFetchedCities(list.map((c) => c.name));
      } catch {
        setError("Cities load nahi ho payi. Internet check karein.");
      } finally {
        setInitLoading(false);
      }
    })();
  }, [country, state, isIndia]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((c) => c.toLowerCase().includes(q));
  }, [cities, query]);

  const handleContinue = async () => {
    if (!city) {
      alert("Please select your city.");
      return;
    }

    localStorage.setItem("city", city);
    if (district) localStorage.setItem("district", district);

    const user = auth.currentUser;
    if (user) {
      await updateUserProfile(user.uid, {
        city,
        district: district || undefined,
      });
    }

    router.push("/pincode");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-100 p-5">
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
      >
        <div className="text-center">
          <div className="text-6xl">🏙️</div>
          <h1 className="mt-5 text-3xl font-bold text-emerald-700">Select City</h1>
          <p className="mt-2 text-gray-500">
            {country} • {state}
            {isIndia && " • district ke saath exact location"}
          </p>
        </div>

        <div className="mt-6">
          {isIndia && (
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-gray-600">
                District (Zila)
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 p-4 outline-none focus:border-emerald-700"
              >
                <option value="">-- Select District --</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {districts.length === 0 && (
                <p className="mt-1 text-xs text-gray-400">
                  Is state ke liye district list update ho rahi hai.
                </p>
              )}
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="City khojein..."
              className="w-full rounded-2xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-700"
            />
          </div>

          <div className="mt-3 max-h-64 overflow-y-auto rounded-2xl border border-gray-200 p-1">
            {initLoading ? (
              <p className="py-8 text-center text-sm text-gray-400">Cities load ho rahi hain...</p>
            ) : error ? (
              <p className="py-8 text-center text-sm text-red-500">{error}</p>
            ) : (
              filtered.map((item) => (
                <button
                  key={item}
                  onClick={() => setCity(item)}
                  className={`flex w-full items-center rounded-xl px-4 py-2.5 text-left text-sm transition ${
                    city === item
                      ? "bg-emerald-700 text-white"
                      : "text-gray-700 hover:bg-emerald-50"
                  }`}
                >
                  <span className="font-semibold">{item}</span>
                </button>
              ))
            )}
            {!initLoading && filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-400">
                Koi city nahi mili. Naam likh kar dekhein.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-4 h-2 w-full rounded-full bg-gray-200">
            <div className="h-2 w-[80%] rounded-full bg-emerald-600" />
          </div>
          <p className="mb-6 text-center text-gray-500">Step 5 of 6</p>
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
