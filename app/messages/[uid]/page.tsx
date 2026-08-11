"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { ChevronLeft, Send, Lock, BellRing } from "lucide-react";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { getUserProfile, getConversationId, type PublicUser } from "@/lib/firestore";
import { useI18n } from "@/lib/i18n";

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: number;
}

export default function ConversationPage() {
  const params = useParams<{ uid: string }>();
  const otherUid = params.uid;
  const router = useRouter();
  const { t } = useI18n();

  const [myUid, setMyUid] = useState("");
  const [otherUser, setOtherUser] = useState<PublicUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [toast, setToast] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function load() {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }
      setMyUid(user.uid);
    }
    load();
  }, [router]);

  useEffect(() => {
    if (!otherUid) return;
    getUserProfile(otherUid)
      .then((p) => {
        if (p) setOtherUser({ uid: otherUid, ...p });
      })
      .catch(() => {});
  }, [otherUid]);

  const markConversationRead = useCallback(() => {
    if (!myUid || !otherUid) return;
    const id = getConversationId(myUid, otherUid);
    updateDoc(doc(db, "conversations", id), {
      [`lastRead.${myUid}`]: Date.now(),
    }).catch(() => {});
  }, [myUid, otherUid]);

  useEffect(() => {
    if (!myUid || !otherUid) return;
    const id = getConversationId(myUid, otherUid);

    const q = query(
      collection(db, `conversations/${id}/messages`),
      orderBy("time", "asc"),
      limit(100)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ChatMessage, "id">),
        }));

        const now = Date.now();
        let hasFreshIncoming = false;
        list.forEach((msg) => {
          if (msg.sender === myUid) return;
          if (seenIdsRef.current.has(msg.id)) return;
          seenIdsRef.current.add(msg.id);
          if (now - msg.time < 60000) {
            hasFreshIncoming = true;
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
            setToast(msg.text);
            toastTimerRef.current = setTimeout(() => setToast(""), 4000);
          }
        });

        setMessages(list);

        if (hasFreshIncoming || list.some((m) => m.sender !== myUid)) {
          markConversationRead();
        }
      },
      () => {}
    );

    return () => {
      unsub();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [myUid, otherUid, markConversationRead]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function ensureConversation() {
    const id = getConversationId(myUid, otherUid);
    const convRef = doc(db, "conversations", id);
    const snap = await getDoc(convRef);
    if (!snap.exists()) {
      await setDoc(convRef, {
        members: [myUid, otherUid],
        lastTime: Date.now(),
        lastMessage: "",
      });
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !myUid || !otherUid) return;

    const id = getConversationId(myUid, otherUid);

    try {
      await ensureConversation();
      await addDoc(collection(db, `conversations/${id}/messages`), {
        sender: myUid,
        text: input.trim(),
        time: Date.now(),
      });
      await updateDoc(doc(db, "conversations", id), {
        lastMessage: input.trim(),
        lastTime: Date.now(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setInput("");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100">
      <div className="sticky top-0 z-30 border-b border-white/40 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-5 py-3">
          <button
            onClick={() => router.push("/messages")}
            className="rounded-2xl bg-white p-2.5 shadow ring-1 ring-emerald-100"
          >
            <ChevronLeft className="h-5 w-5 text-emerald-700" />
          </button>

          {otherUser?.photoURL ? (
            <img
              src={otherUser.photoURL}
              alt={otherUser.fullName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-green-700 font-bold text-white">
              {otherUser?.fullName?.charAt(0) || "U"}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="truncate font-bold text-gray-800">
              {otherUser?.fullName || "User"}
            </h1>
            <p className="flex items-center gap-1 text-xs text-gray-500">
              <Lock className="h-3 w-3" />
              {t("messages.private")}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-5">
        <div className="h-[70vh] space-y-4 overflow-y-auto py-6">
          {messages.length === 0 && (
            <div className="pt-16 text-center">
              <p className="text-5xl">🤲</p>
              <p className="mt-4 font-semibold text-gray-700">
                {t("messages.saySalam", { name: otherUser?.fullName || "this member" })}
              </p>
              <p className="mt-1 text-sm text-gray-400">
                {t("messages.privateDesc")}
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const mine = msg.sender === myUid;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    mine
                      ? "rounded-br-md bg-emerald-700 text-white"
                      : "rounded-bl-md bg-white text-gray-800 shadow-md ring-1 ring-emerald-100"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p className={`mt-1 text-[10px] ${mine ? "text-emerald-200" : "text-gray-400"}`}>
                    {new Date(msg.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </motion.div>
            );
          })}
          <div ref={endRef} />
        </div>

        <form onSubmit={sendMessage} className="flex gap-2 pb-8">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("messages.writeMessage")}
            className="flex-1 rounded-2xl bg-white px-5 py-3.5 text-sm shadow-md outline-none ring-1 ring-emerald-100 focus:ring-2 focus:ring-emerald-500"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="rounded-2xl bg-emerald-700 px-6 text-white shadow-lg transition hover:bg-emerald-800"
          >
            <Send size={18} />
          </motion.button>
        </form>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed left-1/2 top-4 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-start gap-3 rounded-2xl bg-emerald-700 p-4 text-white shadow-2xl"
          >
            <BellRing className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold">{otherUser?.fullName || "New message"}</p>
              <p className="truncate text-sm text-emerald-100">{toast}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
