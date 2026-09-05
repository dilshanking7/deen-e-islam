"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, ArrowLeft, CornerDownRight } from "lucide-react";

import { getAiAnswerAsync, AI_QUICK_QUESTIONS, AiAnswer } from "@/lib/ai-assistant";
import { useI18n } from "@/lib/i18n";
import ThemeControls from "@/components/ui/ThemeControls";

interface ChatMessage {
  role: "user" | "ai";
  text: string;
  answer?: AiAnswer;
}

const GREETING = (name: string) =>
  `Assalamu Alaikum${name ? ` ${name}` : ""}! Main aapka deeni saathi hoon 🤖\n\nNamaz ke waqt, wudu, namaz ke faraiz, roza, zakat, Quran, kitabein ya app ki koi bhi cheez — mujhse koi bhi sawal poochiye, main seedha app me khol dunga.`;

export default function AssistantPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(true);
  const [userName, setUserName] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = localStorage.getItem("islaam-ai-name");
      const name = stored || (localStorage.getItem("islaam-last-name") ?? "");
      setUserName(name);
      setMessages([{ role: "ai", text: GREETING(name) }]);
      setThinking(false);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  function handleSend(raw?: string) {
    const q = (raw ?? input).trim();
    if (!q || thinking) return;
    setInput("");
    const userMsg: ChatMessage = { role: "user", text: q };
    setMessages((prev) => [...prev, userMsg]);
    setThinking(true);

    localStorage.setItem("islaam-ai-name", userName);
    getAiAnswerAsync(q)
      .then((answer) => {
        setMessages((prev) => [...prev, { role: "ai", text: answer.answer, answer }]);
      })
      .catch(() => {
        setMessages((prev) => [...prev, { role: "ai", text: t("ai.noAnswer") }]);
      })
      .finally(() => setThinking(false));
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-emerald-50 via-white to-green-100">
      <div className="fixed left-0 top-0 -z-10 h-72 w-72 rounded-full bg-emerald-300/30 blur-[120px]" />
      <div className="fixed bottom-0 right-0 -z-10 h-72 w-72 rounded-full bg-green-400/30 blur-[120px]" />

      <header className="sticky top-0 z-20 border-b border-emerald-100/80 bg-white/70 px-5 py-3.5 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/home")}
            className="rounded-2xl bg-white p-2.5 text-emerald-700 shadow ring-1 ring-emerald-100 transition hover:bg-emerald-50"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 shadow-lg">
            <Bot className="h-6 w-6 text-white" />
            <motion.span
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-green-400 ring-2 ring-white"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-extrabold text-gray-800">{t("ai.name")}</h1>
            <p className="text-xs text-emerald-600">{t("ai.subtitle")}</p>
          </div>
          <ThemeControls />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-32 pt-5">
        <div className="flex flex-1 flex-col gap-3">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-3xl px-5 py-4 text-sm leading-relaxed shadow ${
                    msg.role === "user"
                      ? "rounded-br-md bg-gradient-to-br from-emerald-700 to-green-800 text-white"
                      : "rounded-bl-md bg-white text-gray-800 ring-1 ring-emerald-100"
                  }`}
                >
                  {msg.text}

                  {msg.answer && msg.answer.links.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
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
                          className="inline-flex items-center gap-1 rounded-2xl bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100 active:scale-95"
                        >
                          <CornerDownRight size={13} />
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${messages.length ? "justify-start" : "justify-center"}`}
              >
                <div
                  className={`rounded-3xl px-5 py-3.5 text-sm text-gray-500 ring-1 ring-emerald-100 ${
                    messages.length ? "bg-white" : "bg-white/70"
                  }`}
                >
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  >
                    {t("ai.typeHere")}
                  </motion.span>
                  <span className="ml-1 inline-flex gap-0.5">
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: d * 0.15 }}
                        className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                      />
                    ))}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {messages.length <= 1 && !thinking && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-600">
                <Sparkles size={13} /> {t("ai.quick")}
              </p>
              <div className="flex flex-wrap gap-2">
                {AI_QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow ring-1 ring-emerald-100 transition hover:bg-emerald-50 active:scale-95"
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="fixed bottom-28 left-0 right-0 z-20 mx-auto max-w-2xl px-4"
      >
        <div className="flex items-center gap-2 rounded-3xl bg-white p-2 shadow-2xl ring-1 ring-emerald-200">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("ai.placeholder")}
            className="flex-1 bg-transparent px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400"
          />
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="submit"
            disabled={thinking || !input.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-lg transition hover:from-emerald-700 hover:to-green-800 disabled:opacity-40"
          >
            <Send size={18} />
          </motion.button>
        </div>
      </form>
    </main>
  );
}