"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  getUserProfile,
  updateUserProfile,
} from "@/lib/firestore";
import { changePassword } from "@/lib/auth";
import { getCountries } from "@/lib/location-data";

const RELIGIONS = ["Islam"];
const SECTS = ["Sunni", "Deobandi", "Barelwi", "Shia", "Ahle Hadith", "Other"];
const LANGUAGES = ["English", "Urdu", "Hindi", "Arabic"];

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [photoURL, setPhotoURL] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [language, setLanguage] = useState("");
  const [country, setCountry] = useState("");
  const [countries, setCountries] = useState<{ name: string }[]>([]);
  const [stateName, setStateName] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [religion, setReligion] = useState("");
  const [sect, setSect] = useState("");
  const [bio, setBio] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const user = auth.currentUser;

      if (!user) {
        router.push("/login");
        return;
      }

      const profile = await getUserProfile(user.uid);

      if (profile) {
        setPhotoURL(profile.photoURL || "");
        setFullName(profile.fullName || "");
        setUsername(profile.username || "");
        setEmail(profile.email || "");
        setLanguage(profile.language || "");
        setCountry(profile.country || "");
        setStateName(profile.state || "");
        setDistrict(profile.district || "");
        setCity(profile.city || "");
        setPincode(profile.pincode || "");
        setReligion(profile.religion || "");
        setSect(profile.sect || "");
        setBio(profile.bio || "");
      }

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  useEffect(() => {
    getCountries().then(setCountries).catch(() => {});
  }, []);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image too large. Please choose a file under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPhotoURL(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function saveProfile() {
    const user = auth.currentUser;

    if (!user) return;

    if (!fullName.trim() || !username.trim()) {
      alert("Full name and username are required.");
      return;
    }

    try {
      setSaving(true);
      setSaved(false);

      await updateUserProfile(user.uid, {
        photoURL,
        fullName,
        username,
        language,
        country,
        state: stateName,
        district,
        city,
        pincode,
        religion,
        sect,
        bio,
        completedOnboarding: true,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    setPasswordMsg("");
    setPasswordError("");

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMsg("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code || "";
      if (code === "auth/wrong-password") {
        setPasswordError("Current password is incorrect.");
      } else if (code === "auth/weak-password") {
        setPasswordError("New password is too weak.");
      } else {
        setPasswordError("Failed to change password. Please try again.");
      }
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Loading...
      </main>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100 py-8">
      <div className="mx-auto max-w-2xl px-4">
        <button
          onClick={() => router.push("/home")}
          className="mb-4 text-sm font-semibold text-emerald-700 hover:underline"
        >
          ← Back to Home
        </button>

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white p-8 shadow-2xl"
        >
          <div className="text-center">
            <div className="relative mx-auto h-24 w-24">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt="profile"
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-emerald-100"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-4xl font-bold text-white">
                  {fullName?.[0] || "U"}
                </div>
              )}
              <label
                htmlFor="photo-input"
                className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700"
              >
                📷
                <input
                  id="photo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhoto}
                />
              </label>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-emerald-700">
              Edit Profile
            </h1>
            <p className="mt-2 text-gray-500">
              Update your details below.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-600">Full Name *</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputCls}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-600">Username *</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputCls}
                  placeholder="username"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-600">Email</label>
              <input
                value={email}
                readOnly
                className={`${inputCls} cursor-not-allowed opacity-70`}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-600">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select language</option>
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-600">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select country</option>
                  {countries.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-600">State</label>
                <input
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. Uttar Pradesh"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-600">District</label>
                <input
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. Lucknow"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-600">City</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. Lucknow"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-600">Pincode</label>
                <input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. 226001"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-600">Religion</label>
                <select
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select religion</option>
                  {RELIGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-600">Sect / Madhab</label>
                <select
                  value={sect}
                  onChange={(e) => setSect(e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select sect</option>
                  {SECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-600">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className={`${inputCls} resize-none`}
                rows={3}
                placeholder="Tell the community about yourself..."
              />
            </div>
          </div>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="mt-8 w-full rounded-2xl bg-emerald-700 py-4 text-lg font-bold text-white hover:bg-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>

          {saved && (
            <p className="mt-3 text-center font-semibold text-emerald-600">
              ✓ Profile saved successfully!
            </p>
          )}

          <div className="mt-8 border-t border-gray-100 pt-6">
            <button
              onClick={() => setShowPassword((v) => !v)}
              className="text-sm font-semibold text-emerald-700 hover:underline"
            >
              🔑 Change Password
            </button>

            {showPassword && (
              <div className="mt-4 space-y-4">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputCls}
                  placeholder="Current password"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputCls}
                  placeholder="New password (min 6 characters)"
                />
                <button
                  onClick={handleChangePassword}
                  className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700"
                >
                  Update Password
                </button>
                {passwordMsg && (
                  <p className="text-center text-sm font-semibold text-emerald-600">
                    ✓ {passwordMsg}
                  </p>
                )}
                {passwordError && (
                  <p className="text-center text-sm font-semibold text-red-600">
                    {passwordError}
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
