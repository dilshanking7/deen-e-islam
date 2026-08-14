"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100 px-5 py-8">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow ring-1 ring-emerald-100"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <article className="mt-6 rounded-3xl bg-white p-7 shadow-xl ring-1 ring-emerald-50">
          <h1 className="text-3xl font-extrabold text-emerald-800">Privacy Policy</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: 14 August 2026</p>

          <div className="mt-6 space-y-5 text-sm leading-7 text-gray-700">
            <p>
              Islaam-E-Deen uses account, profile, language and location data only to run app features such as login, personalized greeting, prayer times, Qibla and community features.
            </p>
            <p>
              Location is requested with user permission. The app stores the last known coordinates on the device so prayer times can still work with limited or no internet.
            </p>
            <p>
              Login is handled through Firebase Authentication. Your password is not stored inside this app code. Profile data may be stored in Firebase/Firestore for your account features.
            </p>
            <p>
              Quran pages, bookmarks, last-read progress, selected language, theme and prayer settings may be saved on the device for offline use and a smoother experience.
            </p>
            <p>
              The app may contact Islamic data APIs for Quran translation and prayer timings when internet is available. Offline mode uses cached data already saved on the device.
            </p>
            <p>
              Users can update profile details from the profile/settings pages. For account deletion or data removal, contact the app owner or add a dedicated delete-account option before public release.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}

