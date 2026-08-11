"use client";

import React, { useState } from "react";
import {
  Search,
  BookOpen,
  Share2,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

// Masail & Hadith Data Structure
interface MasalaItem {
  id: string;
  source: "kanun_shariat" | "jannati_zewar" | "bukhari";
  sourceNameUrdu: string;
  category: string;
  headingUrdu: string;
  headingEng: string;
  arabic?: string;
  masalaDetail: string; // Full Detailed Masala / Hadith
  fazilat?: string;
  keywords: string[];
}

// Complete Authentic Islamic Database Sample
const ISLAMIC_DATABASE: MasalaItem[] = [
  // --- KANUN-E-SHARIAT MASAIL ---
  {
    id: "ks-1",
    source: "kanun_shariat",
    sourceNameUrdu: "قانونِ شریعت",
    category: "Taharat (طہارت اور پاکی)",
    headingUrdu: "پاک اور ناپاک پانی کا حکم اور غسل کا مسألہ",
    headingEng: "Paak aur Napak Pani & Gusl ke Masail",
    masalaDetail:
      "قانونِ شریعت: پانی دو قسم کا ہوتا ہے - قلیل (تھوڑا) اور کثیر (زیادہ)۔ اگر تھوڑے پانی میں کوئی نجاست گر جائے تو وہ فوراً ناپاک ہو جاتا ہے، چاہے رنگ اور بو بدلے یا نہ بدلے۔ غسل میں تین چیزیں فرض ہیں: (1) منہ بھر کر کلی کرنا، (2) ناک کی نرم ہڈی تک پانی پہنچانا، (3) تمام ظاہرِ بدن پر ایک بار پانی بہانا کہ ایک بال برابر بھی جگہ سوکھی نہ رہے۔",
    fazilat:
      "حدیث پاک: پاکی آدھا ایمان ہے۔ جو شخص اچھی طرح وضو یا غسل کرتا ہے اس کے تمام خطائیں جھڑ جاتی ہیں۔",
    keywords: ["paak", "napak", "pani", "gusl", "ghusl", "taharat", "paki", "wazu", "kanun shariat"],
  },
  {
    id: "ks-2",
    source: "kanun_shariat",
    sourceNameUrdu: "قانونِ شریعت",
    category: "Namaz (نماز کے مسائل)",
    headingUrdu: "نماز کے فرائض اور شرائط",
    headingEng: "Namaz ke Farayiz aur Sharait",
    masalaDetail:
      "قانونِ شریعت: نماز کے خارج میں 6 شرائط ہیں: (1) طہارت (بدن، کپڑے اور جگہ کا پاک ہونا)، (2) سترِ عورت (ناف سے گھٹنے تک ڈھانپنا)، (3) استقبالِ قبلہ، (4) وقت کا ہونا، (5) نیت کرنا، (6) تکبیرِ تحریمہ۔ نماز کے اندر 6 فرائض ہیں: تکبیرِ تحریمہ، قیام، قرات، رکوع، دونوں سجدے، اور قعدہ اخیرہ۔",
    fazilat:
      "حدیث پاک: قیامت کے دن سب سے پہلے نماز کا حساب لیا جائے گا۔ جس کی نماز درست ہوئی وہ کامیاب ہوا۔",
    keywords: ["namaz", "farz", "farayiz", "sharat", "qibla", "niyat", "kanun shariat"],
  },

  // --- JANNATI ZEWAR MASAIL ---
  {
    id: "jz-1",
    source: "jannati_zewar",
    sourceNameUrdu: "جنتی زیور",
    category: "Khawateen ke Masail (خواتین کے مخصوص مسائل)",
    headingUrdu: "عورتوں کے لیے حلال و حرام زیورات اور شرعی احکام",
    headingEng: "Khawateen ke Zewar aur Libas ke Ahkam",
    masalaDetail:
      "جنتی زیور: عورتوں کے لیے سونا اور چاندی پہننا حلال ہے، لیکن تانبہ، پیتل، لوہا اور گلٹ کے زیورات پہننا ناپائیدار اور مکروہِ تحریمی (منع) ہے۔ زکوۃ کا حکم: اگر عورت کے پاس ساڑھے سات تولہ سونا یا ساڑھے باون تولہ چاندی یا اس کی قیمت کا مال ہو تو اس پر زکوۃ فرض ہے۔",
    fazilat:
      "حدیث پاک: جو عورت اپنے شوہر کی اطاعت کرے اور نماز و روزے کی پابند رہے، وہ جنّت کے جس دروازے سے چاہے داخل ہو سکتی ہے۔",
    keywords: ["jannati zewar", "aurat", "khawateen", "zewar", "sona", "chandi", "zakath", "libas"],
  },
  {
    id: "jz-2",
    source: "jannati_zewar",
    sourceNameUrdu: "جنتی زیور",
    category: "Roza (روزہ اور صدقہ)",
    headingUrdu: "کن چیزوں سے روزہ ٹوٹتا ہے اور کن سے نہیں",
    headingEng: "Kin Cheezon se Roza Tootta Hai aur Kin se Nahi",
    masalaDetail:
      "جنتی زیور: بھول کر کھانے پینے یا جماع کرنے سے روزہ نہیں ٹوٹتا، چاہے کتنا ہی پیٹ بھر کر کھا لے۔ لیکن قصداً (جان بوجھ کر) ایک قطرہ بھی حلق سے نیچے اتارا تو روزہ ٹوٹ جائے گا اور قضا و کفارہ دونوں لازم ہوں گے۔ سرمہ لگانے، تیل لگانے یا عطر سونگھنے سے روزہ نہیں ٹوٹتا۔",
    fazilat:
      "حدیث پاک: روزے دار کے لیے دو خوشیاں ہیں: ایک افطار کے وقت اور دوسری اپنے رب سے ملاقات کے وقت۔",
    keywords: ["roza", "ramzan", "roza tootta hai", "jannati zewar", "iftar", "sehri"],
  },

  // --- SAHIH AL-BUKHARI HADITH ---
  {
    id: "sb-1",
    source: "bukhari",
    sourceNameUrdu: "صحیح البخاری",
    category: "Imaan (ایمان و اعمال)",
    headingUrdu: "اعمال کا دارومدار نیتوں پر ہے (حدیث 1)",
    headingEng: "Innamal A'malu Bin Niyyat (Bukhari Hadith 1)",
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    masalaDetail:
      "صحیح البخاری (حدیث 1): امیر المؤمنین عمر بن خطاب رضی اللہ عنہ سے روایت ہے کہ میں نے رسول اللہ صلی اللہ علیہ وسلم کو فرماتے ہوئے سنا: تمام اعمال کا دارومدار نیتوں پر ہے اور ہر شخص کو وہی ملے گا جس کی اس نے نیت کی۔ جس کی ہجرت اللہ اور اس کے رسول کے لیے ہو، اس کی ہجرت اللہ اور رسول ہی کے لیے شمار ہوگی۔",
    fazilat:
      "فائدہ: ہر نیک کام، نماز، روزے، صدقہ اور عام روزمرہ کے کاموں میں نیت کا صاف ہونا ضروری ہے۔",
    keywords: ["bukhari", "hadith", "niyat", "innal mal bin niyat", "sahih bukhari"],
  },
  {
    id: "sb-2",
    source: "bukhari",
    sourceNameUrdu: "صحیح البخاری",
    category: "Rizq & Tijarat (رزق کی برکت)",
    headingUrdu: "حلال روزی کمانے اور رشتہ داروں سے اچھا سلوک کرنے کی فضیلت",
    headingEng: "Rizq me Barakat aur Sila Rahmi (Bukhari Hadith)",
    arabic: "مَنْ سَرَّهُ أَنْ يُبْسَطَ لَهُ فِي رِزْقِهِ وَأَنْ يُنْسَأَ لَهُ فِي أَثَرِهِ فَلْيَصِلْ رَحِمَهُ",
    masalaDetail:
      "صحیح البخاری: حضرت انس بن مالک رضی اللہ عنہ سے روایت ہے کہ رسول اللہ صلی اللہ علیہ وسلم نے فرمایا: جو شخص یہ چاہتا ہو کہ اس کے رزق میں کشادگی (برکت) کی جائے اور اس کی عمر لمبی کی جائے، تو اسے چاہیے کہ وہ صلہ رحمی کرے (رشتہ داروں کے ساتھ اچھا سلوک کرے)۔",
    fazilat:
      "فضیلت: رشتہ داروں کے ساتھ حسنِ سلوک کرنے سے روزی اور عمر دونوں میں برکت ہوتی ہے۔",
    keywords: ["rizq", "rozi", "barakat", "hadith", "bukhari", "rishtedar", "sila rahmi"],
  },
];

export default function IslamicSearchApp() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Search Logic (Searches Keywords, Headings, and Details)
  const filteredData = ISLAMIC_DATABASE.filter((item) => {
    const matchesSource =
      selectedSource === "all" || item.source === selectedSource;

    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      term === "" ||
      item.headingUrdu.toLowerCase().includes(term) ||
      item.headingEng.toLowerCase().includes(term) ||
      item.masalaDetail.toLowerCase().includes(term) ||
      item.keywords.some((k) => k.toLowerCase().includes(term));

    return matchesSource && matchesSearch;
  });

  // Copy to Clipboard
  const handleCopy = (item: MasalaItem) => {
    const textToCopy = `${item.headingUrdu}\n\n${item.masalaDetail}\n\n${
      item.fazilat ? "Fazilat: " + item.fazilat : ""
    }\n[Source: ${item.sourceNameUrdu}]`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // WhatsApp Share
  const handleShare = (item: MasalaItem) => {
    const textToShare = encodeURIComponent(
      `📖 *${item.headingUrdu}*\n\n${item.masalaDetail}\n\n*Source:* ${item.sourceNameUrdu}`
    );
    window.open(`https://wa.me/?text=${textToShare}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-emerald-50 p-4 sm:p-8 font-sans">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Header */}
        <header className="rounded-3xl border border-emerald-500/20 bg-emerald-900/30 p-6 sm:p-8 text-center space-y-3 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="flex justify-center items-center gap-2 text-amber-300 font-semibold text-xs tracking-widest uppercase">
            <ShieldCheck size={16} /> Authentic Masail & Hadith Search Engine
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-r from-amber-200 via-emerald-200 to-teal-100 bg-clip-text text-transparent font-serif">
            قانونِ شریعت، جنتی زیور و صحیح البخاری
          </h1>

          <p className="text-xs sm:text-sm text-emerald-300/80 max-w-2xl mx-auto leading-relaxed">
            Har mas&apos;ale ka mukammal aur authentic jawab. Paak Napak, Gusl, Namaz, Roza, Zewar aur Ahadees ko ek click me khojein.
          </p>
        </header>

        {/* Big Search Bar */}
        <div className="relative max-w-3xl mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-6 h-6 text-amber-300" />
            <input
              type="text"
              placeholder="کچھ بھی تلاش کریں... (مثلاً: paak napak, gusl, namaz, bukhari)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl bg-slate-900 border-2 border-emerald-600/50 pl-14 pr-4 py-4 text-emerald-100 placeholder-emerald-500/70 text-base sm:text-lg outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 transition-all shadow-xl font-serif dir-rtl"
            />
          </div>

          {/* Quick Keyword Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-3 justify-center text-xs text-emerald-300/80">
            <span className="font-bold text-amber-300">Popular Searches:</span>
            {["paak napak", "gusl", "namaz", "roza", "zewar", "rizq"].map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchTerm(tag)}
                className="bg-emerald-950 border border-emerald-800/60 hover:border-amber-400 px-3 py-1 rounded-full text-emerald-200 transition"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Source Filter Tabs */}
        <div className="flex justify-center gap-2 sm:gap-4 border-b border-emerald-800/40 pb-4 overflow-x-auto custom-scrollbar">
          {[
            { id: "all", name: "Tamam Kitabein (تمام)" },
            { id: "kanun_shariat", name: "قانونِ شریعت" },
            { id: "jannati_zewar", name: "جنتی زیور" },
            { id: "bukhari", name: "صحیح البخاری" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedSource(tab.id)}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition active:scale-95 ${
                selectedSource === tab.id
                  ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20"
                  : "bg-slate-900 border border-emerald-800/50 text-emerald-300 hover:bg-emerald-800/40"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="text-xs text-emerald-400/70 font-semibold px-2">
          Kul Hasil Shudaha Masail: <span className="text-amber-300 font-bold">{filteredData.length}</span>
        </div>

        {/* Masail Cards List */}
        <div className="space-y-6">
          {filteredData.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border border-dashed border-emerald-800/50 bg-slate-900/50 space-y-3">
              <BookOpen size={40} className="mx-auto text-emerald-500/40" />
              <h3 className="text-lg font-bold text-emerald-200">Koi Mas&apos;ala Nahi Mila</h3>
              <p className="text-xs text-emerald-400/60">
                Koshish karein ki dusra word type karein ya &ldquo;Tamam Kitabein&rdquo; tab select karein.
              </p>
            </div>
          ) : (
            filteredData.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border border-emerald-500/20 bg-emerald-950/30 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-4 hover:border-amber-400/40 transition duration-300 relative"
              >
                {/* Top Badge Info */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800/40 pb-3">
                  <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-300">
                    📖 {item.sourceNameUrdu}
                  </span>
                  <span className="text-xs text-emerald-300/70 font-medium">
                    Category: {item.category}
                  </span>
                </div>

                {/* Heading */}
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-amber-200 text-right dir-rtl leading-snug">
                  {item.headingUrdu}
                </h2>

                {/* Arabic Text (If Available) */}
                {item.arabic && (
                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-emerald-800/40 text-center font-serif text-xl text-emerald-200 dir-rtl leading-loose">
                    {item.arabic}
                  </div>
                )}

                {/* Full Detailed Masala Body */}
                <div className="text-emerald-100 text-base sm:text-lg leading-relaxed font-serif text-right dir-rtl bg-slate-900/40 p-4 rounded-2xl border border-emerald-900/50">
                  {item.masalaDetail}
                </div>

                {/* Fazilat Section */}
                {item.fazilat && (
                  <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs sm:text-sm font-serif flex items-start gap-2">
                    <Sparkles size={18} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>{item.fazilat}</div>
                  </div>
                )}

                {/* Bottom Actions: Copy & Share */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleCopy(item)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-emerald-700/40 hover:bg-emerald-800/40 text-emerald-200 text-xs font-semibold transition"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check size={14} className="text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy Mas&apos;ala
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleShare(item)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-md"
                  >
                    <Share2 size={14} /> WhatsApp
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

      </div>
    </main>
  );
}