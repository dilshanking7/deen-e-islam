import { auth, db } from "./firebase";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

export interface LastReadData {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  updatedAt?: unknown;
}

const COLLECTION = "last_read";

export async function saveLastRead(
  surahNumber: number,
  surahName: string,
  ayahNumber: number
) {
  const user = auth.currentUser;

  if (!user) return;

  await setDoc(
    doc(db, COLLECTION, user.uid),
    {
      uid: user.uid,
      surahNumber,
      surahName,
      ayahNumber,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}

export async function getLastRead(): Promise<LastReadData | null> {
  const user = auth.currentUser;

  if (!user) return null;

  const snap = await getDoc(
    doc(db, COLLECTION, user.uid)
  );

  if (!snap.exists()) return null;

  return snap.data() as LastReadData;
}

export async function clearLastRead() {
  const user = auth.currentUser;

  if (!user) return;

  await setDoc(
    doc(db, COLLECTION, user.uid),
    {},
    {
      merge: false,
    }
  );
}