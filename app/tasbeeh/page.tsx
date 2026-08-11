"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  Save,
  Volume2,
  VolumeX,
  History,
  CheckCircle2,
  Trash2,
  BookOpen,
} from "lucide-react";

interface ZikrItem {
  id: string;
  category: "namaz" | "daily" | "morning_evening";
  arabic: string;
  transliteration: string;
  urduTranslation: string;
  defaultTarget: number;
  benefit: string;
}

const PRESET_AZKAR: ZikrItem[] = [
  {
    id: "subhanallah",
    category: "namaz",
    arabic: "سُبْحَانَ اللَّهِ",
    transliteration: "Subhan Allah",
    urduTranslation: "الله پاک و بے عیب ہے",
    defaultTarget: 33,
    benefit: "Jannat me darakht lagaya jata hai aur gunah maaf hote hain.",
  },
  {
    id: "alhamdulillah",
    category: "namaz",
    arabic: "الْحَمْدُ لِلَّهِ",
    transliteration: "Alhamdulillah",
    urduTranslation: "تمام تعریفیں اللہ ہی کے لیے ہیں",
    defaultTarget: 33,
    benefit: "Meezan (neekiyon ka tarazu) ko bhar deta hai.",
  },
  {
    id: "allahuakbar",
    category: "namaz",
    arabic: "اللَّهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    urduTranslation: "الله سب سے بڑا ہے",
    defaultTarget: 34,
    benefit: "Zikr ki wajah se dil ko sukoon milta hai.",
  },
  {
    id: "astaghfirullah",
    category: "daily",
    arabic: "أَسْتَغْفِرُ اللَّهَ",
    transliteration: "Astaghfirullah",
    urduTranslation: "میں اللہ سے معافی مانگتا ہوں",
    defaultTarget: 100,
    benefit: "Rizq me barakat aur ghamon se nijat milti hai.",
  },
  {
    id: "darood",
    category: "daily",
    arabic: "اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ",
    transliteration: "Allahumma Salli Ala Muhammad",
    urduTranslation: "اے اللہ! محمد (صلی اللہ علیہ وسلم) پر رحمت نازل فرما",
    defaultTarget: 100,
    benefit: "10 rehmatein nazil hoti hain aur darjat buland hote hain.",
  },
  {
    id: "la_ilaha_illallah",
    category: "daily",
    arabic: "لَا إِلٰهَ إِلَّا اللَّهُ",
    transliteration: "La Ilaha Illallah",
    urduTranslation: "اللہ کے سوا کوئی معبود نہیں",
    defaultTarget: 100,
    benefit: "Afzal tareen zikr hai.",
  },
  {
    id: "eating_before",
    category: "daily",
    arabic: "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ",
    transliteration: "Bismillah ir-Rahman ir-Rahim",
    urduTranslation: "کھانے سے پہلے کی دعا - اللہ کے نام سے شروع",
    defaultTarget: 1,
    benefit: "Khane me Shaitan ki shirkath nahi hoti aur barakat hoti hai.",
  },
  {
    id: "eating_after",
    category: "daily",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
    transliteration: "Alhamdulillahil-ladhi at'amana wa saqana wa ja'alana muslimin",
    urduTranslation: "کھانے کے بعد کی دعا - تمام تعریفیں اس اللہ کے لیے ہیں جس نے ہمیں کھلایا اور پلایا",
    defaultTarget: 1,
    benefit: "Khana hazam aur shukr guzari ka sawab milta hai.",
  },
  {
    id: "sleeping",
    category: "daily",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismika Allahumma amutu wa ahya",
    urduTranslation: "سوتے وقت کی دعا - اے اللہ! میں تیرے نام کے ساتھ مرتا ہوں اور جیتا ہوں",
    defaultTarget: 1,
    benefit: "Raat bhar amana wa hifazat rehti hai.",
  },
  {
    id: "waking_up",
    category: "daily",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration: "Alhamdulillahil-ladhi ahyana ba'da ma amatana wa ilaihin-nushur",
    urduTranslation: "سو کر اٹھنے کی دعا - تمام تعریفیں اس اللہ کے لیے ہیں جس نے ہمیں مارنے کے بعد زندہ کیا",
    defaultTarget: 1,
    benefit: "Subah ka aagaz shukr ke sath hota hai.",
  },
];

interface HistoryRecord {
  id: string;
  name: string;
  count: number;
  date: string;
}

export default function DigitalTasbih() {
  const [selectedZikr, setSelectedZikr] = useState<ZikrItem>(PRESET_AZKAR[0]);
  const [count, setCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(PRESET_AZKAR[0].defaultTarget);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrateEnabled] = useState<boolean>(true);
  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("tasbih_history");
      return saved ? (JSON.parse(saved) as HistoryRecord[]) : [];
    } catch {
      return [];
    }
  });
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Play Sound Helper
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch {
      // Audio fallback
    }
  };

  // Trigger Count
  const handleIncrement = () => {
    const newCount = count + 1;
    setCount(newCount);
    playClickSound();

    if (vibrateEnabled && navigator.vibrate) {
      navigator.vibrate(40);
    }
  };

  // Reset Current Tasbih
  const handleReset = () => {
    setCount(0);
  };

  // Change Zikr
  const handleSelectZikr = (zikr: ZikrItem) => {
    setSelectedZikr(zikr);
    setCount(0);
    setTarget(zikr.defaultTarget);
  };

  // Save Progress to History
  const handleSaveProgress = () => {
    if (count === 0) return;

    const newRecord: HistoryRecord = {
      id: Date.now().toString(),
      name: selectedZikr.transliteration + ` (${selectedZikr.arabic})`,
      count: count,
      date: new Date().toLocaleString(),
    };

    const updatedHistory = [newRecord, ...history];
    setHistory(updatedHistory);
    localStorage.setItem("tasbih_history", JSON.stringify(updatedHistory));

    alert(`Saved ${count} counts of ${selectedZikr.transliteration}!`);
  };

  // Clear History
  const handleClearHistory = () => {
    if (confirm("Kya aap saari history delete karna chahte hain?")) {
      setHistory([]);
      localStorage.removeItem("tasbih_history");
    }
  };

  const progressPercentage = Math.min((count / target) * 100, 100);

  return (
    <main className="min-h-screen bg-slate-950 text-emerald-50 p-4 sm:p-8 font-sans flex flex-col justify-between">
      <div className="mx-auto max-w-xl w-full space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-emerald-800/40 pb-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              ڈیجیٹل تسبیح
            </h1>
            <p className="text-xs text-emerald-400/70">Digital Tasbih & Daily Azkar</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-xl bg-emerald-900/40 border border-emerald-700/30 text-emerald-300 hover:bg-emerald-800/50 transition"
              title="Toggle Sound"
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            {/* View History Button */}
            <button
              onClick={() => setShowHistoryModal(true)}
              className="p-2.5 rounded-xl bg-emerald-900/40 border border-emerald-700/30 text-emerald-300 hover:bg-emerald-800/50 transition flex items-center gap-1.5 text-xs font-semibold"
            >
              <History size={18} />
              <span>History</span>
            </button>
          </div>
        </header>

        {/* Zikr Selection Dropdown / Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
            <BookOpen size={14} /> Select Dua / Zikr (ذکر منتخب کریں):
          </label>
          <select
            value={selectedZikr.id}
            onChange={(e) => {
              const z = PRESET_AZKAR.find((item) => item.id === e.target.value);
              if (z) handleSelectZikr(z);
            }}
            className="w-full rounded-2xl bg-slate-900 border border-emerald-700/40 p-3.5 text-emerald-100 outline-none focus:border-emerald-400 font-serif text-base"
          >
            {PRESET_AZKAR.map((z) => (
              <option key={z.id} value={z.id} className="bg-slate-900">
                {z.arabic} — {z.transliteration}
              </option>
            ))}
          </select>
        </div>

        {/* Display Card */}
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-950/30 p-6 text-center space-y-4 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="text-3xl sm:text-4xl font-bold font-serif text-amber-200 dir-rtl leading-relaxed">
            {selectedZikr.arabic}
          </div>
          <div className="text-sm font-semibold text-emerald-300">
            {selectedZikr.transliteration}
          </div>
          <div className="text-xs text-emerald-200/80 font-serif">
            {selectedZikr.urduTranslation}
          </div>
          <p className="text-[11px] text-amber-300/70 bg-amber-950/20 py-1.5 px-3 rounded-full border border-amber-500/20 inline-block">
            ✨ Benefit: {selectedZikr.benefit}
          </p>
        </div>

        {/* Main Interactive Counter Circle */}
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <button
            onClick={handleIncrement}
            className="group relative w-60 h-60 rounded-full bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 border-8 border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)] flex flex-col items-center justify-center transition active:scale-95 hover:border-emerald-400/60"
          >
            {/* Progress Circle Visual */}
            <div
              className="absolute inset-0 rounded-full border-4 border-amber-400 opacity-60 transition-all duration-300"
              style={{
                clipPath: `inset(${100 - progressPercentage}% 0 0 0)`,
              }}
            />

            <span className="text-xs text-emerald-300 uppercase tracking-widest font-bold">
              Count
            </span>
            <span className="text-6xl font-black text-white my-1 font-mono">
              {count}
            </span>
            <span className="text-xs text-emerald-400/80">
              Target: {target}
            </span>
          </button>

          {/* Target Complete Badge */}
          {count >= target && target > 0 && (
            <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/50 px-4 py-1.5 rounded-full border border-amber-500/40 text-xs font-bold animate-bounce">
              <CheckCircle2 size={16} /> Target Completed! MashaAllah
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            className="flex-1 py-3 px-4 rounded-2xl bg-slate-900 border border-emerald-800/50 hover:bg-slate-800 text-emerald-200 text-sm font-semibold flex items-center justify-center gap-2 transition active:scale-95"
          >
            <RotateCcw size={16} /> Reset
          </button>

          <button
            onClick={handleSaveProgress}
            className="flex-1 py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
          >
            <Save size={16} /> Save Count
          </button>
        </div>

      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-800/60 rounded-3xl p-6 w-full max-w-md max-h-[80vh] flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3">
              <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                <History size={18} /> Saved Tasbih Records
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-xs bg-emerald-950 px-3 py-1 rounded-full text-emerald-300 border border-emerald-800"
              >
                Close
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {history.length === 0 ? (
                <p className="text-center text-sm text-emerald-400/60 py-8">
                  Koi saved record nahi hai. Zikr complete karke &ldquo;Save Count&rdquo; dabayein.
                </p>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/30 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-emerald-100">
                        {item.name}
                      </h4>
                      <span className="text-[10px] text-emerald-400/60">
                        {item.date}
                      </span>
                    </div>
                    <div className="bg-emerald-800/50 px-3 py-1 rounded-xl font-bold text-amber-300 text-sm">
                      {item.count}
                    </div>
                  </div>
                ))
              )}
            </div>

            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="w-full py-2.5 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-red-900/40 transition"
              >
                <Trash2 size={14} /> Clear All History
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}