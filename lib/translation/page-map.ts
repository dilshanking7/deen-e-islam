export interface PageSurahMapping {
  surah: number;
  startAyah: number;
  endAyah: number;
}

export interface PageAyahMap {
  page: number;
  surahs: PageSurahMapping[];
}