import { auth, db } from "./firebase";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteField,
} from "firebase/firestore";

export interface BookmarkData {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  createdAt: number;
}

const COLLECTION = "bookmarks";

export async function addBookmark(
  surahNumber: number,
  surahName: string,
  ayahNumber: number
) {
  const user = auth.currentUser;

  if (!user) return;

  const ref = doc(db, COLLECTION, user.uid);

  const snap = await getDoc(ref);

  const bookmark: BookmarkData = {
    surahNumber,
    surahName,
    ayahNumber,
    createdAt: Date.now(),
  };

  if (!snap.exists()) {
    await setDoc(ref, {
      [`${surahNumber}_${ayahNumber}`]: bookmark,
    });

    return;
  }

  await updateDoc(ref, {
    [`${surahNumber}_${ayahNumber}`]: bookmark,
  });
}

export async function removeBookmark(
  surahNumber: number,
  ayahNumber: number
) {
  const user = auth.currentUser;

  if (!user) return;

  await updateDoc(
    doc(db, COLLECTION, user.uid),
    {
      [`${surahNumber}_${ayahNumber}`]: deleteField(),
    }
  );
}

export async function getBookmarks() {
  const user = auth.currentUser;

  if (!user) return [];

  const snap = await getDoc(
    doc(db, COLLECTION, user.uid)
  );

  if (!snap.exists()) return [];

  const data = snap.data();

  return Object.values(data) as BookmarkData[];
}

export async function isBookmarked(
  surahNumber: number,
  ayahNumber: number
) {
  const user = auth.currentUser;

  if (!user) return false;

  const snap = await getDoc(
    doc(db, COLLECTION, user.uid)
  );

  if (!snap.exists()) return false;

  const data = snap.data();

  return !!data[`${surahNumber}_${ayahNumber}`];
}

export async function toggleBookmark(
  surahNumber: number,
  surahName: string,
  ayahNumber: number
) {
  const bookmarked = await isBookmarked(
    surahNumber,
    ayahNumber
  );

  if (bookmarked) {
    await removeBookmark(
      surahNumber,
      ayahNumber
    );

    return false;
  }

  await addBookmark(
    surahNumber,
    surahName,
    ayahNumber
  );

  return true;
}