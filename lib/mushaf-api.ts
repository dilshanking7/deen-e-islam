export const TOTAL_PAGES = 604;

export function getMushafPage(page: number) {
  return `/quran/${page.toString().padStart(3, "0")}.png`;
}