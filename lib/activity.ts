import { doc, getDoc, setDoc, increment, updateDoc, type FieldValue } from "firebase/firestore";
import { auth, db } from "./firebase";

export interface ActivityStat {
  key: string;
  count: number;
}

const LOCAL_KEY = "islaam-activity";

export const SECTION_LABELS: Record<string, string> = {
  home: "Home",
  quran: "Quran",
  mushaf: "Quran Mushaf",
  translation: "Quran Tarjuma",
  bookmarks: "Bookmarks",
  prayer: "Prayer Times",
  books: "Kitabein",
  library: "Library",
  dua: "Duain",
  hadith: "Hadith",
  names: "99 Names",
  tasbeeh: "Tasbeeh",
  community: "Community",
  naat: "Naat",
  prophets: "Anbiya",
  history: "History",
  qibla: "Qibla",
  calendar: "Calendar",
  notifications: "Notifications",
  assistant: "Assistant",
  profile: "Profile",
  setting: "Settings",
};

export const SECTION_PATHS: Record<string, { label: string; icon: string; path: string }> = {
  quran: { label: "Quran", icon: "📖", path: "/quran" },
  mushaf: { label: "Quran Mushaf", icon: "🕌", path: "/quran/mushaf" },
  translation: { label: "Quran Tarjuma", icon: "🌍", path: "/quran/translation" },
  bookmarks: { label: "Quran Bookmarks", icon: "🔖", path: "/quran/bookmarks" },
  prayer: { label: "Namaz ke Waqt", icon: "🕌", path: "/prayer" },
  books: { label: "Kitabein", icon: "📕", path: "/books" },
  library: { label: "Library / PDF", icon: "📚", path: "/library" },
  dua: { label: "Masnoon Duain", icon: "🤲", path: "/dua" },
  hadith: { label: "Hadith", icon: "📚", path: "/hadith" },
  names: { label: "99 Names", icon: "📿", path: "/names" },
  tasbeeh: { label: "Tasbeeh Counter", icon: "📿", path: "/tasbeeh" },
  community: { label: "Community", icon: "👥", path: "/community" },
  naat: { label: "Naat Sharif", icon: "🎵", path: "/naat" },
  prophets: { label: "Anbiya ki Kahanian", icon: "🕊️", path: "/prophets" },
  history: { label: "Islami Tareekh", icon: "🕋", path: "/history" },
  qibla: { label: "Qibla Direction", icon: "🧭", path: "/qibla" },
  calendar: { label: "Islami Calendar", icon: "🗓️", path: "/calendar" },
  notifications: { label: "Notifications", icon: "🔔", path: "/notifications" },
};

function readLocal(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}") as Record<string, number>;
  } catch {
    return {};
  }
}

function writeLocal(stats: Record<string, number>) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(stats));
  } catch {}
}

const THROTTLE_KEY = "islaam-activity-flushed";

export function trackActivity(key: string) {
  const stats = readLocal();
  stats[key] = (stats[key] || 0) + 1;
  writeLocal(stats);

  try {
    const user = auth.currentUser;
    if (!user) return;
    const last = Number(sessionStorage.getItem(THROTTLE_KEY) || "0");
    const now = Date.now();
    if (now - last < 15000) return;
    sessionStorage.setItem(THROTTLE_KEY, String(now));
    syncToFirestore(stats);
  } catch {
    /* firestore sync is best-effort */
  }
}

export function getActivityStats(): ActivityStat[] {
  const stats = readLocal();
  return Object.entries(stats)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

export function getRecommendations(limitN = 4) {
  const stats = getActivityStats();
  const picks: ActivityStat[] = [];
  const seen = new Set<string>();

  stats.forEach((s) => {
    if (seen.has(s.key)) return;
    if (SECTION_PATHS[s.key]) picks.push(s);
  });

  // Fallback: fill with defaults so the row is never empty
  const defaults = ["quran", "prayer", "dua", "hadith", "books", "names"];
  defaults.forEach((d) => {
    if (!seen.has(d)) seen.add(d);
  });

  picks.sort((a, b) => b.count - a.count);
  const result: { label: string; icon: string; path: string; count: number }[] = [];
  const chose = new Set<string>();

  stats.forEach((s) => {
    if (result.length >= limitN) return;
    const meta = SECTION_PATHS[s.key];
    if (meta && !chose.has(s.key)) {
      chose.add(s.key);
      result.push({ ...meta, count: s.count });
    }
  });
  defaults.forEach((d) => {
    if (result.length >= limitN) return;
    const meta = SECTION_PATHS[d];
    if (meta && !chose.has(d)) {
      chose.add(d);
      result.push({ ...meta, count: 0 });
    }
  });

  return result.slice(0, limitN);
}

async function syncToFirestore(stats: Record<string, number>) {
  const user = auth.currentUser;
  if (!user) return;
  const ref = doc(db, "activity", user.uid);
  const snap = await getDoc(ref);
  const payload: Record<string, number> = {};
  Object.entries(stats).forEach(([k, v]) => {
    payload[k] = v;
  });
  if (!snap.exists()) {
    await setDoc(ref, payload).catch(() => {});
  } else {
    const updates: Record<string, number> = {};
    Object.entries(stats).forEach(([k, v]) => {
      const remote = (snap.data()?.[k] as number) || 0;
      const diff = v - remote;
      if (diff > 0) updates[k] = diff;
    });
    if (Object.keys(updates).length) {
      const inc: Record<string, number | FieldValue> = {};
      Object.keys(updates).forEach((k) => {
        inc[k] = increment(updates[k]);
      });
      await updateDoc(ref, inc).catch(() => {});
    }
  }
}

export function sectionFromPath(pathname: string): string | null {
  const clean = pathname.split("/").filter(Boolean);
  const main = clean[0] || "home";
  if (mapMainToSection[main]) return mapMainToSection[main];
  return null;
}

const mapMainToSection: Record<string, string> = {
  quran: "quran",
  mushaf: "mushaf",
  prayer: "prayer",
  books: "books",
  library: "library",
  dua: "dua",
  hadith: "hadith",
  names: "names",
  tasbeeh: "tasbeeh",
  community: "community",
  naat: "naat",
  prophets: "prophets",
  history: "history",
  qibla: "qibla",
  calendar: "calendar",
  assistant: "assistant",
};

const readingRoutes = ["/quran/mushaf", "/quran/read", "/quran/translation", "/pdf"];

export function trackCurrentPath(pathname: string) {
  if (pathname === "/login" || pathname === "/register" || pathname === "/") return;
  if (readingRoutes.some((p) => pathname.startsWith(p))) return;
  const section = sectionFromPath(pathname);
  if (section) trackActivity(section);
}