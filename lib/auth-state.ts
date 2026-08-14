"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "./firebase";

export function waitForAuthUser(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

