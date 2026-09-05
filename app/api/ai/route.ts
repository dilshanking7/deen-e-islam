import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const DEFAULT_MODEL = "mistralai/Mistral-7B-Instruct-v0.3";

const SYSTEM_PROMPT = `You are "Deeni Assistant", an Islamic knowledge assistant inside the Islaam-E-Deen app.

Rules:
- Answer in a friendly mix of simple Roman Urdu and English (Hinglish). Use Arabic text only for Quranic verses/duas when helpful.
- Keep answers clear and concise (max ~150 words) unless the user asks for detail.
- Be respectful, accurate and Sunnah-based. For fiqh (masail) where scholars differ, mention that a qualified Alim/Mufti should be consulted for personal rulings.
- If asked to open or do something in the app (like "prayer times", "Quran", "Wudu"), answer briefly and just suggest the app section.
- Never invent Quran verses or hadith. If unsure, say so and advise consulting a reliable source.`;

interface ChatMessage {
  role: string;
  content: string;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function tryChatCompletions(
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<string | null> {
  const res = await fetch(
    `https://api-inference.huggingface.co/models/${encodeURIComponent(model)}/v1/chat/completions`,
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
      signal: AbortSignal.timeout(30000),
    }
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data?.choices?.[0]?.message?.content?.trim() || null;
}

async function tryLegacy(
  apiKey: string,
  model: string,
  prompt: string
): Promise<string | null> {
  const res = await fetch(
    `https://api-inference.huggingface.co/models/${encodeURIComponent(model)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 600, temperature: 0.6, do_sample: true },
      }),
      signal: AbortSignal.timeout(30000),
    }
  );
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
}

export async function POST(req: NextRequest) {
  const apiKey =
    process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY || "";
  let question = "";
  let history: ChatMessage[] = [];
  try {
    const body = (await req.json()) as { question?: string; history?: ChatMessage[] };
    question = (body.question || "").slice(0, 2000).trim();
    history = Array.isArray(body.history) ? body.history.slice(-8) : [];
  } catch {
    /* ignore */
  }

  const model = process.env.HF_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    return Response.json({ text: null, error: "no-key" });
  }
  if (!question) {
    return Response.json({ text: null, error: "empty" });
  }

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: question },
  ];
  const prompt = `${SYSTEM_PROMPT}\n\nUser: ${question}\nAssistant:`;

  let text = await tryChatCompletions(apiKey, model, messages);
  if (!text) {
    await delay(1000);
    text = await tryLegacy(apiKey, model, prompt);
  }

  if (!text) {
    return Response.json({ text: null, error: "failed" });
  }

  const clean =
    text.replace(/^Assistant:/, "").trim().replace(/\n{3,}/g, "\n\n") ||
    null;
  return Response.json({ text: clean, model });
}