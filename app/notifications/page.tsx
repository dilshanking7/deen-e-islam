"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bell, Mail, Users, ChevronRight, MessageCircle, Sparkles } from "lucide-react";
import { auth } from "@/lib/firebase";
import { getAllUsers, type PublicUser } from "@/lib/firestore";
import { useUnreadConversations } from "@/lib/use-unread";
import { useI18n } from "@/lib/i18n";
import { getUpcomingEvents, isEventToday, type UpcomingEvent } from "@/lib/islamic-events";

export default function NotificationsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { conversations } = useUnreadConversations();
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingEvent[]>([]);
  const [todayEvent, setTodayEvent] = useState<{ month: number; day: number; titleUrdu: string; titleEng: string; description: string; emoji: string } | null>(null);

  useEffect(() => {
    getAllUsers()
      .then((u) => setUsers(u))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setUpcoming(getUpcomingEvents(4));
    setTodayEvent(isEventToday());
  }, []);

  const userById = useMemo(() => {
    const map: Record<string, PublicUser> = {};
    users.forEach((u) => {
      map[u.uid] = u;
    });
    return map;
  }, [users]);

  const unread = conversations.filter((c) => c.unread);
  const hasUnread = unread.length > 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-emerald-300/30 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-purple-300/30 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-2xl px-5 pb-28 pt-8">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-icon.png"
            alt="Islaam-E-Deen"
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
          />
          <div>
            <h1 className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-400">
              {t("notifications.title")}
            </h1>
            <p className="text-xs text-gray-500">{t("notifications.subtitle")}</p>
          </div>
        </div>

        {hasUnread ? (
          <div className="mt-8 space-y-3">
            {unread.map((conv) => {
              const other = userById[conv.otherUid];
              const name = other?.fullName || "User";
              const avatar = other?.photoURL;
              return (
                <motion.button
                  key={conv.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => router.push(`/messages/${conv.otherUid}`)}
                  className="relative flex w-full items-center gap-3 rounded-3xl bg-white p-4 text-left shadow-xl ring-1 ring-emerald-50/50 transition hover:ring-2 hover:ring-emerald-300"
                >
                  <span className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-red-500" />
                  {avatar ? (
                    <img src={avatar} alt={name} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-green-700 text-lg font-bold text-white">
                      {name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-bold text-gray-800">
                      <Mail size={14} className="shrink-0 text-emerald-600" />
                      <span className="truncate">
                        {t("notifications.newMessage")} {name}
                      </span>
                    </p>
                    <p className="mt-1 truncate text-sm text-gray-500">
                      {conv.lastMessage || t("notifications.openChat")}
                    </p>
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-gray-300" />
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl bg-white p-10 text-center shadow-xl">
            <p className="text-5xl">🔔</p>
            <p className="mt-4 font-semibold text-gray-700">{t("notifications.empty")}</p>
            <p className="mt-1 text-sm text-gray-400">{t("notifications.emptyDesc")}</p>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push("/community")}
            className="flex items-center justify-center gap-2 rounded-2xl bg-white p-5 font-bold text-emerald-700 shadow-lg ring-1 ring-emerald-50 transition hover:bg-emerald-50"
          >
            <Users size={20} />
            {t("notifications.community")}
          </button>
          <button
            onClick={() => router.push("/messages")}
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 p-5 font-bold text-white shadow-lg transition hover:bg-emerald-800"
          >
            <MessageCircle size={20} />
            {t("notifications.messages")}
          </button>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-gray-400">
          <Bell size={15} />
          <span>{t("notifications.reminder")}</span>
        </div>

        {/* Islamic events */}
        <div className="mt-8">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            <h2 className="text-lg font-extrabold text-gray-800">Upcoming Islamic Events</h2>
          </div>

          {todayEvent && (
            <div className="mt-3 flex items-center gap-3 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-600 p-5 text-white shadow-xl">
              <span className="text-3xl">{todayEvent.emoji}</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-amber-100">
                  Aaj ka din ✨
                </p>
                <p className="font-bold">{todayEvent.titleUrdu}</p>
                <p className="text-sm text-amber-100">{todayEvent.titleEng}</p>
              </div>
            </div>
          )}

          <div className="mt-3 space-y-3">
            {upcoming.map((ev) => (
              <button
                key={ev.titleEng}
                onClick={() => router.push("/calendar")}
                className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-md ring-1 ring-emerald-50/50 transition hover:ring-2 hover:ring-amber-300"
              >
                <span className="text-2xl">{ev.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-gray-800">{ev.titleEng}</p>
                  <p className="text-xs text-gray-500">{ev.description}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-bold text-amber-600">
                    {ev.daysAway === 1 ? "Kal" : `${ev.daysAway} din`}
                  </p>
                  <p className="text-[10px] text-gray-400">{ev.gregorian}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
