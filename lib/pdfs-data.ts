export interface PdfFile {
  id: string;
  file: string;
  title: string;
  subtitle: string;
  icon: string;
}

export const PDF_FILES: PdfFile[] = [
  {
    id: "qanun-shariat",
    file: "/pdfs/qanun-e-shariyat.pdf",
    title: "Qanun-e-Shariyat",
    subtitle: "قانونِ شریعت — Shariah rulings (Urdu)",
    icon: "📜",
  },
  {
    id: "qanun-shariat-new",
    file: "/pdfs/qanun-e-shariyat-new.pdf",
    title: "Qanun-e-Shariyat (New Edition)",
    subtitle: "قانونِ شریعت — New edition (Urdu)",
    icon: "📜",
  },
  {
    id: "jannati-zevar",
    file: "/pdfs/jannati-zevar.pdf",
    title: "Jannati Zewar",
    subtitle: "جنت کا زیور — Maulana Ashraf Ali Thanwi (Urdu)",
    icon: "💎",
  },
  {
    id: "jannati-zevar-hindi",
    file: "/pdfs/jannati-zevar-hindi.pdf",
    title: "Jannati Zevar (Hindi)",
    subtitle: "जन्नती ज़ेवर — हिन्दी अनुवाद",
    icon: "💎",
  },
  {
    id: "essential-duas",
    file: "/pdfs/essential-duas.pdf",
    title: "Essential Duas in the Life of a Muslim",
    subtitle: "Muslim ki zindagi ki zaroori duain",
    icon: "🤲",
  },
];
