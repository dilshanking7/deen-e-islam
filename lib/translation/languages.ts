export const LANGUAGES = [
  {
    code: "ur",
    name: "Urdu",
  },
  {
    code: "en",
    name: "English",
  },
  {
    code: "hi",
    name: "Hindi",
  },
];

export type LanguageCode =
  | "ur"
  | "en"
  | "hi";

export const DEFAULT_LANGUAGE: LanguageCode = "ur";