// Picker chips for the student details form (English + Arabic + chat).
// Arabic for hobbies, animals and dreams comes from Oula's brief. Arabic for the
// travel destinations and ALL chat spellings were added by Claude and are drafts
// until a teacher reviews them (listed in docs/arabic-review.md).

export type Option = { id: string; en: string; ar: string; chat: string };
export type GenderedOption = {
  id: string;
  en: string;
  ar: { m: string; f: string };
  chat: { m: string; f: string };
};

export const TRAVEL: Option[] = [
  { id: "lebanon", en: "Lebanon", ar: "لبنان", chat: "Lebnen" },
  { id: "syria", en: "Syria", ar: "سوريا", chat: "Souria" },
  { id: "jordan", en: "Jordan", ar: "الأردن", chat: "el-Urdon" },
  { id: "egypt", en: "Egypt", ar: "مصر", chat: "Masr" },
  { id: "morocco", en: "Morocco", ar: "المغرب", chat: "el-Maghreb" },
  { id: "tunisia", en: "Tunisia", ar: "تونس", chat: "Tounes" },
  { id: "palestine", en: "Palestine", ar: "فلسطين", chat: "Falasteen" },
  { id: "uae", en: "UAE", ar: "الإمارات", chat: "el-Emarat" },
  { id: "turkey", en: "Turkey", ar: "تركيا", chat: "Turkiya" },
  { id: "france", en: "France", ar: "فرنسا", chat: "Faransa" },
  { id: "italy", en: "Italy", ar: "إيطاليا", chat: "Italia" },
  { id: "spain", en: "Spain", ar: "إسبانيا", chat: "Esbania" },
  { id: "japan", en: "Japan", ar: "اليابان", chat: "el-Yaban" },
  { id: "brazil", en: "Brazil", ar: "البرازيل", chat: "el-Brazil" },
  { id: "india", en: "India", ar: "الهند", chat: "el-Hind" },
  { id: "britain", en: "Britain", ar: "بريطانيا", chat: "Britania" },
];

export const HOBBIES: Option[] = [
  { id: "reading", en: "reading", ar: "القراية", chat: "el-2raye" },
  { id: "drawing", en: "drawing", ar: "الرسم", chat: "er-rasem" },
  { id: "cooking", en: "cooking", ar: "الطبخ", chat: "et-tabekh" },
  { id: "swimming", en: "swimming", ar: "السباحة", chat: "es-sbe7a" },
  { id: "sport", en: "sport", ar: "الرياضة", chat: "er-riyada" },
  { id: "football", en: "football", ar: "الفوتبول", chat: "el-football" },
  { id: "music", en: "music", ar: "الموسيقى", chat: "el-mousi2a" },
  { id: "photography", en: "photography", ar: "التصوير", chat: "et-tasweer" },
  { id: "walking", en: "walking", ar: "المشي", chat: "el-mashi" },
  { id: "dancing", en: "dancing", ar: "الرقص", chat: "er-ra2es" },
  { id: "video-games", en: "video games", ar: "ألعاب الفيديو", chat: "al3ab el-video" },
  { id: "travelling", en: "travelling", ar: "السفر", chat: "es-safar" },
];

export const ANIMALS: Option[] = [
  { id: "cat", en: "cat", ar: "القطة", chat: "el-2otta" },
  { id: "dog", en: "dog", ar: "الكلب", chat: "el-kalb" },
  { id: "horse", en: "horse", ar: "الحصان", chat: "el-7san" },
  { id: "bird", en: "bird", ar: "العصفور", chat: "el-3asfour" },
  { id: "lion", en: "lion", ar: "الأسد", chat: "el-asad" },
  { id: "elephant", en: "elephant", ar: "الفيل", chat: "el-feel" },
  { id: "fish", en: "fish", ar: "السمكة", chat: "es-samake" },
  { id: "rabbit", en: "rabbit", ar: "الأرنب", chat: "el-arnab" },
  { id: "camel", en: "camel", ar: "الجمل", chat: "ej-jamal" },
  { id: "dolphin", en: "dolphin", ar: "الدلفين", chat: "ed-dolfeen" },
  { id: "turtle", en: "turtle", ar: "السلحفة", chat: "es-sel7fe" },
  { id: "tiger", en: "tiger", ar: "النمر", chat: "en-nemr" },
];

const same = (s: string) => ({ m: s, f: s });

export const DREAMS: GenderedOption[] = [
  { id: "speak-arabic", en: "speak Arabic well", ar: same("احكي عربي منيح"), chat: same("e7ki 3arabi mnee7") },
  { id: "travel-world", en: "travel around the world", ar: same("سافر حول العالم"), chat: same("safer 7awl el-3alam") },
  { id: "help-people", en: "help people", ar: same("ساعد الناس"), chat: same("sa3ed en-nes") },
  { id: "open-restaurant", en: "open a restaurant", ar: same("افتح مطعم"), chat: same("efta7 mat3am") },
  {
    id: "teacher",
    en: "become a teacher",
    ar: { m: "صير معلّم", f: "صير معلّمة" },
    chat: { m: "seer m3allem", f: "seer m3allme" },
  },
  {
    id: "doctor",
    en: "become a doctor",
    ar: { m: "صير دكتور", f: "صير دكتورة" },
    chat: { m: "seer doctor", f: "seer doctora" },
  },
  {
    id: "engineer",
    en: "become an engineer",
    ar: { m: "صير مهندس", f: "صير مهندسة" },
    chat: { m: "seer mohandes", f: "seer mohandse" },
  },
  { id: "live-lebanon", en: "live in Lebanon", ar: same("عيش بلبنان"), chat: same("3eesh b Lebnen") },
  { id: "write-book", en: "write a book", ar: same("اكتب كتاب"), chat: same("ektob ktab") },
  {
    id: "big-family",
    en: "have a big family",
    ar: same("يكون عندي عيلة كبيرة"),
    chat: same("ykoun 3andi 3ayle kbeere"),
  },
];

export const LEVELS = [
  { id: "book1", en: "Book 1 · A1" },
  { id: "b1", en: "B1" },
  { id: "advanced", en: "Advanced" },
] as const;

export const GENDERS = [
  { id: "male", en: "Male", ar: "ذكر" },
  { id: "female", en: "Female", ar: "أنثى" },
] as const;
