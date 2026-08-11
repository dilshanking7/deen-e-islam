import axios from "axios";

const api = axios.create({
  baseURL: "https://api.alquran.cloud/v1",
  timeout: 10000,
});

export interface SurahSummary {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  audio: string;
}

export async function getSurahs(): Promise<SurahSummary[]> {
  const { data } = await api.get("/surah");

  return data.data.map((surah: SurahSummary) => ({
    ...surah,

    audio:
      `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surah.number}.mp3`,
  }));
}

export async function getSurah(number: number) {
  const { data } = await api.get(`/surah/${number}`);

  return data.data;
}

export async function getTranslation(number: number) {
  const { data } = await api.get(
    `/surah/${number}/en.asad`
  );

  return data.data;
}

export async function getAudio(number: number) {
  return `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${number}.mp3`;
}