export interface Naat {
  id: string;
  title: string;
  poet?: string;
  text: string;
  createdAt: number;
  author?: string;
}

const KEY = "islaam-naats";

export const SEED_NAATS: Naat[] = [
  {
    id: "seed-1",
    title: "Mein Naat Kehte Hue",
    poet: "Hazrat Salman Nadvî R.A.",
    text: `Mein naat kehte hue Maula ki mojzaayi se jab haath uthta hai,
yageen hota hai ke is looh par amal ho gaya.

Jo lafz ruh se niklta hai wo jism ban jaata hai,
mein jaanta hoon ye magar sun ke kaun maanta hai.

Meri zaban pe bhi mustafa (s.a.w) ka hi zikr hai,
mere muqaddar me bhi wo hi saath saath hai.`,
    createdAt: 1,
  },
  {
    id: "seed-2",
    title: "Kalam-e-Pak",
    text: `Madine ka safar jab hoga, karam hoga, nazar hoga,
Nabi ki qadmon ke saaye mein hi mera guzar hoga.

Mujhe maddah-e-rasool (s.a.w) hone ka jo nashaa milega,
har ik lafz mein unki hi sanah ug aayegi.

Wo hain jis ke baghair dil ka qaraar aana mohaal,
yeh jism to kya, is jaan ka bhi tikao na raha.`,
    createdAt: 2,
  },
];

export function loadNaats(): Naat[] {
  if (typeof window === "undefined") return SEED_NAATS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return SEED_NAATS;
    const parsed = JSON.parse(raw) as Naat[];
    if (!Array.isArray(parsed) || parsed.length === 0) return SEED_NAATS;
    return parsed;
  } catch {
    return SEED_NAATS;
  }
}

export function saveNaat(naat: Omit<Naat, "id" | "createdAt">): Naat[] {
  const list = loadNaats();
  const newNaat: Naat = {
    ...naat,
    id: `n-${Date.now()}`,
    createdAt: Date.now(),
  };
  const next = [newNaat, ...list];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export function deleteNaat(id: string): Naat[] {
  const next = loadNaats().filter((n) => n.id !== id);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export function downloadNaat(naat: Naat) {
  const content = `${naat.title}\n\n${naat.poet ? "شاعر: " + naat.poet + "\n" : ""}${
    naat.author ? "Add kiya: " + naat.author + "\n" : ""
  }${new Date(naat.createdAt).toLocaleDateString()}\n\n${naat.text}`;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${naat.title.replace(/[^\w\u0600-\u06FF\u0900-\u097F ]/g, "")}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
