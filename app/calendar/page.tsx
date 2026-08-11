"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Sparkles,
  Info,
} from "lucide-react";

// Types
interface IslamicEvent {
  titleUrdu: string;
  titleEng: string;
  month: number; // 1 to 12 Hijri
  day: number;
  description: string;
  image: string;
}

// Major Islamic Events List with Image URLs
const ISLAMIC_EVENTS: IslamicEvent[] = [
  {
    month: 1,
    day: 1,
    titleUrdu: "یکم محرم الحرام - نیا اسلامی سال",
    titleEng: "Islamic New Year (1st Muharram)",
    description: "Islamic Hijri New Year marks the beginning of the Islamic lunar calendar.",
    image: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80",
  },
  {
    month: 1,
    day: 10,
    titleUrdu: "یومِ عاشورہ (10 محرم)",
    titleEng: "Day of Ashura (10th Muharram)",
    description: "Day of significant historical and spiritual importance in Islam.",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
  },
  {
    month: 3,
    day: 12,
    titleUrdu: "عید میلاد النبی ﷺ (12 ربیع الاول)",
    titleEng: "Mawlid al-Nabi SAW (12th Rabi-ul-Awwal)",
    description: "Birth anniversary of the Final Prophet Muhammad (S.A.W).",
    image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80",
  },
  {
    month: 7,
    day: 27,
    titleUrdu: "شبِ معراج (27 رجب)",
    titleEng: "Shab-e-Miraj (27th Rajab)",
    description: "The miraculous Ascension of Prophet Muhammad (S.A.W) to the Heavens.",
    image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80",
  },
  {
    month: 8,
    day: 15,
    titleUrdu: "شبِ برأت (15 شعبان)",
    titleEng: "Shab-e-Barat (15th Sha'ban)",
    description: "Night of forgiveness and blessings.",
    image: "https://images.unsplash.com/photo-1509021436468-1b2a38325b51?auto=format&fit=crop&w=800&q=80",
  },
  {
    month: 9,
    day: 1,
    titleUrdu: "رمضان المبارک کا پہلا دن",
    titleEng: "1st Ramadan (First Day of Fasting)",
    description: "Beginning of the Holy Month of Fasting and Quran revelation.",
    image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=800&q=80",
  },
  {
    month: 9,
    day: 27,
    titleUrdu: "شبِ قدر (27 رمضان)",
    titleEng: "Laylat al-Qadr (27th Ramadan)",
    description: "The Night of Power, better than a thousand months.",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
  },
  {
    month: 10,
    day: 1,
    titleUrdu: "عید الفطر (1 شوال)",
    titleEng: "Eid al-Fitr (1st Shawwal)",
    description: "Festival marking the end of Ramadan fasts.",
    image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80",
  },
  {
    month: 12,
    day: 9,
    titleUrdu: "یومِ عرفہ (9 ذوالحجہ)",
    titleEng: "Day of Arafah (9th Dhul Hijjah)",
    description: "The climax of the Hajj pilgrimage.",
    image: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=800&q=80",
  },
  {
    month: 12,
    day: 10,
    titleUrdu: "عید الاضحیٰ (10 ذوالحجہ)",
    titleEng: "Eid al-Adha (10th Dhul Hijjah)",
    description: "Festival of Sacrifice honoring Prophet Ibrahim's obedience.",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
  },
];

// Month Names Translation
const HIJRI_MONTHS = [
  { eng: "Muharram", urdu: "محرم الحرام" },
  { eng: "Safar", urdu: "صفر المظفر" },
  { eng: "Rabi' al-Awwal", urdu: "ربیع الأول" },
  { eng: "Rabi' al-Thani", urdu: "ربیع الثاني" },
  { eng: "Jumada al-Ula", urdu: "جمادى الأولى" },
  { eng: "Jumada al-Akhirah", urdu: "جمادى الآخرة" },
  { eng: "Rajab", urdu: "رجب المرجب" },
  { eng: "Sha'ban", urdu: "شعبان المعظم" },
  { eng: "Ramadan", urdu: "رمضان المبارک" },
  { eng: "Shawwal", urdu: "شوال المكرم" },
  { eng: "Dhu al-Qi'dah", urdu: "ذو القعدة" },
  { eng: "Dhu al-Hijjah", urdu: "ذو الحجة" },
];

// Precise Gregorian to Hijri Conversion Algorithm (Supports 1 AH to 2999 CE)
function g2h(d: number, m: number, y: number) {
  if (m < 3) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  let b = 2 - a + Math.floor(a / 4);
  if (y < 1583) b = 0;
  if (y === 1582) {
    if (m > 10) b = -10;
    if (m === 10) {
      b = 0;
      if (d > 15) b = -10;
    }
  }
  const jd =
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    d +
    b -
    1524.5;

  let z = jd - 1948439.5;
  const cyc = Math.floor(z / 10631);
  z = z - 10631 * cyc;
  const j = Math.floor((z - 0.1388) / 354.36667);
  const hy = cyc * 30 + j + 1;
  const z2 = z - Math.floor(j * 354.36667 + 0.1388);
  let hm = Math.floor((z2 + 28.5001) / 29.5);

  if (hm === 13) {
    hm = 12;
  }
  const hd = Math.floor(z2 - Math.floor(hm * 29.5 - 28.9999));

  return { day: hd, month: hm, year: hy };
}

export default function IslamicCalendar() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get Hijri Info for First Day and Month Range
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const startHijri = g2h(1, month + 1, year);
  const endHijri = g2h(daysInMonth, month + 1, year);

  // Handle Month Navigation
  const handlePrevMonth = () => {
    if (year > 622 || (year === 622 && month > 6)) {
      setCurrentDate(new Date(year, month - 1, 1));
    }
  };

  const handleNextMonth = () => {
    if (year < 2999) {
      setCurrentDate(new Date(year, month + 1, 1));
    }
  };

  // Find Events for the Selected Month
  const currentMonthEvents = ISLAMIC_EVENTS.filter((ev) => {
    return (
      (ev.month === startHijri.month || ev.month === endHijri.month)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 text-emerald-50 p-4 sm:p-8 font-sans">
      {/* Container */}
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Header Section */}
        <header className="rounded-3xl border border-emerald-500/20 bg-emerald-900/30 p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-center space-y-3 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex justify-center items-center gap-2 text-emerald-400 font-semibold tracking-wide text-sm uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Islamic & Gregorian Calendar (1 AH - 2999 CE)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-amber-200 via-emerald-200 to-teal-100 bg-clip-text text-transparent">
            اسلامی کیلنڈر
          </h1>

          {/* Dynamic Hijri Year & Month Display */}
          <div className="flex flex-wrap justify-center items-center gap-3 text-lg sm:text-xl font-medium text-emerald-200">
            <span>
              {HIJRI_MONTHS[startHijri.month - 1]?.urdu} ({HIJRI_MONTHS[startHijri.month - 1]?.eng})
            </span>
            {startHijri.month !== endHijri.month && (
              <>
                <span>-</span>
                <span>
                  {HIJRI_MONTHS[endHijri.month - 1]?.urdu} ({HIJRI_MONTHS[endHijri.month - 1]?.eng})
                </span>
              </>
            )}
            <span className="rounded-full bg-emerald-700/50 border border-emerald-400/30 px-3 py-1 text-amber-300 font-bold text-base">
              {startHijri.year} AH
            </span>
          </div>
        </header>

        {/* Main Grid: Calendar + Events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Calendar Card (2 Cols) */}
          <div className="lg:col-span-2 rounded-3xl border border-emerald-500/20 bg-emerald-900/20 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
            
            {/* Month & Year Controller */}
            <div className="flex items-center justify-between pb-6 border-b border-emerald-500/20">
              <div>
                <h2 className="text-2xl font-bold text-amber-200">
                  {currentDate.toLocaleString("default", { month: "long" })} {year}
                </h2>
                <p className="text-xs text-emerald-300/70">Gregorian Standard</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-3 rounded-2xl bg-emerald-800/40 hover:bg-emerald-700/50 border border-emerald-500/30 text-emerald-200 transition active:scale-95"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 rounded-2xl bg-emerald-600/40 hover:bg-emerald-600/60 border border-emerald-400/30 text-sm font-semibold text-emerald-100 transition active:scale-95 flex items-center gap-1.5"
                >
                  <CalendarIcon className="w-4 h-4" /> Today
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-3 rounded-2xl bg-emerald-800/40 hover:bg-emerald-700/50 border border-emerald-500/30 text-emerald-200 transition active:scale-95"
                  title="Next Month"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Calendar Days Header */}
            <div className="grid grid-cols-7 gap-2 my-4 text-center text-xs font-bold text-amber-300/80 uppercase">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Dates Grid */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {/* Blank Spaces before First Day */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="h-20 rounded-2xl bg-emerald-950/20 opacity-30" />
              ))}

              {/* Days Render */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const hDate = g2h(dayNum, month + 1, year);
                
                // Check if today
                const today = new Date();
                const isToday =
                  today.getDate() === dayNum &&
                  today.getMonth() === month &&
                  today.getFullYear() === year;

                // Check for Islamic Event
                const dayEvent = ISLAMIC_EVENTS.find(
                  (ev) => ev.month === hDate.month && ev.day === hDate.day
                );

                return (
                  <div
                    key={dayNum}
                    className={`relative h-20 rounded-2xl p-2 border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                      isToday
                        ? "bg-emerald-600/40 border-amber-400 ring-2 ring-amber-400/40 shadow-lg scale-105"
                        : dayEvent
                        ? "bg-amber-950/30 border-amber-500/50 hover:bg-amber-900/40"
                        : "bg-emerald-950/40 border-emerald-500/10 hover:border-emerald-500/30 hover:bg-emerald-800/20"
                    }`}
                  >
                    {/* Top: Gregorian Day */}
                    <div className="flex justify-between items-center text-xs">
                      <span className={`font-bold ${isToday ? "text-amber-300" : "text-emerald-100"}`}>
                        {dayNum}
                      </span>
                      {dayEvent && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Event Available" />
                      )}
                    </div>

                    {/* Bottom: Hijri Day & Month */}
                    <div className="text-right">
                      <div className="text-base sm:text-lg font-extrabold text-amber-200 leading-none">
                        {hDate.day}
                      </div>
                      <div className="text-[10px] text-emerald-300/60 truncate font-serif">
                        {HIJRI_MONTHS[hDate.month - 1]?.eng.split(" ")[0]}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Events & Festival Highlights with Images */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-900/20 p-6 backdrop-blur-xl shadow-xl">
              <h3 className="text-xl font-bold text-amber-300 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Islamic Festivals & Events
              </h3>

              {currentMonthEvents.length === 0 ? (
                <div className="text-center py-8 text-emerald-300/60 space-y-2">
                  <Info className="w-8 h-8 mx-auto text-emerald-400/40" />
                  <p className="text-sm">No major primary festivals listed for this Hijri cycle range.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {currentMonthEvents.map((ev, index) => (
                    <div
                      key={index}
                      className="group rounded-2xl overflow-hidden border border-emerald-500/20 bg-emerald-950/40 hover:border-amber-400/50 transition duration-300"
                    >
                      {/* Event Image */}
                      <div className="h-32 w-full overflow-hidden relative">
                        <img
                          src={ev.image}
                          alt={ev.titleEng}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-transparent" />
                        <span className="absolute bottom-2 left-3 rounded-full bg-amber-500/80 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-slate-950">
                          {ev.day} {HIJRI_MONTHS[ev.month - 1]?.eng}
                        </span>
                      </div>

                      {/* Event Content */}
                      <div className="p-4 space-y-1.5">
                        <h4 className="font-bold text-amber-200 text-right text-base font-serif">
                          {ev.titleUrdu}
                        </h4>
                        <h5 className="font-semibold text-emerald-100 text-sm">
                          {ev.titleEng}
                        </h5>
                        <p className="text-xs text-emerald-300/70 leading-relaxed">
                          {ev.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}