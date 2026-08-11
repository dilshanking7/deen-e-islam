import axios from "axios";

const MYMEMORY_URL = "https://api.mymemory.translated.net/get";

const SUPPORTED_LANGS: Record<string, string> = {
  English: "en",
  Hindi: "hi",
  Urdu: "ur",
  Bengali: "bn",
  Indonesian: "id",
  Turkish: "tr",
  French: "fr",
  Spanish: "es",
  Arabic: "ar",
};

export interface BookChapter {
  id: string;
  titleUr: string;
  titleEn: string;
  contentUr: string[];
}

export interface BookDef {
  slug: string;
  titleUr: string;
  titleEn: string;
  authorUr: string;
  authorEn: string;
  descriptionUr: string;
  descriptionEn: string;
  icon: string;
  accent: string;
  chapters: BookChapter[];
}

async function translateChunk(text: string, from: string, to: string): Promise<string> {
  const res = await axios.get(MYMEMORY_URL, {
    params: {
      q: text.slice(0, 450),
      langpair: `${from}|${to}`,
    },
    timeout: 15000,
  });
  const translated = res.data?.responseData?.translatedText;
  if (!translated) throw new Error("empty translation");
  return translated;
}

export async function translateBookContent(
  content: string[],
  target: string,
  source = "ur"
): Promise<string[]> {
  const to = SUPPORTED_LANGS[target];
  if (!to || to === source) return content;

  const results: string[] = [];
  for (const para of content) {
    try {
      results.push(await translateChunk(para, source, to));
    } catch {
      results.push(para);
    }
  }
  return results;
}

export const TRANSLATE_LANGS = [
  "English",
  "Hindi",
  "Bengali",
  "Indonesian",
  "Turkish",
  "French",
  "Spanish",
  "Arabic",
];
