"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Sparkles, CornerDownRight } from "lucide-react";

import { getAiAnswerAsync, AI_QUICK_QUESTIONS, AiAnswer } from "@/lib/ai-assistant";
import { trackActivity } from "@/lib/activity";

interface ChatMessage {
  role: "user" | "ai";
  text: string;
  answer?: AiAnswer;
}

const GREETING = (name: string) =>
  `Assalamu Alaikum${name ? ` ${name}` : ""}! Main aapka deeni saathi hoon 🤖\n\nNamaz ke waqt, wudu, namaz ke faraiz, roza, zakat, Quran — koi bhi sawal poochiye, main seedha app me khol dunga.`;

const READING_PREFIXES = [
  "/quran/mushaf",
  "/quran/read",
  "/quran/translation",
  "/quran/audio",
  "/pdf",
  "/quran/daily-verse",
];

function isReadingRoute(pathname: string) {
  return READING_PREFIXES.some((p) => pathname.startsWith(p));
}

export default function AssistantWidget() {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [userName, setUserName] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const hidden = isReadingRoute(pathname) || pathname === "/assistant";

  // Close the chat whenever the user navigates (fresh conversation next time)
  useEffect(() => {
    const timer = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  function toggleOpen() {
    if (!open) {
      const name = localStorage.getItem("islaam-ai-name") || "";
      setUserName(name);
      if (messages.length === 0) {
        setMessages([{ role: "ai", text: GREETING(name) }]);
      }
    }
    setOpen((v) => !v);
    if (!open) trackActivity("assistant");
  }

  function handleSend(raw?: string) {
    const q = (raw ?? input).trim();
    if (!q || thinking) return;
    setInput("");
    setUserName(userName);
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setThinking(true);
    trackActivity("assistant_ask");

    localStorage.setItem("islaam-ai-name", userName);
    getAiAnswerAsync(q)
      .then((answer) => {
        setMessages((prev) => [...prev, { role: "ai", text: answer.answer, answer }]);
      })
      .catch(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text:
              "Ye sawal meri samajh me nahi aya. Aap aise poochh sakte hain: \"Namaz ke faraiz kya hain?\", \"Wudu kaise karein?\", \"Surah Yaseen kholo\", \"Namaz ke waqt kya hain?\" — ya upar kisi quick sawal par click karein.",
          },
        ]);
      })
      .finally(() => setThinking(false));
  }

  if (hidden) return null;

  return (
    <>
      {/* Floating animated FAB */}
      <motion.button
        onClick={toggleOpen}
        initial={{ opacity: 0, scale: 0, rotate: -60 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label="AI Assistant"
        className="fixed bottom-24 right-4 z-[70] flex h-16 w-16 items-center justify-center rounded-full shadow-2xl sm:right-5"
      >
        {/* Animated conic gradient ring */}
        <span className="absolute inset-0 animate-spin-slow rounded-full bg-[conic-gradient(from_0deg,#10b981,#22c55e,#facc15,#f97316,#ec4899,#10b981)] opacity-90" />
        <span className="absolute inset-[3px] animate-pulse rounded-full bg-emerald-950/40" />
        <span className="absolute -inset-2 rounded-full bg-emerald-400/30 blur-xl animate-pulse" />

        <span className="relative z-10 text-white">
          {open ? <X size={26} /> : <Bot size={28} />}
        </span>

        {/* Tiny dot badge */}
        {!open && (
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className="absolute right-1 top-1 z-10 h-3.5 w-3.5 rounded-full bg-green-400 ring-2 ring-white"
          />
        )}
      </motion.button>

      {/* Chat popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="fixed bottom-[8.5rem] right-3 left-3 z-[70] mx-auto flex h-[min(70vh,560px)] w-[calc(100%-1.5rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-2xl sm:right-5 sm:left-auto sm:bottom-24"
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-700 to-green-800 px-5 py-4">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                <Bot className="h-5 w-5 text-white" />
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                  className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-green-300 ring-2 ring-emerald-800"
                />
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-white">Deeni Assistant</p>
                <p className="text-[11px] text-emerald-100">
                  Quran • Namaz • Masail • App
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="flex flex-col gap-3">
                <AnimatePresence>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[90%] whitespace-pre-line rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow ${
                          msg.role === "user"
                            ? "rounded-br-md bg-emerald-700 text-white"
                            : "rounded-bl-md bg-emerald-50 text-gray-800"
                        }`}
                      >
                        {msg.text}

                        {msg.answer && msg.answer.web && (
                          <p className="mt-2 text-[10px] font-semibold text-emerald-500">
                            Web se liya gaya • {msg.answer.web.source}
                          </p>
                        )}

                        {msg.answer && msg.answer.aiModel && (
                          <p className="mt-2 text-[10px] font-semibold text-emerald-500">
                            AI se jawab • {msg.answer.aiModel}
                          </p>
                        )}

                        {msg.answer && msg.answer.links.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {msg.answer.links.map((link) => (
                              <button
                                key={link.path}
                                onClick={() => {
                                  if (link.path.startsWith("http")) {
                                    window.open(link.path, "_blank", "noopener,noreferrer");
                                  } else {
                                    router.push(link.path);
                                  }
                                }}
                                className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100 active:scale-95"
                              >
                                <CornerDownRight size={12} />
                                {link.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {thinking && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-emerald-50 px-4 py-3">
                        {[0, 1, 2].map((d) => (
                          <motion.span
                            key={d}
                            animate={{ y: [0, -4, 0] }}
                            transition={{ repeat: Infinity, duration: 0.7, delay: d * 0.15 }}
                            className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quick chips */}
                {messages.length <= 1 && !thinking && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                      <Sparkles size={11} /> Quick sawal
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {AI_QUICK_QUESTIONS.slice(0, 6).map((q) => (
                        <button
                          key={q}
                          onClick={() => handleSend(q)}
                          className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-50 active:scale-95"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
                <div ref={endRef} />
              </div>
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 border-t border-gray-100 p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Sawal poochiye..."
                className="flex-1 rounded-2xl bg-gray-50 px-4 py-2.5 text-sm outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-emerald-500"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="submit"
                disabled={thinking || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-lg transition disabled:opacity-40"
              >
                <Send size={16} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}