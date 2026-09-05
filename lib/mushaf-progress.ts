import { auth, db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { TOTAL_PAGES } from "./mushaf-api";

const COLLECTION = "mushaf_progress";
const LOCAL_KEY = "last-mushaf-page";

function clamp(page: number): number {
  if (!Number.isFinite(page)) return 1;
  return Math.max(1, Math.min(TOTAL_PAGES, Math.round(page)));
}

export function getLocalPage(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const page = Number(raw);
    return Number.isFinite(page) && page >= 1 && page <= TOTAL_PAGES ? page : null;
  } catch {
    return null;
  }
}

export function setLocalPage(page: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_KEY, String(clamp(page)));
  } catch {}
}

export async function saveMushafProgress(page: number) {
  const safePage = clamp(page);
  setLocalPage(safePage);
  const user = auth.currentUser;
  if (!user) return;
  try {
    await setDoc(
      doc(db, COLLECTION, user.uid),
      { page: safePage, updatedAt: Date.now() },
      { merge: true }
    );
  } catch {}
}

export async function getMushafProgress(): Promise<number | null> {
  const local = getLocalPage();
  const user = auth.currentUser;
  if (!user) return local;
  try {
    const snap = await getDoc(doc(db, COLLECTION, user.uid));
    if (snap.exists()) {
      const page = snap.data().page;
      if (typeof page === "number" && page >= 1 && page <= TOTAL_PAGES) {
        setLocalPage(page);
        return page;
      }
    }
  } catch {}
  return local;
}