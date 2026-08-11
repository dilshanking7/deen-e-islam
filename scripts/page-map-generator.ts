import fs from "fs";
import path from "path";

const API = "https://api.alquran.cloud/v1/page";

async function getPage(page: number) {
  const res = await fetch(`${API}/${page}/quran-uthmani`);

  if (!res.ok) {
    throw new Error(`Page ${page} failed`);
  }

  const json = await res.json();

  return json.data.ayahs;
}

interface SurahAyahMap {
  page: number;
  surahs: { surah: number; startAyah: number; endAyah: number }[];
}

async function generate() {
  const pages: SurahAyahMap[] = [];

  for (let page = 1; page <= 604; page++) {
    console.log(`Loading Page ${page}...`);

    const ayahs = await getPage(page);

    const map: Record<
      number,
      {
        startAyah: number;
        endAyah: number;
      }
    > = {};

    for (const ayah of ayahs) {
      const surah = ayah.surah.number;
      const ayahNo = ayah.numberInSurah;

      if (!map[surah]) {
        map[surah] = {
          startAyah: ayahNo,
          endAyah: ayahNo,
        };
      } else {
        map[surah].endAyah = ayahNo;
      }
    }

    pages.push({
      page,
      surahs: Object.entries(map).map(([surah, value]) => ({
        surah: Number(surah),
        startAyah: value.startAyah,
        endAyah: value.endAyah,
      })),
    });
  }

  const output =
`import { PageAyahMap } from "./page-map";

export const PAGE_AYAH_MAP: PageAyahMap[] =
${JSON.stringify(pages, null, 2)};
`;

  fs.writeFileSync(
    path.join(process.cwd(), "lib", "page-map-data.ts"),
    output,
    "utf8"
  );

  console.log("✅ page-map-data.ts Generated Successfully");
}

generate();