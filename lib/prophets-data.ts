export interface Prophet {
  id: string;
  name: string;
  arabic: string;
  title?: string;
  birth?: string;
  era?: string;
  story: string;
  events?: string[];
}

export const PROPHETS_TOTAL = 124000;

export const PROPHETS: Prophet[] = [
  {
    id: "adam",
    name: "Prophet Adam (A.S.)",
    arabic: "آدم عليه السلام",
    title: "Pehla Insaan aur Pehla Nabi",
    birth: "Jannat (Heaven)",
    era: "~6000 BC (takhreeban)",
    story:
      "Hazrat Adam (A.S.) Allah ke banaye hue pehle insaan aur pehle nabi hain. Unhein jannat se zameen par bheja gaya. Unki wazifaa Allah ki ibadat karna aur insaaniyat ka aghaz karna tha. Unke do bete Habil aur Qabil ke waqia se Allah ne bataya ke khoon-rizi buri hai.",
    events: ["Aadam aur Hawa ki paidaish", "Habil aur Qabil ka waqia"],
  },
  {
    id: "idris",
    name: "Prophet Idris (A.S.)",
    arabic: "ادريس عليه السلام",
    title: "Pahle Qalam Uthane Wale",
    birth: "Babylon, Iraq",
    era: "~5000 BC",
    story:
      "Hazrat Idris (A.S.) sab se pehle qalam se likhne wale aur kapda selaane wale nabi the. Wo ilm aur hikmat ke sabse bade ustaad the. Unka zikr Quran me 2 surahon me aaya hai. Wo sachai aur ehsan ki talim dete the.",
  },
  {
    id: "nuh",
    name: "Prophet Nuh (A.S.)",
    arabic: "نوح عليه السلام",
    title: "Nabi-ul-Awwal (Sabse Pehle Rasool)",
    birth: "Mashriq mein (takhreeban Iraq ke qareeb)",
    era: "~950 saal tabligh",
    story:
      "Hazrat Nuh (A.S.) Allah ke sabse pehle rasool hain. Unhone 950 saal apni qaum ko tauheed ki dawat di. Unki qaum ne inkar kiya to Allah ne tufaan bheja. Hazrat Nuh (A.S.) ne Allah ke hukm se kashti banayi aur momineen ko bacha liya.",
    events: ["Toofan-e-Nuh (Kashti)", "Saman ke waqia"],
  },
  {
    id: "hud",
    name: "Prophet Hud (A.S.)",
    arabic: "هود عليه السلام",
    title: "Qaum-e-Aad ka Nabi",
    birth: "Ahqaf (Hadramaut, Yemen)",
    era: "~2300 BC",
    story:
      "Hazrat Hud (A.S.) ko qaum-e-Aad ke paas bheja gaya. Wo qaum apni quwwat par ghuroor karti thi. Unhone inkar kiya to Allah ne tez hawa ka azaab bheja jo 7 raat 8 din tak chala.",
  },
  {
    id: "saleh",
    name: "Prophet Saleh (A.S.)",
    arabic: "صالح عليه السلام",
    title: "Qaum-e-Samood ka Nabi",
    birth: "Hijr (Madina aur Tabuk ke darmiyan)",
    era: "~2000 BC",
    story:
      "Hazrat Saleh (A.S.) ko qaum-e-Samood ke paas bheja gaya. Unhone apni qaum ko dawat di aur Allah ke hukm se ek oont (naqa) dikhaya. Qaum ne oont ko maara to Allah ne zilzala aur cheekh ka azaab bheja.",
  },
  {
    id: "ibrahim",
    name: "Prophet Ibrahim (A.S.)",
    arabic: "ابراهيم عليه السلام",
    title: "Khalil-ullah (Allah ke Dost)",
    birth: "Uru (Babylon), Iraq — 2166 BC ke qareeb",
    era: "~2000 BC",
    story:
      "Hazrat Ibrahim (A.S.) ko 'Khalil-ullah' kaha jata hai. Unhone but-parasti ke khilaf dawat di aur aag ke azaab se Allah ne unhein bachaya. Unhone apne bete Hazrat Ismail (A.S.) ke saath Khana-e-Kaaba banaya. Unki azmaish ki parwah (Safar-e-Qurbani) Eid-ul-Adha ka sabab hai.",
    events: ["Aag se nijaat", "Kaaba ki taameer", "Qurbani ka waqia"],
  },
  {
    id: "lut",
    name: "Prophet Lut (A.S.)",
    arabic: "لوط عليه السلام",
    title: "Qaum-e-Lut ka Nabi",
    birth: "Iraq se Hijrat kar ke Sadum (Sodom)",
    era: "~1900 BC",
    story:
      "Hazrat Lut (A.S.) Hazrat Ibrahim (A.S.) ke bhateeje the. Wo qaum-e-Sadum ke paas bheje gaye jo bad-amli mein ghirk hui thi. Unki qaum par patthar baraste hue azaab aaya aur shehar tabah ho gaya.",
  },
  {
    id: "ismail",
    name: "Prophet Ismail (A.S.)",
    arabic: "اسماعيل عليه السلام",
    title: "Nabi aur Zabih-ullah",
    birth: "Kan'aan (Palestine) — 1894 BC ke qareeb",
    era: "~1900 BC",
    story:
      "Hazrat Ismail (A.S.) Hazrat Ibrahim (A.S.) ke bete the. Unhein Allah ki dawat ke liye Makkah bheja gaya. Unhone apne walid ke saath Kaaba banaya. Unki azmaish-e-qurbani se Eid-ul-Adha ki sunnat mili.",
  },
  {
    id: "ishaq",
    name: "Prophet Ishaq (A.S.)",
    arabic: "اسحاق عليه السلام",
    title: "Hazrat Ibrahim ke Betay",
    birth: "Kan'aan (Palestine) — 1892 BC ke qareeb",
    era: "~1900 BC",
    story:
      "Hazrat Ishaq (A.S.) Hazrat Ibrahim (A.S.) ke doosre bete the. Wo Hazrat Ismail (A.S.) ke chhote bhai the. Unki aulad mein Hazrat Yaqub (A.S.) aur unke baad Bani Israel ke nabi aaye.",
  },
  {
    id: "yaqub",
    name: "Prophet Yaqub (A.S.)",
    arabic: "يعقوب عليه السلام",
    title: "Israil ke Naam Se Mashhoor",
    birth: "Kan'aan (Palestine)",
    era: "~1800 BC",
    story:
      "Hazrat Yaqub (A.S.) ko 'Israil' bhi kaha jata hai. Unke 12 bete the jo Bani Israel ke 12 qabile hain. Unke bete Hazrat Yusuf (A.S.) ka waqia Quran me sab se mukammal kahani ke roop mein aaya.",
  },
  {
    id: "yusuf",
    name: "Prophet Yusuf (A.S.)",
    arabic: "يوسف عليه السلام",
    title: "Sachchon Ka Sitar",
    birth: "Kan'aan (Palestine) — 1740 BC ke qareeb",
    era: "~1700 BC",
    story:
      "Hazrat Yusuf (A.S.) ki kahani Quran me 'Ahsan-ul-Qasas' (sabse khoobsurat kahani) kehlati hai. Unhein bachpan mein kuen mein daala gaya, ghulam banakar Misr becha gaya, zindaan mein rehna pada, phir Allah ne unhein Misr ka aziz (minister) banaya. Unhone apne walid aur bhaiyon ko sehra ke bhook se bachaya.",
    events: ["Kuen ka waqia", "Zindaan", "Misr ka Aziz"],
  },
  {
    id: "shuayb",
    name: "Prophet Shu'ayb (A.S.)",
    arabic: "شعيب عليه السلام",
    title: "Qaum-e-Madyan ka Nabi",
    birth: "Madyan (Arabia ke uttar)",
    era: "~1500 BC",
    story:
      "Hazrat Shu'ayb (A.S.) ko qaum-e-Madyan ke paas bheja gaya jo naap-tol mein kam karti thi. Unhone unhein imandaari ki talim di. Na maanne par unpar zilzala aur saayeb (cloud) ka azaab aaya.",
  },
  {
    id: "ayyub",
    name: "Prophet Ayyub (A.S.)",
    arabic: "ايوب عليه السلام",
    title: "Sabr ka Ustad",
    birth: "Hauran (Jordan/Syria) — takhreeban",
    era: "~1500 BC",
    story:
      "Hazrat Ayyub (A.S.) apne sabr ki misaal ke liye mashhoor hain. Unhein sehat, maal aur bachon ki bimariyan aayi magar unhone Allah se shikayat nahi ki. Allah ne unki dua qubool kar ke unhein sehat wapas di.",
  },
  {
    id: "dhul-kifl",
    name: "Prophet Dhul-Kifl (A.S.)",
    arabic: "ذو الكفل عليه السلام",
    title: "Sabr Aur Amal Wale Nabi",
    birth: "Mashriq (takhreeban Iraq)",
    era: "~1400 BC",
    story:
      "Hazrat Dhul-Kifl (A.S.) sabr aur nek amal ke liye mashhoor hain. Unka zikr Quran mein kiya gaya hai. Wo apni qaum ko hukm ki talim aur adl-o-insaaf ki dawat dete the.",
  },
  {
    id: "yunus",
    name: "Prophet Yunus (A.S.)",
    arabic: "يونس عليه السلام",
    title: "Machi (Whale) Wale Nabi",
    birth: "Nineveh, Iraq",
    era: "~800 BC",
    story:
      "Hazrat Yunus (A.S.) ko qaum-e-Ninawah ke paas bheja gaya. Jab unhone qaum chhodi to samandar mein machli (whale) ne unhein nigal liya. Unhone andhere mein dua 'La ilaha illa anta subhanaka inni kuntu minaz-zalimeen' ki to Allah ne unhein bacha liya. Unki qaum ne baad mein toba kar li.",
  },
  {
    id: "musa",
    name: "Prophet Musa (A.S.)",
    arabic: "موسى عليه السلام",
    title: "Kalim-ullah (Jin Se Allah Ne Baat Ki)",
    birth: "Misr (Egypt) — 1391 BC ke qareeb",
    era: "~1300 BC",
    story:
      "Hazrat Musa (A.S.) Bani Israel ke sabse bare nabi hain. Allah ne unse Tur parhaad par kalam farmaya. Unhone Firaun ke khilaf dawat di aur asa (soTi) se samandar cheer kar Bani Israel ko bacha liya. Unko Taurat (Torah) di gayi. Hazrat Khizr ke saath unka safar bhi Quran mein hai.",
    events: ["Firaun se takkar", "Samandar ka shigaaf", "Taurat ka nuzool", "Khizr ka safar"],
  },
  {
    id: "harun",
    name: "Prophet Harun (A.S.)",
    arabic: "هارون عليه السلام",
    title: "Hazrat Musa ke Bhai",
    birth: "Misr (Egypt)",
    era: "~1300 BC",
    story:
      "Hazrat Harun (A.S.) Hazrat Musa (A.S.) ke bhai aur saathi the. Allah ne unhein Hazrat Musa (A.S.) ke saath Firaun ke paas bheja. Wo Bani Israel mein ilm aur deen ki talim dete the.",
  },
  {
    id: "dawud",
    name: "Prophet Dawud (A.S.)",
    arabic: "داوود عليه السلام",
    title: "Zabur Wale Nabi",
    birth: "Beit Laham (Palestine) — 1040 BC ke qareeb",
    era: "~1000 BC",
    story:
      "Hazrat Dawud (A.S.) ko Zabur (Psalms) diya gaya aur Allah ne unhein bada saltanat aur khoobsurat awaaz di. Unhone apne haath se loha garam kar ke armour banaya. Unke bete Hazrat Sulayman (A.S.) the.",
  },
  {
    id: "sulayman",
    name: "Prophet Sulayman (A.S.)",
    arabic: "سليمان عليه السلام",
    title: "Jin Aur Janwaron Ke Malik",
    birth: "Jerusalem — 990 BC ke qareeb",
    era: "~950 BC",
    story:
      "Hazrat Sulayman (A.S.) Hazrat Dawud (A.S.) ke bete the. Allah ne unhein jinn, janwar aur hawa par qaboo diya. Unke paas sab se badi saltanat thi. Balkis (Queen of Sheba) ka waqia bhi mashhoor hai.",
  },
  {
    id: "ilyas",
    name: "Prophet Ilyas (A.S.)",
    arabic: "الياس عليه السلام",
    title: "But Baal Ke Khilaf Nabi",
    birth: "Baalbek, Lebanon",
    era: "~900 BC",
    story:
      "Hazrat Ilyas (A.S.) ko bani Israel ke paas bheja gaya jo 'Baal' but ki parastish karne lage the. Unhone dawat di magar logon ne inkar kiya. Allah ne unhein bacha liya.",
  },
  {
    id: "al-yasa",
    name: "Prophet Al-Yasa (A.S.)",
    arabic: "اليسع عليه السلام",
    title: "Hazrat Ilyas ke Janasheen",
    birth: "Samaria (Palestine)",
    era: "~880 BC",
    story:
      "Hazrat Al-Yasa (A.S.) Hazrat Ilyas (A.S.) ke baad nabi hue. Unhone bani Israel ko tauheed ki taraf bulaya aur nek kaam ki talim di.",
  },
  {
    id: "zakariyya",
    name: "Prophet Zakariyya (A.S.)",
    arabic: "زكريا عليه السلام",
    title: "Mihrab Ke Nabi",
    birth: "Jerusalem — takhreeban 1st century BC",
    era: "~80 BC",
    story:
      "Hazrat Zakariyya (A.S.) Bait-ul-Muqaddas ke sarkar the. Unhone buDhaape mein Allah se aulaad ki dua ki aur Allah ne unhein Hazrat Yahya (A.S.) diye. Hazrat Maryam (R.A.) ke zimmedar bhi the.",
  },
  {
    id: "yahya",
    name: "Prophet Yahya (A.S.)",
    arabic: "يحيى عليه السلام",
    title: "Sachai Ke Shahid",
    birth: "Jerusalem — takhreeban 1st century",
    era: "~10 BC",
    story:
      "Hazrat Yahya (A.S.) Hazrat Zakariyya (A.S.) ke bete the. Wo bachpan se hi ilm aur ibadat mein aage the. Unhone apni qaum ko hak ka hukm diya aur sachai par qurbani di.",
  },
  {
    id: "isa",
    name: "Prophet Isa (A.S.)",
    arabic: "عيسى عليه السلام",
    title: "Ruh-ullah Aur Maseeh",
    birth: "Beit Laham (Palestine) — takhreeban 6-4 BC",
    era: "~0-33 CE",
    story:
      "Hazrat Isa (A.S.) Allah ke zat se, bina walid ke, Hazrat Maryam (R.A.) ke paida hue. Allah ne unhein Injeel (Gospel) diya aur laawaron ko zinda karna, andhon ko aankhein dena jaise mojize diye. Unhein oopar utha liya gaya aur qiyamat ke qareeb phir aayenge. Musalmaan unhein Allah ka banda aur rasool maante hain.",
    events: ["Bina walid ke paidaish", "Mojize", "Oopar uthaya jana"],
  },
  {
    id: "muhammad",
    name: "Prophet Muhammad (S.A.W.)",
    arabic: "محمد ﷺ",
    title: "Aakhri Nabi (Khatam-un-Nabiyyeen)",
    birth: "12 Rabi-ul-Awwal, 570 CE — Makkah",
    era: "570-632 CE",
    story:
      "Hazrat Muhammad (S.A.W.) Allah ke aakhri aur sabse afzal nabi hain. Unki wilaadat 570 CE mein Makkah ke qabil-e-hurmat Quraish khandaan mein hui. Unko 40 saal ki umr mein pehli wahi (Iqra) mili. Unhone 23 saal mein tauheed aur insaaniyat ka pehla deen qaem kiya, Quran aur Sunnah di. 632 CE mein Madina Munawwarah mein inteqaal hua. Unke baad koi nabi nahi aayega.",
    events: ["Wilaadat: 12 Rabi-ul-Awwal 570 CE", "Pehli wahi: Hira ki ghare", "Hijrat: Makkah se Madina", "Fatah-e-Makkah", "Aakhri khutba (Hajj-ul-Wida)"],
  },
];

export function getProphet(id: string): Prophet | undefined {
  return PROPHETS.find((p) => p.id === id);
}
