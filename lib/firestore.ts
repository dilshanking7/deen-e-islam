import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  collection,
  where,
  getDocs,
  limit,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import type { User } from "firebase/auth";

import { db } from "./firebase";

export interface UserProfile {
  fullName: string;
  username: string;
  email: string;
  language?: string;
  country?: string;
  state?: string;
  district?: string;
  city?: string;
  pincode?: string;
  religion?: string;
  sect?: string;
  bio?: string;
  photoURL?: string;
  completedOnboarding?: boolean;
  following?: string[];
  followers?: string[];
}

export async function createUserProfile(
  uid: string,
  data: UserProfile
) {
  await setDoc(doc(db, "users", uid), data);
}

export async function getUserProfile(uid: string) {
  const docRef = doc(db, "users", uid);

  const snap = await getDoc(docRef);

  if (!snap.exists()) return null;

  return snap.data() as UserProfile;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
) {
  await updateDoc(doc(db, "users", uid), data);
}

export async function findUserByUsername(username: string) {
  const usersRef = collection(db, "users");

  const q = query(
    usersRef,
    where("username", "==", username),
    limit(1)
  );

  const snap = await getDocs(q);

  if (snap.empty) return null;

  const userDoc = snap.docs[0];

  return {
    uid: userDoc.id,
    ...(userDoc.data() as UserProfile),
  };
}

export async function ensureUserProfile(user: User) {
  const existing = await getUserProfile(user.uid);
  if (existing) {
    if (!existing.email && user.email) {
      await updateDoc(doc(db, "users", user.uid), { email: user.email });
    }
    return existing;
  }

  const username = user.email
    ? user.email.split("@")[0].replace(/[^a-zA-Z0-9_.]/g, "").slice(0, 20) ||
      `user_${user.uid.slice(0, 6)}`
    : `user_${user.uid.slice(0, 6)}`;

  const profile: UserProfile = {
    fullName: user.displayName || username,
    username,
    email: user.email || "",
    language: "ur",
    completedOnboarding: true,
  };

  await setDoc(doc(db, "users", user.uid), profile);
  return profile;
}

export interface PublicUser extends UserProfile {
  uid: string;
}

export async function getAllUsers(): Promise<PublicUser[]> {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as UserProfile) }));
}

export async function followUser(uid: string, targetUid: string) {
  await Promise.all([
    updateDoc(doc(db, "users", uid), {
      following: arrayUnion(targetUid),
    }),
    updateDoc(doc(db, "users", targetUid), {
      followers: arrayUnion(uid),
    }),
  ]);
}

export async function unfollowUser(uid: string, targetUid: string) {
  await Promise.all([
    updateDoc(doc(db, "users", uid), {
      following: arrayRemove(targetUid),
    }),
    updateDoc(doc(db, "users", targetUid), {
      followers: arrayRemove(uid),
    }),
  ]);
}

export function getConversationId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join("__");
}