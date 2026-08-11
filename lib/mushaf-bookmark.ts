import { auth, db } from "./firebase";

import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

const COLLECTION = "mushaf_bookmarks";

export async function saveBookmark(page: number) {
  const user = auth.currentUser;

  if (!user) return;

  await setDoc(
    doc(db, COLLECTION, user.uid),
    {
      page,
      updatedAt: Date.now(),
    }
  );
}

export async function getBookmark() {
  const user = auth.currentUser;

  if (!user) return 1;

  const snap = await getDoc(
    doc(db, COLLECTION, user.uid)
  );

  if (!snap.exists()) return 1;

  return snap.data().page ?? 1;
}