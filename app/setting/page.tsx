"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bell, Globe, Moon, User, Shield, Info, ChevronRight } from "lucide-react";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/firestore";
import { logoutUser } from "@/lib/auth";

export default function SettingPage() {
  const router = useRouter();

  const [userData, setUserData] = useState<{ fullName?: string; email?: string }>({});

  useEffect(() => {
    async function load() {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }
      const profile = await getUserProfile(user.uid);
      if (profile) setUserData(profile);
    }
    load();
  }, [router]);

  async function handleLogout() {
    await logoutUser();
    router.push("/login");
  }

  const groups = [
    {
      title: "General",
      items: [
        {
          icon: User,
          label: "Profile",
          desc: "Manage your personal info",
          path: "/profile",
        },
        {
          icon: Globe,
          label: "Language",
          desc: "Change preferred language",
          path: "/language",
        },
        {
          icon: Bell,
          label: "Notifications",
          desc: "Prayer & daily reminders",
          path: "",
        },
        {
          icon: Moon,
          label: "Dark Mode",
          desc: "Switch app appearance",
          path: "",
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          icon: Shield,
          label: "Privacy & Security",
          desc: "Secure your account",
          path: "",
        },
        {
          icon: Info,
          label: "About",
          desc: "Version 0.1.0",
          path: "",
        },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100">
      <div className="fixed left-0 top-0 -z-10 h-72 w-72 rounded-full bg-emerald-300/30 blur-[120px]" />

      <div className="mx-auto max-w-2xl px-5 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-icon.png"
              alt="Islaam-E-Deen"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
            <h1 className="text-2xl font-extrabold text-emerald-800">
              Settings
            </h1>
          </div>

          <button
            onClick={() => router.push("/home")}
            className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow ring-1 ring-emerald-100 transition hover:bg-emerald-50"
          >
            ← Back
          </button>
        </div>

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex items-center gap-4 rounded-3xl bg-gradient-to-br from-emerald-700 to-green-800 p-6 text-white shadow-xl"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold">
            {(userData.fullName || "U").charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{userData.fullName || "User"}</h2>
            <p className="text-sm text-emerald-100">{userData.email}</p>
          </div>
          <button
            onClick={() => router.push("/profile")}
            className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/25"
          >
            Edit
          </button>
        </motion.div>

        {/* Groups */}
        {groups.map((group, gi) => (
          <div key={group.title} className="mt-8">
            <h3 className="mb-3 px-2 text-sm font-bold uppercase tracking-wider text-gray-400">
              {group.title}
            </h3>

            <div className="overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-emerald-50/50">
              {group.items.map((item, index) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + gi * 0.1 + index * 0.05 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => item.path && router.push(item.path)}
                  className={`flex w-full items-center gap-4 p-5 text-left transition hover:bg-emerald-50/50 ${
                    index !== 0 ? "border-t border-gray-100" : ""
                  }`}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <item.icon size={20} />
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{item.label}</h4>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>

                  <ChevronRight className="h-5 w-5 text-gray-300" />
                </motion.button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="mt-10 w-full rounded-2xl bg-red-500 py-4 text-lg font-bold text-white shadow-xl transition hover:bg-red-600"
        >
          Logout
        </motion.button>

        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Islaam-E-Deen • Made with 🤍 for the Ummah
        </p>
      </div>
    </main>
  );
}
