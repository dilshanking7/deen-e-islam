export interface DailyVerse {
  arabic: string;
  translation: string;
  reference: string;
}

const VERSES: DailyVerse[] = [
  { arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "Indeed, with hardship comes ease.", reference: "Surah Ash-Sharh • 94:6" },
  { arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", translation: "Indeed, Allah is with the patient.", reference: "Surah Al-Baqarah • 2:153" },
  { arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ", translation: "So remember Me; I will remember you.", reference: "Surah Al-Baqarah • 2:152" },
  { arabic: "وَقُل رَّبِّ زِدْنِي عِلْمًا", translation: "And say: My Lord, increase me in knowledge.", reference: "Surah Ta-Ha • 20:114" },
  { arabic: "وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ", translation: "And do not despair of the mercy of Allah.", reference: "Surah Yusuf • 12:87" },
  { arabic: "وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ", translation: "And Allah loves the doers of good.", reference: "Surah Ali Imran • 3:134" },
  { arabic: "وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ", translation: "And your Lord says: Call upon Me; I will respond to you.", reference: "Surah Ghafir • 40:60" },
  { arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "For indeed, with hardship there is ease.", reference: "Surah Ash-Sharh • 94:5" },
  { arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", translation: "And whoever relies upon Allah, then He is sufficient for him.", reference: "Surah At-Talaq • 65:3" },
  { arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً", translation: "Our Lord, give us in this world good and in the Hereafter good.", reference: "Surah Al-Baqarah • 2:201" },
  { arabic: "وَاصْبِرْ وَمَا صَبْرُكَ إِلَّا بِاللَّهِ", translation: "And be patient, and your patience is not but through Allah.", reference: "Surah An-Nahl • 16:127" },
  { arabic: "وَأَقِمِ الصَّلَاةَ إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ", translation: "And establish prayer. Indeed, prayer prohibits immorality and wrongdoing.", reference: "Surah Al-Ankabut • 29:45" },
  { arabic: "وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا", translation: "And those who strive for Us, We will surely guide them to Our ways.", reference: "Surah Al-Ankabut • 29:69" },
  { arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", translation: "Allah does not burden a soul beyond that it can bear.", reference: "Surah Al-Baqarah • 2:286" },
  { arabic: "وَقُولُوا لِلنَّاسِ حُسْنًا", translation: "And speak to people good words.", reference: "Surah Al-Baqarah • 2:83" },
  { arabic: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ", translation: "And when My servants ask you about Me, indeed I am near.", reference: "Surah Al-Baqarah • 2:186" },
  { arabic: "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ", translation: "Those who have believed and whose hearts are assured by the remembrance of Allah.", reference: "Surah Ar-Ra'd • 13:28" },
  { arabic: "فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ", translation: "So whoever does an atom's weight of good will see it.", reference: "Surah Az-Zalzalah • 99:7" },
  { arabic: "وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ", translation: "And above every possessor of knowledge is another knower.", reference: "Surah Yusuf • 12:76" },
  { arabic: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ", translation: "Indeed, Allah loves those who are constantly repentant and loves those who purify themselves.", reference: "Surah Al-Baqarah • 2:222" },
  { arabic: "إِنَّ رَحْمَتَ اللَّهِ قَرِيبٌ مِّنَ الْمُحْسِنِينَ", translation: "Indeed, the mercy of Allah is near to the doers of good.", reference: "Surah Al-A'raf • 7:56" },
  { arabic: "وَأَحْسِنُوا إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ", translation: "And do good; indeed, Allah loves the doers of good.", reference: "Surah Al-Baqarah • 2:195" },
  { arabic: "إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ", translation: "Indeed, the patient will be given their reward without account.", reference: "Surah Az-Zumar • 39:10" },
  { arabic: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ", translation: "Say: O My servants who have transgressed against themselves, do not despair of the mercy of Allah.", reference: "Surah Az-Zumar • 39:53" },
  { arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي", translation: "My Lord, expand for me my chest and ease for me my task.", reference: "Surah Ta-Ha • 20:25-26" },
  { arabic: "إِنَّ الْإِنسَانَ لَفِي خُسْرٍ إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ", translation: "Indeed, mankind is in loss, except those who believe and do righteous deeds.", reference: "Surah Al-Asr • 103:2-3" },
  { arabic: "وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ", translation: "But perhaps you hate a thing and it is good for you.", reference: "Surah Al-Baqarah • 2:216" },
  { arabic: "وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ", translation: "And remind, for indeed the reminder benefits the believers.", reference: "Surah Adh-Dhariyat • 51:55" },
  { arabic: "قُلْ إِنَّ صَلَاتِي وَنُسُكِي وَمَحْيَايَ وَمَمَاتِي لِلَّهِ رَبِّ الْعَالَمِينَ", translation: "Say: Indeed, my prayer, my rites, my living and my dying are for Allah, Lord of the worlds.", reference: "Surah Al-An'am • 6:162" },
  { arabic: "فَاسْتَقِمْ كَمَا أُمِرْتَ", translation: "So remain on a right course as you have been commanded.", reference: "Surah Hud • 11:112" },
  { arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", translation: "Verily, in the remembrance of Allah do hearts find rest.", reference: "Surah Ar-Ra'd • 13:28" },
  { arabic: "وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ", translation: "And when I am ill, it is He who cures me.", reference: "Surah Ash-Shu'ara • 26:80" },
  { arabic: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا", translation: "Our Lord, do not cause our hearts to deviate after You have guided us.", reference: "Surah Ali Imran • 3:8" },
  { arabic: "فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ", translation: "And when you have decided, then rely upon Allah.", reference: "Surah Ali Imran • 3:159" },
  { arabic: "وَبَشِّرِ الصَّابِرِينَ", translation: "And give good tidings to the patient.", reference: "Surah Al-Baqarah • 2:155" },
  { arabic: "سَيَجْعَلُ اللَّهُ بَعْدَ عُسْرٍ يُسْرًا", translation: "Allah will make after hardship ease.", reference: "Surah At-Talaq • 65:7" },
  { arabic: "وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ", translation: "And say: Work, and Allah will see your deeds.", reference: "Surah At-Tawbah • 9:105" },
];

export function getRandomVerse(avoidIndex?: number): DailyVerse {
  return VERSES[getRandomVerseIndex(avoidIndex)];
}

export function getRandomVerseIndex(avoidIndex?: number): number {
  if (VERSES.length <= 1) return 0;
  let index = Math.floor(Math.random() * VERSES.length);
  if (avoidIndex !== undefined && index === avoidIndex) {
    index = (index + 1) % VERSES.length;
  }
  return index;
}

export function getVerseAt(index: number): DailyVerse {
  return VERSES[index % VERSES.length];
}

export function getVerseCount(): number {
  return VERSES.length;
}

export function getVerseOfTheDay(): DailyVerse {
  const day = Math.floor(Date.now() / 86400000);
  return VERSES[day % VERSES.length];
}

export function getAllVerses(): DailyVerse[] {
  return VERSES;
}
