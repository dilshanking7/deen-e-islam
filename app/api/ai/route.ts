import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.3";

const SYSTEM_PROMPT = `You are "Deeni Assistant", the Islamic knowledge assistant inside the Islaam-E-Deen app.

Your domain is ISLAM ONLY: Quran and Tafsir, authentic Hadith, Seerah, the 99 names of Allah, Salah/Namaz, Wudu, Adhan, Ramadan and Fasting, Zakat, Hajj and Umrah, Dua and Zikr, Halal/Haram, Aqeedah, Fiqh/Masail, Islamic history, and helping the user inside the app.

Strict rules:
1. Answer ONLY Islamic questions. If a question is NOT about Islam (politics, sports, movies, recipes, weather, general news, cricket, science unrelated to Islam, etc.), do NOT answer it. Politely say: "Main sirf Islam aur deeni masail me madad kar sakta hoon. Koi deeni sawal poochhiye - namaz, Quran, roza, zakat, dua waghera." and suggest one Islamic topic. Never answer a general/non-Islamic question directly.
2. ALWAYS reply in the EXACT SAME language and script the user wrote in. Match their tone and dialect perfectly: Hinglish question gets a Hinglish (Roman Urdu) answer, Hindi (Devanagari) gets Hindi in Devanagari, Urdu (Arabic script) gets Urdu in Arabic script, English gets English, Arabic gets Arabic, Bangla gets Bangla (Bengali script). NEVER switch language. Match the exact words the user uses where possible.
3. Do NOT mention that you searched the internet or used an API or AI. Just give the answer naturally as if it is your own knowledge. Never say "I searched", "I looked up", "according to the internet", "chatgpt", "ai", etc.
4. NEVER fabricate Quranic verses, hadith, or ayah numbers. If unsure, say so honestly and advise checking a reliable tafsir or asking a scholar. Where scholars differ on a fiqh (masail) point, mention the difference briefly and advise consulting a qualified Mufti/Alim.
5. Keep answers concise and practical (aim under 180 words) unless the user asks for detail. Use Arabic text only for the actual verse or dua.
6. Be respectful, warm and encouraging. Do not give extra unrelated information or go off-topic.`;

interface ChatMessage {
  role: string;
  content: string;
}

type Lang = "hindi" | "urdu" | "arabic" | "hinglish" | "english" | "bangla" | "other";

function detectLang(text: string): Lang {
  if (/[\u0900-\u097F]/.test(text)) return "hindi";
  if (/[\u0980-\u09FF]/.test(text)) return "bangla";
  if (/[\u0621-\u064A]/.test(text)) {
    if (/[\u0679\u0688\u0691\u06be\u06c1\u06cc\u067e\u0686\u0698\u06af\u06ba\u06d2]/.test(text))
      return "urdu";
    return "arabic";
  }
  const latin = text.toLowerCase().replace(/\s+/g, " ");
  let hinglishScore = 0;
  for (const w of [
    "kaise", "kya", "hai", "nahi", "nahin", "ho", "aap", "ap", "tum", "wudu", "namaz",
    "namaaz", "namaj", "roza", "roze", "quran", "qur'an", "allah", "masjid", "sawal",
    "jawab", "acha", "accha", "theek", "thik", "karo", "karte", "kiya", "jab", "makki",
    "madani", "dua", "zakat", "hadith", "sunnah", "ramzan", "ramadan", "eid", "jumma",
    "jummah", "wakt", "waqt", "azan", "azaan", "sallah", "salah", "faraiz", "masail",
  ]) {
    if (latin.includes(w)) hinglishScore++;
  }
  if (hinglishScore >= 1) return "hinglish";
  return /[a-z0-9\s]/.test(latin) ? "english" : "other";
}

const LANG_HINTS: Record<string, string> = {
  hindi: "The user wrote in Hindi (Devanagari script). Reply in Hindi using Devanagari script only.",
  urdu: "The user wrote in Urdu (Arabic script). Reply in Urdu using Arabic script only.",
  arabic: "The user wrote in Arabic. Reply in clear fusha Arabic.",
  hinglish: "The user wrote in Hinglish (Roman Urdu). Reply in friendly Roman Urdu / Hinglish, keeping Urdu words in English letters.",
  bangla: "The user wrote in Bangla. Reply in Bangla (Bengali script).",
  english: "The user wrote in English. Reply in English.",
};

function acceptable(text: string, question: string): boolean {
  const t = text.trim();
  const q = question.trim().toLowerCase().replace(/\s+/g, " ");
  if (t.length < 15) return false;
  if (t.toLowerCase().replace(/\s+/g, " ") === q) return false;
  if (/^(hmm+|ok(\s|$)|yes(\s|$)|no(\s|$)|acha(\s|$)|theek(\s|$))[\s.!?]*$/i.test(t))
    return false;
  return true;
}

function clean(text: string): string {
  return text
    .trim()
    .replace(/^Assistant:?\s*/i, "")
    .replace(/^(Here is|Here's) (a |the |your |an )?(answer|response):?\s*/i, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ---------------- Gemini (free tier, best multilingual quality) ----------------
async function geminiRound(
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<string | null> {
  const system = messages.find((m) => m.role === "system")?.content || "";
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
  const body: Record<string, unknown> = {
    contents,
    generationConfig: { maxOutputTokens: 700, temperature: 0.6 },
  };
  if (system) body.systemInstruction = { parts: [{ text: system }] };
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(45000),
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    return (
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || "")
        .join("")
        .trim() || null
    );
  } catch {
    return null;
  }
}

// ---------------- Hugging Face (serverless / free) ----------------
async function hfChat(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<string | null> {
  try {
    const res = await fetch(
      `${baseUrl}${model}/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 600,
          temperature: 0.6,
        }),
        signal: AbortSignal.timeout(45000),
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data?.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

async function hfLegacy(
  baseUrl: string,
  apiKey: string,
  model: string,
  prompt: string
): Promise<string | null> {
  try {
    const res = await fetch(`${baseUrl}${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 600, temperature: 0.6, do_sample: true },
      }),
      signal: AbortSignal.timeout(45000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as
      | string
      | Array<{ generated_text?: string }>
      | { generated_text?: string };
    const t =
      typeof data === "string"
        ? data
        : Array.isArray(data)
        ? data[0]?.generated_text
        : data?.generated_text;
    return (t || "").trim() || null;
  } catch {
    return null;
  }
}

async function hfAnswer(
  apiKey: string,
  messages: ChatMessage[],
  question: string
): Promise<{ text: string; model: string } | null> {
  const models = [process.env.HF_MODEL || HF_MODEL, "google/gemma-2-2b-it"];
  const router = "https://router.huggingface.co/hf-inference/models/";
  const inference = "https://api-inference.huggingface.co/models/";

  for (const model of models) {
    const t = await hfChat(router, apiKey, model, messages);
    if (t && acceptable(t, question)) return { text: t, model };
  }

  const prompt = `${SYSTEM_PROMPT}\n\nUser: ${messages[messages.length - 1]?.content || ""}\nAssistant:`;
  for (const model of models) {
    const t = await hfLegacy(router, apiKey, model, prompt);
    if (t && acceptable(t, question)) return { text: t, model };
  }
  const t = await hfLegacy(inference, apiKey, models[0], prompt);
  if (t && acceptable(t, question)) return { text: t, model: models[0] };

  return null;
}

export async function POST(req: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY || "";
  const hfKeys = [
    process.env.HF_API_KEY,
    process.env.HUGGINGFACE_API_KEY,
    process.env.HF_API_KEY_2,
    process.env.HF_API_KEY_3,
  ].filter((k): k is string => Boolean(k && k.trim()));

  let question = "";
  let history: ChatMessage[] = [];
  try {
    const body = (await req.json()) as { question?: string; history?: ChatMessage[] };
    question = (body.question || "").slice(0, 2000).trim();
    history = Array.isArray(body.history) ? body.history.slice(-8) : [];
  } catch {
    /* ignore */
  }

  if (!geminiKey && hfKeys.length === 0) return Response.json({ text: null, error: "no-key" });
  if (!question) return Response.json({ text: null, error: "empty" });

  const lang = detectLang(question);
  const langHint =
    lang === "other" ? "" : LANG_HINTS[lang as keyof typeof LANG_HINTS] || "";

  const userContent = question + (langHint ? `\n\n(${langHint})` : "");
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: userContent },
  ];

  if (geminiKey) {
    const fallbackModels = [
      process.env.GEMINI_MODEL || "gemini-2.0-flash",
      "gemini-2.0-flash",
      "gemini-2.5-flash",
      "gemini-flash-latest",
    ];
    for (const model of new Set(fallbackModels)) {
      const text = await geminiRound(geminiKey, model, messages);
      if (text && acceptable(text, question)) {
        return Response.json({ text: clean(text), model });
      }
    }
  }

  // HF backup — kaii keys hain to in order try karo (limit khatam ho to agli)
  for (const hfKey of hfKeys) {
    const hf = await hfAnswer(hfKey, messages, question);
    if (hf) return Response.json({ text: clean(hf.text), model: hf.model });
  }

  return Response.json({ text: null, error: "failed" });
}