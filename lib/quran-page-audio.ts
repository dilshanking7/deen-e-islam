"use client";

import { PAGE_AYAH_MAP } from "./page-map-data";

const RECITER = "AbdulSamad_64kbps_QuranExplorer.Com";

export function getAyahAudioUrl(surah: number, ayah: number) {
  return `/quran/audio/${String(surah).padStart(3, "0")}${String(ayah).padStart(3, "0")}.mp3`;
}

export function getOnlineAyahAudioUrl(surah: number, ayah: number) {
  return `https://everyayah.com/data/${RECITER}/${String(surah).padStart(3, "0")}${String(ayah).padStart(3, "0")}.mp3`;
}

export function getPageAyahs(page: number) {
  const mapping = PAGE_AYAH_MAP.find((item) => item.page === page);
  if (!mapping) return [];
  return mapping.surahs.flatMap((item) =>
    Array.from({ length: item.endAyah - item.startAyah + 1 }, (_, index) => ({
      surah: item.surah,
      ayah: item.startAyah + index,
    }))
  );
}

export async function playAyahSequence(
  ayahs: { surah: number; ayah: number }[],
  onChange?: (label: string) => void
) {
  for (const item of ayahs) {
    onChange?.(`${item.surah}:${item.ayah}`);
    await playOne(getAyahAudioUrl(item.surah, item.ayah)).catch(() =>
      playOne(getOnlineAyahAudioUrl(item.surah, item.ayah)).catch(() => {})
    );
  }
}

function playOne(src: string) {
  return new Promise<void>((resolve, reject) => {
    const audio = new Audio(src);
    audio.onended = () => resolve();
    audio.onerror = () => reject();
    audio.play().catch(reject);
  });
}
