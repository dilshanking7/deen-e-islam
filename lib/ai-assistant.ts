import knowledge from "./ai-knowledge.json";
import { searchWeb, type WebResult } from "./web-search";
import { lookupVerse, surahStartPage } from "./quran-lookup";

export interface AiLink {
  label: string;
  path: string;
}

export interface AiAnswer {
  title: string;
  answer: string;
  links: AiLink[];
  web?: WebResult | null;
  aiModel?: string;
}

interface Intent {
  keys: string[];
  title: string;
  answer: string;
  links: AiLink[];
}

interface Knowledge {
  intents: Intent[];
  fallback: Intent;
  quick_questions: string[];
}

const KB = knowledge as unknown as Knowledge;

export const AI_QUICK_QUESTIONS = KB.quick_questions;

function normalize(text: string): string {
  return (text || "")
    .toLowerCase()
    .trim()
    .replace(/[\u064B-\u065F\u06D6-\u06ED\u0670]/g, "")
    .replace(/[’'`]/g, "")
    .replace(/\bqur'?an\b/g, "quran")
    .replace(/\bnimaz\b/g, "namaz")
    .replace(/\bnamaj\b/g, "namaz")
    .replace(/\bnamaaz\b/g, "namaz")
    .replace(/\brojz[ae]?\b/g, "roza")
    .replace(/\ba\//g, "a ")
    .replace(/[.,?!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  return normalize(text).split(" ").filter(Boolean);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array(n + 1).fill(0);
  let curr = new Array(n + 1).fill(0);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

function isAlphaWord(tok: string): boolean {
  return /^[a-z\u0600-\u06FF]+$/.test(tok);
}

function sameStart(a: string, b: string): boolean {
  return a.slice(0, 2) === b.slice(0, 2);
}

interface Match {
  intent: Intent;
  score: number;
}

function matchIntents(q: string): Match[] {
  const nq = normalize(q);
  if (!nq) return [];
  const tokens = tokenize(q);
  const results: Match[] = [];

  for (const intent of KB.intents) {
    let best = 0;
    for (const rawKey of intent.keys) {
      const key = normalize(rawKey);
      if (!key) continue;
      const isPhrase = key.includes(" ");
      if (isPhrase) {
        if (nq.includes(key)) {
          best = Math.max(best, 100 + key.length);
          continue;
        }
        const keyTokens = key.split(" ");
        let ok = true;
        let idx = 0;
        for (const kt of keyTokens) {
          const found = tokens.slice(idx).findIndex(
            (t) =>
              t === kt ||
              (isAlphaWord(t) &&
                isAlphaWord(kt) &&
                sameStart(t, kt) &&
                levenshtein(t, kt) <= (kt.length <= 4 ? 1 : 2))
          );
          if (found < 0) {
            ok = false;
            break;
          }
          idx += found + 1;
        }
        if (ok) best = Math.max(best, 60);
      } else {
        if (nq.includes(key)) {
          best = Math.max(best, 80 + key.length * 2);
        } else {
          for (const t of tokens) {
            if (!isAlphaWord(t)) continue;
            if (t === key) {
              best = Math.max(best, 95);
              break;
            }
            if (
              Math.abs(t.length - key.length) <= 2 &&
              levenshtein(t, key) <= (key.length <= 4 ? 1 : 2)
            ) {
              best = Math.max(best, 60 - Math.min(4, levenshtein(t, key)));
              break;
            }
          }
        }
      }
    }
    if (best >= 55) results.push({ intent, score: best });
  }
  return results.sort((a, b) => b.score - a.score);
}

function buildAnswer(intent: Intent): AiAnswer {
  return {
    title: intent.title,
    answer: intent.answer,
    links: intent.links || [],
  };
}

// Direct numeric page request: "page 15", "safa 15"
function handlePageQuery(q: string, tokens: string[]): AiAnswer | null {
  const m = q.match(/(?:page|safa)\s+no\.?\s*(\d{1,3})|(?:page|safa)\s*(\d{1,3})/);
  if (m) {
    const n = Number(m[1] || m[2]);
    if (n >= 1 && n <= 604) {
      return {
        title: "Quran — Page " + n,
        answer: `Quran mushaf page ${n} par le jaa raha hoon — misst usi page se khulega.`,
        links: [{ label: `Page ${n} kholen`, path: `/quran/mushaf?page=${n}` }],
      };
    }
  }
  void tokens;
  return null;
}

// ---------------- Repetition memory (ek hi baat baar-baar na dohraye) --------------
const RECENT_KEY = "islaam-ai-recent";

function rememberTopic(topic: string) {
  if (typeof window === "undefined") return;
  try {
    const list: Array<{ topic: string; at: number }> = JSON.parse(
      localStorage.getItem(RECENT_KEY) || "[]"
    );
    list.push({ topic, at: Date.now() });
    const slim = list.slice(-8);
    localStorage.setItem(RECENT_KEY, JSON.stringify(slim));
  } catch {}
}

function repeatCount(topic: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const list: Array<{ topic: string; at: number }> = JSON.parse(
      localStorage.getItem(RECENT_KEY) || "[]"
    );
    const window = Date.now() - 25 * 60 * 1000;
    return list.filter((r) => r.topic === topic && r.at > window).length + 1;
  } catch {
    return 0;
  }
}

function applyRepeatNote(answer: AiAnswer, topic: string): AiAnswer {
  const reps = repeatCount(topic);
  rememberTopic(topic);
  if (reps <= 1) return answer;
  if (reps >= 3) {
    return {
      ...answer,
      answer:
        `Yeh sawal aap pehle bhi poochh chuke hain — isi liye main mukhtasar jawab deta hoon. ` +
        answer.answer,
    };
  }
  return {
    ...answer,
    answer: `Aapne yeh pehle bhi poochha tha. Ek baar phir se samajhte hain: ` + answer.answer,
  };
}

// ---------------- Free AI (Hugging Face) — kisi bhi sawal ka jawab ----------------
export async function queryHuggingFace(
  question: string
): Promise<{ text: string; model: string } | null> {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
      signal: AbortSignal.timeout(45000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { text?: string; model?: string };
    if (data?.text) return { text: data.text, model: data.model || "" };
    return null;
  } catch {
    return null;
  }
}
// ---------------- Async smart answer (Quran + web + local) --------------
export async function getAiAnswerAsync(rawQuery: string): Promise<AiAnswer> {
  const q = normalize(rawQuery);
  if (!q) {
    return {
      title: "Kuch likhiye",
      answer: "Koi sawal zaroor likhiye, main jawab dunga.",
      links: [],
    };
  }

  // 1) Mushaf page shortcuts
  const pageHit = handlePageQuery(q, tokenize(rawQuery));
  if (pageHit) return pageHit;

  // 2) Quran verse/surah lookup — seedha Quran se jawaab
  try {
    const verse = await lookupVerse(rawQuery);
    if (verse) {
      if (verse.hasVerse) {
        rememberTopic(`quran|${verse.surahNumber}:${verse.ayahNumber}`);
        const lines = [verse.arabic || ""];
        if (verse.urdu) lines.push("\nUrdu Tarjuma:\n" + verse.urdu);
        if (verse.hindi && verse.hindi !== verse.urdu)
          lines.push("\nHindi Tarjuma:\n" + verse.hindi);
        if (verse.english && !verse.urdu) lines.push("\nEnglish:\n" + verse.english);
        return {
          title: `Surah ${verse.surahName} • Ayat ${verse.ayahNumber}`,
          answer: lines.filter(Boolean).join("\n"),
          links: [
            {
              label: "Tarjuma ke saath parhein",
              path: `/quran/translation/page/${surahStartPage(verse.surahNumber)}`,
            },
            {
              label: "Mushaf me kholen",
              path: `/quran/mushaf?page=${surahStartPage(verse.surahNumber)}`,
            },
          ],
        };
      }
      return {
        title: `Surah ${verse.surahName}`,
        answer:
          `${verse.surahName} (meaning: ${verse.surahMeaning}) — ${verse.numberOfAyahs} ayahs, ` +
          `${verse.revelationType} me nazil hui. Kisi khaas aayat ka matlab poochhiye, main wahi tarjuma dikha dunga.`,
        links: [
          { label: "Surah parhein", path: `/quran/translation/page/${surahStartPage(verse.surahNumber)}` },
        ],
      };
    }
  } catch {}

  // 3) Local knowledge base (books + masail training)
  const matches = matchIntents(q);
  if (matches.length > 0) {
    const strong = matches[0].score >= 90;
    if (strong) {
      const answer = buildAnswer(matches[0].intent);
      return applyRepeatNote(answer, matches[0].intent.title);
    }
  }

  // 3.5) Free AI (Hugging Face) - kisi bhi sawal ka jawab
  const hf = await queryHuggingFace(rawQuery);
  if (hf) {
    return {
      title: "Deeni Assistant (AI)",
      answer: hf.text,
      links: [
        { label: "Namaz ke waqt", path: "/prayer" },
        { label: "Quran", path: "/quran/read" },
      ],
      aiModel: hf.model,
    };
  }

  // 4) Internet se kuch dhoondhein
  const web = await searchWeb(rawQuery);
  if (web) {
    const info =
      `Main internet par jhhaant kar is sawal ka jawaab laaya hoon:\n\n${web.text}\n\n` +
      `Ziyada chahhiye to neeche diye link par padhein.`;
    return {
      title: web.title,
      answer: info,
      links: [
        { label: `${web.source} par ziyada padhein`, path: web.url },
        { label: "Namaz ke waqt", path: "/prayer" },
        { label: "Quran", path: "/quran/read" },
      ],
      web,
    };
  }

  // 4.5) Weak KB match ho to wahi jawab
  if (matches.length > 0) {
    const answer = buildAnswer(matches[0].intent);
    return applyRepeatNote(answer, matches[0].intent.title);
  }

  return buildAnswer(KB.fallback);
}

// Sync (local-only) — purane callers ke liye fallback
export function getAiAnswer(rawQuery: string): AiAnswer | null {
  const q = normalize(rawQuery);
  if (!q) return null;

  const pageHit = handlePageQuery(q, tokenize(rawQuery));
  if (pageHit) return pageHit;

  const matches = matchIntents(q);
  if (matches.length > 0) return buildAnswer(matches[0].intent);

  return buildAnswer(KB.fallback);
}