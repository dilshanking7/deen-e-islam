import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  signOut,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

import { auth } from "./firebase";
import { ensureUserProfile } from "./firestore";

async function keepUserSignedIn() {
  if (typeof window === "undefined") return;
  await setPersistence(auth, browserLocalPersistence);
}

export async function registerUser(
  email: string,
  password: string
) {
  await keepUserSignedIn();

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  // Send verification email
  await sendEmailVerification(userCredential.user);

  return userCredential.user;
}

export async function loginUser(
  email: string,
  password: string
) {
  await keepUserSignedIn();

  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return userCredential.user;
}

export async function loginWithGoogle() {
  await keepUserSignedIn();

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  // Android WebView app me popup block hota hai, redirect se login hota hai.
  // WebView (MainActivity.kt) user-agent me "IslaamEDeenChrome" set karta hai.
  const isInApp =
    typeof navigator !== "undefined" &&
    /IslaamEDeenChrome/i.test(navigator.userAgent);

  if (isInApp) {
    await signInWithRedirect(auth, provider);
    return null; // redirect ke baad completeGoogleRedirect() handle karta hai
  }

  const userCredential = await signInWithPopup(auth, provider);
  await ensureUserProfile(userCredential.user);
  return userCredential.user;
}

// WebView app me redirect login complete karne ke liye (app start par call karo)
export async function completeGoogleRedirect(): Promise<boolean> {
  const result = await getRedirectResult(auth);
  if (result?.user) {
    await ensureUserProfile(result.user);
    return true;
  }
  return false;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error("No signed-in user");
  }
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}
