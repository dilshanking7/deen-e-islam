export interface SurahItem {
  number: number;
  englishName: string;
  arabicName: string;
  page: number;
}

export const SURAHS: SurahItem[] = [
  { number: 1, englishName: "Al-Fatihah", arabicName: "الفاتحة", page: 1 },
  { number: 2, englishName: "Al-Baqarah", arabicName: "البقرة", page: 2 },
  { number: 3, englishName: "Aal-Imran", arabicName: "آل عمران", page: 50 },
  { number: 4, englishName: "An-Nisa", arabicName: "النساء", page: 77 },
  { number: 5, englishName: "Al-Ma'idah", arabicName: "المائدة", page: 106 },
  { number: 6, englishName: "Al-An'am", arabicName: "الأنعام", page: 128 },
  { number: 7, englishName: "Al-A'raf", arabicName: "الأعراف", page: 151 },
  { number: 8, englishName: "Al-Anfal", arabicName: "الأنفال", page: 177 },
  { number: 9, englishName: "At-Tawbah", arabicName: "التوبة", page: 187 },
  { number: 10, englishName: "Yunus", arabicName: "يونس", page: 208 },
];