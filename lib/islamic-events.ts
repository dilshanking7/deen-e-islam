export interface IslamicEvent {
  month: number;
  day: number;
  titleUrdu: string;
  titleEng: string;
  description: string;
  emoji: string;
}

export const ISLAMIC_EVENTS: IslamicEvent[] = [
  {
    month: 1,
    day: 1,
    titleUrdu: "یکم محرم الحرام — نیا اسلامی سال",
    titleEng: "Islamic New Year (1st Muharram)",
    description: "Islamic Hijri New Year — naye saal ki shuruaat.",
    emoji: "🌙",
  },
  {
    month: 1,
    day: 10,
    titleUrdu: "یومِ عاشورہ (10 محرم)",
    titleEng: "Day of Ashura (10th Muharram)",
    description: "Ashura ka din — roza aur ibadat ka din.",
    emoji: "🕯️",
  },
  {
    month: 3,
    day: 12,
    titleUrdu: "عید میلاد النبی ﷺ (12 ربیع الاول)",
    titleEng: "Mawlid al-Nabi SAW (12th Rabi-ul-Awwal)",
    description: "Aakhri Nabi Hazrat Muhammad (S.A.W) ki wilaadat ka din.",
    emoji: "🕌",
  },
  {
    month: 7,
    day: 27,
    titleUrdu: "شبِ معراج (27 رجب)",
    titleEng: "Shab-e-Miraj (27th Rajab)",
    description: "Hazrat Muhammad (S.A.W) ka arsh tak ka safar.",
    emoji: "⭐",
  },
  {
    month: 8,
    day: 15,
    titleUrdu: "شبِ برأت (15 شعبان)",
    titleEng: "Shab-e-Barat (15th Sha'ban)",
    description: "Muaafi aur barkaton ki raat.",
    emoji: "🌙",
  },
  {
    month: 9,
    day: 1,
    titleUrdu: "رمضان المبارک کا پہلا روزہ",
    titleEng: "1st Ramadan",
    description: "Roza aur Quran ka mubarak mahina shuru.",
    emoji: "🌙",
  },
  {
    month: 9,
    day: 27,
    titleUrdu: "شبِ قدر (27 رمضان)",
    titleEng: "Laylat al-Qadr (27th Ramadan)",
    description: "Hazaar mahino se behtar raat.",
    emoji: "✨",
  },
  {
    month: 10,
    day: 1,
    titleUrdu: "عید الفطر (1 شوال)",
    titleEng: "Eid al-Fitr (1st Shawwal)",
    description: "Ramadan ke baad Eid ka din.",
    emoji: "🎉",
  },
  {
    month: 12,
    day: 9,
    titleUrdu: "یومِ عرفہ (9 ذوالحجہ)",
    titleEng: "Day of Arafah (9th Dhul Hijjah)",
    description: "Hajj ka sabse ahem din.",
    emoji: "🕋",
  },
  {
    month: 12,
    day: 10,
    titleUrdu: "عید الاضحیٰ (10 ذوالحجہ)",
    titleEng: "Eid al-Adha (10th Dhul Hijjah)",
    description: "Qurbani ka Eid — Hazrat Ibrahim (A.S) ki yaad mein.",
    emoji: "🐐",
  },
];

const EVENT_NOTIFY_KEY = "islaam-event-notify";

export function getTodayHijri() {
  return g2h(new Date().getDate(), new Date().getMonth() + 1, new Date().getFullYear());
}

export function isEventToday(): IslamicEvent | null {
  const h = getTodayHijri();
  return ISLAMIC_EVENTS.find((e) => e.month === h.month && e.day === h.day) || null;
}

export interface UpcomingEvent extends IslamicEvent {
  gregorian: string;
  daysAway: number;
}

export function getUpcomingEvents(count = 4): UpcomingEvent[] {
  const results: UpcomingEvent[] = [];
  const seen = new Set<string>();
  for (let i = 1; i <= 365 && results.length < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const h = g2h(d.getDate(), d.getMonth() + 1, d.getFullYear());
    const ev = ISLAMIC_EVENTS.find((e) => e.month === h.month && e.day === h.day);
    if (ev && !seen.has(ev.titleEng)) {
      seen.add(ev.titleEng);
      results.push({ ...ev, gregorian: d.toDateString(), daysAway: i });
    }
  }
  return results;
}

export function shouldNotifyEventToday(): boolean {
  if (typeof window === "undefined") return false;
  const ev = isEventToday();
  if (!ev) return false;
  if (!("Notification" in window) || Notification.permission !== "granted") return false;
  const today = new Date().toDateString();
  const last = localStorage.getItem(EVENT_NOTIFY_KEY);
  if (last === `${today}:${ev.titleEng}`) return false;
  localStorage.setItem(EVENT_NOTIFY_KEY, `${today}:${ev.titleEng}`);
  return true;
}

export function markEventNotified() {
  localStorage.setItem(EVENT_NOTIFY_KEY, `${new Date().toDateString()}:${isEventToday()?.titleEng}`);
}

// Gregorian → Hijri (same algorithm as the calendar page)
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
