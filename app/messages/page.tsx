"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft, Search, Plus, Mail } from "lucide-react";
import { auth } from "@/lib/firebase";
import { getAllUsers, type PublicUser } from "@/lib/firestore";
import { useUnreadConversations } from "@/lib/use-unread";
import { useI18n } from "@/lib/i18n";

export default function MessagesPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { conversations } = useUnreadConversations();
  const [myUid, setMyUid] = useState("");
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }
      setMyUid(user.uid);
      setLoading(false);
    }
    load();
  }, [router]);

  useEffect(() => {
    getAllUsers()
      .then((u) => setUsers(u))
      .catch(() => {});
  }, []);

  const userById = useMemo(() => {
    const map: Record<string, PublicUser> = {};
    users.forEach((u) => {
      map[u.uid] = u;
    });
    return map;
  }, [users]);

  const filteredUsers = users.filter(
    (u) => u.uid !== myUid && (u.fullName || u.username || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100">
      <div className="mx-auto max-w-2xl px-5 py-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/community")}
            className="inline-flex items-center gap-1 rounded-2xl bg-white px-4 py-2.5 font-semibold text-emerald-700 shadow-lg"
          >
            <ChevronLeft className="h-5 w-5" />
            {t("messages.back")}
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{t("messages.title")}</h1>
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-1 rounded-2xl bg-emerald-600 px-4 py-2.5 font-semibold text-white shadow-lg hover:bg-emerald-700"
          >
            <Plus className="h-5 w-5" />
            {t("messages.new")}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-3"
        >
          {loading && <p className="py-10 text-center text-gray-400">{t("messages.loading")}</p>}

          {!loading && conversations.length === 0 && (
            <div className="rounded-3xl bg-white p-10 text-center shadow-xl">
              <p className="text-5xl">💬</p>
              <p className="mt-4 font-semibold text-gray-700">{t("messages.noMessages")}</p>
              <p className="mt-1 text-sm text-gray-400">
                {t("messages.noMessagesDesc")}
              </p>
              <button
                onClick={() => setShowNew(true)}
                className="mt-6 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700"
              >
                {t("messages.newMessage")}
              </button>
            </div>
          )}

          {conversations.map((conv) => {
            const other = userById[conv.otherUid];
            return (
              <button
                key={conv.id}
                onClick={() => other && router.push(`/messages/${other.uid}`)}
                className="relative flex w-full items-center gap-3 rounded-3xl bg-white p-4 text-left shadow-xl ring-1 ring-emerald-50/50 transition hover:ring-2 hover:ring-emerald-300"
              >
                {other?.photoURL ? (
                  <img
                    src={other.photoURL}
                    alt={other.fullName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-green-700 text-lg font-bold text-white">
                    {other?.fullName?.charAt(0) || "U"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-bold text-gray-800">
                      {other?.fullName || "User"}
                    </h3>
                    {conv.unread && (
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                    )}
                  </div>
                  <p className={`truncate text-sm ${conv.unread ? "font-semibold text-gray-700" : "text-gray-500"}`}>
                    {conv.lastMessage || "Say salam 👋"}
                  </p>
                </div>
                {conv.lastTime && (
                  <span className="text-xs text-gray-400">
                    {new Date(conv.lastTime).toLocaleDateString([], {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>
      </div>

      {showNew && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-5"
          onClick={() => setShowNew(false)}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
                <Mail className="h-5 w-5 text-emerald-600" />
                {t("messages.newMessage")}
              </h2>
              <button
                onClick={() => setShowNew(false)}
                className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 ring-1 ring-gray-100">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("messages.searchMembers")}
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <div className="mt-4 flex-1 space-y-2 overflow-y-auto">
              {filteredUsers.map((user) => (
                <button
                  key={user.uid}
                  onClick={() => {
                    setShowNew(false);
                    router.push(`/messages/${user.uid}`);
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl bg-gray-50 p-3 text-left hover:bg-emerald-50"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.fullName}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-green-700 font-bold text-white">
                      {user.fullName?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-gray-800">
                      {user.fullName || "User"}
                    </h3>
                    <p className="truncate text-xs text-gray-400">
                      @{user.username} • {user.city || t("community.noLocation")}
                    </p>
                  </div>
                </button>
              ))}

              {filteredUsers.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-400">
                  {t("messages.noMembersFound")}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}
