// Writing workshop topics. Model texts W1–W9 (Arabic + English) and W1–W3 chat are Oula's.
// Everything marked `draft` was added by Claude and needs teacher approval
// (the teacher can approve or edit it in the dashboard → Content review).

import type { LevelId } from "@/lib/content/types";

export type Gendered = string | { m: string; f: string };

/** Text, a gendered piece of text, or a blank the student fills in (guided mode). */
export type Segment =
  | string
  | { g: { m: string; f: string } }
  | { blank: string; label: string; prefill?: "name" | "country" | "hobby" | "animal" };

export type Rule =
  | { id: string; label: string; kind: "contains"; any: string[] }
  | { id: string; label: string; kind: "count"; from: string[]; min: number }
  | { id: string; label: string; kind: "sentences"; min: number }
  | { id: string; label: string; kind: "manual" };

export type BankWord = { ar: string; en: string; chat?: string };

export type Topic = {
  id: string;
  level: LevelId;
  title: { en: string; ar: string };
  goal: string;
  model: { ar: string; chat: string; en: string };
  /** which parts are Claude's drafts awaiting teacher approval */
  draft: { model?: boolean; chat?: boolean; guided?: boolean };
  phrases: Array<{ ar: string; en: string }>;
  starters: Gendered[];
  wordBank: Array<{ heading: string; words: BankWord[] }>;
  checklist: Rule[];
  guided?: Segment[];
  focus?: string;
  variants?: string[];
  /** Advanced topics: also show the Advanced vocabulary units as word banks */
  advancedVocab?: boolean;
};

// Words and spellings the checklist accepts (Arabic and chat).
const BECAUSE = ["لأنّو", "لانو", "لأنو", "لإنو", "لانه", "لأنه", "la2anno", "la2annu", "laenno", "lanno"];
const BUT = ["بس", "bas"];
const DAYS = [
  "الاثنين", "الإثنين", "التنين", "الثلاثاء", "التلاتا", "الأربعاء", "الأربعا", "الخميس", "الجمعة", "الجمعه", "السبت", "الأحد", "الاحد",
  "tanein", "talata", "arba3a", "5amis", "khamis", "jum3a", "jem3a", "sabet", "a7ad", "monday", "tuesday", "wednesday",
  "thursday", "friday", "saturday", "sunday",
];
const HOW_OFTEN = ["كل يوم", "كل", "بالعادة", "عادةً", "أحياناً", "احيانا", "أحيانا", "دايماً", "دايما", "مرة", "مرّة", "kell", "kil", "bil3ade", "a7yanan", "dayman", "marra"];
const LOOKS = [
  "طويل", "طويلة", "قصير", "قصيرة", "شعر", "شعره", "شعرها", "عيون", "عيونه", "عيونها", "أشقر", "شقرا", "أسود", "سودا", "بنّي", "بني", "بنية",
  "بنّية", "حلو", "حلوة", "كبير", "كبيرة", "صغير", "صغيرة", "tawil", "taweel", "tawileh", "2aseer", "sha3er", "3youn", "ash2ar", "aswad", "bunni",
];
const PERSONALITY = [
  "طيّب", "طيب", "طيّبة", "طيبة", "ذكي", "ذكية", "مضحك", "مضحكة", "هادي", "هادية", "خجول", "خجولة", "اجتماعي", "اجتماعية", "شاطر", "شاطرة",
  "كريم", "كريمة", "لطيف", "لطيفة", "tayyeb", "tayybeh", "zaki", "zakiyyeh", "mud'hek", "mud'hikeh", "hadi", "5ajoul", "shater", "kareem", "lateef",
];
const FAMILY = [
  "إم", "ام", "إمي", "امي", "بي", "بيّي", "بيي", "أخ", "اخ", "أخي", "اخي", "إخت", "اخت", "إختي", "اختي", "عيلة", "عيلتي", "جدّي", "جدي",
  "تيتا", "ستّي", "ابن", "بنت", "زوجي", "مرتي", "emm", "emmi", "bayy", "bayyi", "a5", "a5i", "e5et", "e5ti", "3eile", "3eilti",
];
const TIME_WORDS = ["الصبح", "الضهر", "المسا", "الليل", "بعدين", "قبل ما", "بعد ما", "الساعة", "es-sub7", "ed-dohr", "el-masa", "ba3dein", "2abel ma", "es-se3a"];
const COMPARATIVES = [
  "أكبر", "أصغر", "أحلى", "أغلى", "أرخص", "أبرد", "أشوب", "أطيب", "أسهل", "أصعب", "أحسن", "أبعد", "أقرب", "أهدى", "أكتر", "akbar", "asghar",
  "a7la", "aghla", "ar5as", "abrad", "ashwab", "atyab", "as-hal", "as3ab", "a7san",
];

export const TOPICS: Topic[] = [
  // ---------------- Book 1 (A1) ----------------
  {
    id: "w1",
    level: "book1",
    title: { en: "Introduce yourself", ar: "عرّف عن حالك" },
    goal: "Write 6–7 sentences introducing yourself.",
    model: {
      ar: "أنا اسمي سارة. أنا من كندا، بس هلّق ساكنة ب بيروت. عمري ٢٨ سنة. أنا طالبة بمدرسة السما وعم إتعلّم عربي لأنّو بحب لبنان كتير. بشتغل معلّمة إنجليزي. عندي أخ وإخت. تشرّفنا!",
      chat: "Ana ismi Sara. Ana min Canada, bas halla2 sakneh b Beirut. 3omri 28 sene. Ana t'albeh b madraset es-Sama w 3am et3allam 3arabi la2anno b7ebb Lebnen kteer. Bishtighel m3almet English. 3indi a5 w e5et. Tsharrafna!",
      en: "My name is Sara. I'm from Canada, but now I live in Beirut. I'm 28 years old. I'm a student at Alsama school and I'm learning Arabic because I love Lebanon a lot. I work as an English teacher. I have a brother and a sister. Nice to meet you!",
    },
    draft: { guided: true },
    phrases: [
      { ar: "أنا اسمي", en: "my name is" },
      { ar: "بس هلّق", en: "but now" },
      { ar: "ساكنة ب", en: "I live in (woman)" },
      { ar: "عمري", en: "I am … years old (lit. my age)" },
      { ar: "عم إتعلّم", en: "I'm learning" },
      { ar: "لأنّو", en: "because" },
      { ar: "بشتغل", en: "I work" },
      { ar: "تشرّفنا", en: "nice to meet you" },
    ],
    starters: ["أنا اسمي…", "أنا من…", { m: "ساكن ب…", f: "ساكنة ب…" }, "عمري… سنة", "بشتغل…", "عم إتعلّم عربي لأنّو…"],
    wordBank: [
      {
        heading: "Useful words",
        words: [
          { ar: "اسمي", en: "my name", chat: "ismi" },
          { ar: "ساكن / ساكنة", en: "living (m / f)", chat: "saken / sakneh" },
          { ar: "عمري", en: "my age", chat: "3omri" },
          { ar: "سنة", en: "year(s)", chat: "sene" },
          { ar: "بشتغل", en: "I work", chat: "bishtighel" },
          { ar: "طالب / طالبة", en: "student (m / f)", chat: "t'aleb / t'albeh" },
          { ar: "عندي", en: "I have", chat: "3indi" },
        ],
      },
    ],
    checklist: [
      { id: "name", label: "Your name (اسمي)", kind: "contains", any: ["اسمي", "ismi"] },
      { id: "country", label: "Your country (أنا من)", kind: "contains", any: ["أنا من", "انا من", "ana min", "ana mn"] },
      { id: "city", label: "Your city (ساكن/ساكنة ب)", kind: "contains", any: ["ساكن", "ساكنة", "saken", "sakneh", "sakne"] },
      { id: "age", label: "Your age (عمري)", kind: "contains", any: ["عمري", "3omri", "3emri"] },
      { id: "job", label: "Your job (بشتغل)", kind: "contains", any: ["بشتغل", "bishtighel", "bishteghel", "beshtghel"] },
      { id: "because", label: "A reason with لأنّو", kind: "contains", any: BECAUSE },
    ],
    guided: [
      "أنا اسمي ",
      { blank: "name", label: "your name", prefill: "name" },
      ". أنا من ",
      { blank: "country", label: "your country", prefill: "country" },
      "، بس هلّق ",
      { g: { m: "ساكن", f: "ساكنة" } },
      " ب ",
      { blank: "city", label: "your city" },
      ". عمري ",
      { blank: "age", label: "your age" },
      " سنة. أنا ",
      { g: { m: "طالب", f: "طالبة" } },
      " بمدرسة السما وعم إتعلّم عربي لأنّو ",
      { blank: "reason", label: "why you learn Arabic" },
      ". بشتغل ",
      { blank: "job", label: "your job" },
      ". تشرّفنا!",
    ],
  },
  {
    id: "w2",
    level: "book1",
    title: { en: "My hobby", ar: "هوايتي" },
    goal: "Write 5–6 sentences about your favourite hobby.",
    model: {
      ar: "هوايتي المفضّلة الطبخ. بطبخ كل يوم المسا بعد الشغل. بحب الطبخ لأنّو بيريّحني. بالعادة بطبخ أكل لبناني، متل التبولة والمجدّرة. يوم الجمعة بطبخ لعيلتي ورفقاتي. أحياناً الطبخ صعب، بس أنا مبسوطة كتير لمّا الأكل بيطلع طيّب.",
      chat: "Hiwayti el-mufaddaleh et-tabekh. Bitbo5 kell yom el-masa ba3d esh-shighel. B7ebb et-tabekh la2anno byrayye7ni. Bil3ade bitbo5 akel libnani, metel et-tabbouleh wel-mjaddara. Yom ej-jum3a bitbo5 la 3eilti w rif2ati. A7yanan et-tabekh sa3eb, bas ana mabsouta kteer lamma el-akel byitla3 tayyeb.",
      en: "My favourite hobby is cooking. I cook every evening after work. I love cooking because it relaxes me. Usually I cook Lebanese food, like tabbouleh and mjaddara. On Friday I cook for my family and friends. Sometimes cooking is hard, but I'm very happy when the food turns out tasty.",
    },
    draft: { guided: true },
    phrases: [
      { ar: "هوايتي المفضّلة", en: "my favourite hobby" },
      { ar: "كل يوم", en: "every day" },
      { ar: "بيريّحني", en: "it relaxes me" },
      { ar: "بالعادة", en: "usually" },
      { ar: "متل", en: "like (for example)" },
      { ar: "أحياناً", en: "sometimes" },
      { ar: "مبسوطة كتير", en: "very happy (woman)" },
      { ar: "لمّا", en: "when" },
    ],
    starters: ["هوايتي المفضّلة…", "بحب… لأنّو…", "كل يوم…", "يوم الجمعة…", "بالعادة…", "أحياناً… بس…"],
    wordBank: [
      {
        heading: "Extra words",
        words: [
          { ar: "بيريّحني", en: "it relaxes me", chat: "byrayye7ni" },
          { ar: "ممتع", en: "fun", chat: "mumte3" },
          { ar: "بتعلّم", en: "I learn", chat: "bet3allam" },
          { ar: "مع رفقاتي", en: "with my friends", chat: "ma3 rif2ati" },
          { ar: "بوقت الفراغ", en: "in free time", chat: "b wa2t el-faragh" },
        ],
      },
    ],
    checklist: [
      { id: "often", label: "Say how often (كل يوم، بالعادة، أحياناً…)", kind: "contains", any: HOW_OFTEN },
      { id: "because", label: "A reason with لأنّو", kind: "contains", any: BECAUSE },
      { id: "but", label: "A contrast with بس", kind: "contains", any: BUT },
      { id: "day", label: "A day of the week", kind: "contains", any: DAYS },
    ],
    guided: [
      "هوايتي المفضّلة ",
      { blank: "hobby", label: "your hobby", prefill: "hobby" },
      ". بعمل هالشي ",
      { blank: "when", label: "when / how often" },
      ". بحب ",
      { blank: "hobby2", label: "your hobby again", prefill: "hobby" },
      " لأنّو ",
      { blank: "reason", label: "why you like it" },
      ". أحياناً بيكون صعب، بس أنا ",
      { g: { m: "مبسوط", f: "مبسوطة" } },
      " كتير.",
    ],
  },
  {
    id: "w3",
    level: "book1",
    title: { en: "Describe a person", ar: "وصف شخص" },
    goal: "Write 5–6 sentences describing a friend.",
    model: {
      ar: "بدّي إحكي عن رفيقتي ليلى. ليلى من سوريا وساكنة بلبنان. عمرها ٢٥ سنة. هي طويلة وحلوة، شعرها أسود وعيونها بنّية. ليلى طيّبة كتير وذكية ومضحكة. بتشتغل ممرّضة بالمستشفى. بتحب القراية والموسيقى. أنا بحبها لأنّو دايماً بتساعدني.",
      chat: "Biddi e7ki 3an rfi2ti Layla. Layla min Souria w sakneh b Lebnen. 3omra 25 sene. Hiyye tawileh w 7elweh, sha3ra aswad w 3youna bunniyyeh. Layla tayybeh kteer w zakiyyeh w mud'hikeh. Btishtighel mmarrda bil-mustashfa. Bt7ebb el-2raye wel-mousi2a. Ana b7ebba la2anno dayman btsa3edni.",
      en: "I want to talk about my friend Layla. Layla is from Syria and lives in Lebanon. She's 25. She is tall and pretty, her hair is black and her eyes are brown. Layla is very kind, smart and funny. She works as a nurse at the hospital. She likes reading and music. I love her because she always helps me.",
    },
    draft: {},
    phrases: [
      { ar: "بدّي إحكي عن", en: "I want to talk about" },
      { ar: "عمرها", en: "she is … years old" },
      { ar: "شعرها", en: "her hair" },
      { ar: "عيونها", en: "her eyes" },
      { ar: "طيّبة كتير", en: "very kind (woman)" },
      { ar: "بتشتغل", en: "she works" },
      { ar: "دايماً", en: "always" },
      { ar: "بتساعدني", en: "she helps me" },
    ],
    starters: ["بدّي إحكي عن…", "هو/هي من…", "عمره/عمرها…", "شعره/شعرها…", "هو/هي كتير…", "بيشتغل/بتشتغل…", "بحبه/بحبها لأنّو…"],
    wordBank: [
      {
        heading: "Looks",
        words: [
          { ar: "طويل / طويلة", en: "tall" },
          { ar: "قصير / قصيرة", en: "short" },
          { ar: "شعر", en: "hair" },
          { ar: "عيون", en: "eyes" },
          { ar: "أشقر / شقرا", en: "blond" },
          { ar: "أسود", en: "black" },
          { ar: "بنّي", en: "brown" },
          { ar: "كبير / صغير بالعمر", en: "older / younger" },
        ],
      },
      {
        heading: "Personality",
        words: [
          { ar: "طيّب / طيّبة", en: "kind" },
          { ar: "ذكي / ذكية", en: "smart" },
          { ar: "مضحك / مضحكة", en: "funny" },
          { ar: "هادي / هادية", en: "calm" },
          { ar: "خجول / خجولة", en: "shy" },
          { ar: "اجتماعي / اجتماعية", en: "sociable" },
          { ar: "شاطر / شاطرة", en: "clever" },
          { ar: "كريم / كريمة", en: "generous" },
          { ar: "لطيف / لطيفة", en: "nice" },
        ],
      },
    ],
    checklist: [
      { id: "looks", label: "2 adjectives about looks", kind: "count", from: LOOKS, min: 2 },
      { id: "personality", label: "2 adjectives about personality", kind: "count", from: PERSONALITY, min: 2 },
      { id: "gender", label: "Masculine/feminine endings match the person (check yourself)", kind: "manual" },
      { id: "because", label: "A reason with لأنّو", kind: "contains", any: BECAUSE },
    ],
    variants: ["Describe a family member", "Describe a teacher", "Describe a famous person"],
  },
  {
    id: "w4",
    level: "book1",
    title: { en: "My family", ar: "عيلتي" },
    goal: "Write 5–6 sentences about your family.",
    model: {
      ar: "عيلتي مش كبيرة. عندي إم وبَيّ وأخ واحد. إمي اسمها منى، هي معلّمة وطيّبة كتير. بيّي اسمه سامي، بيشتغل مهندس. أخي الصغير اسمه كريم، عمره ١٥ سنة، بيحب الفوتبول. منحب نتغدّى سوا يوم الأحد.",
      chat: "3eilti mish kbeereh. 3indi emm w bayy w a5 wa7ad. Emmi isma Mona, hiyye m3allmeh w tayybeh kteer. Bayyi ismo Sami, byishtighel mohandes. A5i ez-zghir ismo Karim, 3omro 15 sene, bi7ebb el-football. Mn7ebb nitghadda sawa yom el-a7ad.",
      en: "My family isn't big. I have a mother, a father and one brother. My mum's name is Mona; she's a teacher and very kind. My dad's name is Sami; he works as an engineer. My little brother is Karim; he's 15 and loves football. We like having lunch together on Sunday.",
    },
    draft: { chat: true },
    focus: "Possessive suffixes (إمي، أخي، عمره) and family words from Unit 2.",
    phrases: [
      { ar: "مش كبيرة", en: "not big" },
      { ar: "اسمها", en: "her name is" },
      { ar: "اسمه", en: "his name is" },
      { ar: "عمره", en: "he is … years old" },
      { ar: "سوا", en: "together" },
    ],
    starters: ["عيلتي…", "عندي…", "إمي اسمها…", "بيّي اسمه…", "منحب… سوا"],
    wordBank: [
      {
        heading: "Family",
        words: [
          { ar: "إم / إمي", en: "mother / my mother" },
          { ar: "بَيّ / بيّي", en: "father / my father" },
          { ar: "أخ / أخي", en: "brother / my brother" },
          { ar: "إخت / إختي", en: "sister / my sister" },
          { ar: "عيلة / عيلتي", en: "family / my family" },
        ],
      },
    ],
    checklist: [
      { id: "family", label: "3 family words", kind: "count", from: FAMILY, min: 3 },
      { id: "possessive", label: "Possessives like إمي، أخي، اسمه", kind: "contains", any: ["إمي", "امي", "بيّي", "بيي", "أخي", "اخي", "إختي", "اختي", "اسمه", "اسمها", "عمره", "عمرها", "emmi", "bayyi", "a5i", "e5ti", "ismo", "isma"] },
      { id: "sentences", label: "5+ sentences", kind: "sentences", min: 5 },
    ],
  },
  {
    id: "w5",
    level: "book1",
    title: { en: "My favourite animal", ar: "حيواني المفضّل" },
    goal: "Write 4–5 sentences about your favourite animal.",
    model: {
      ar: "حيواني المفضّل القطة. عندي قطة اسمها لولو. هي صغيرة وبيضا وحلوة كتير. بتنام كتير وبتحب تلعب المسا. بحب القطط لأنّو هادية ولطيفة.",
      chat: "7ayawani el-mufaddal el-2otta. 3indi 2otta isma Lulu. Hiyye zghireh w baida w 7elweh kteer. Btneem kteer w bt7ebb tel3ab el-masa. B7ebb el-2otat la2anno hadyeh w lateefeh.",
      en: "My favourite animal is the cat. I have a cat called Lulu. She's small, white and very cute. She sleeps a lot and likes to play in the evening. I love cats because they're calm and gentle.",
    },
    draft: { chat: true, guided: true },
    phrases: [
      { ar: "حيواني المفضّل", en: "my favourite animal" },
      { ar: "اسمها", en: "her name is" },
      { ar: "كتير", en: "a lot / very" },
      { ar: "بتحب تلعب", en: "she likes to play" },
    ],
    starters: ["حيواني المفضّل…", "عندي…", "هو/هي…", "بحب… لأنّو…"],
    wordBank: [
      {
        heading: "Describing animals",
        words: [
          { ar: "صغير / صغيرة", en: "small" },
          { ar: "كبير / كبيرة", en: "big" },
          { ar: "حلو / حلوة", en: "cute, nice" },
          { ar: "هادي / هادية", en: "calm" },
          { ar: "لطيف / لطيفة", en: "gentle" },
          { ar: "سريع / سريعة", en: "fast" },
        ],
      },
    ],
    checklist: [
      { id: "animal", label: "Name your favourite animal (حيواني المفضّل)", kind: "contains", any: ["حيواني", "7ayawani"] },
      { id: "adjectives", label: "2 describing words", kind: "count", from: ["صغير", "صغيرة", "كبير", "كبيرة", "حلو", "حلوة", "هادي", "هادية", "لطيف", "لطيفة", "سريع", "سريعة", "بيضا", "أبيض", "أسود", "سودا"], min: 2 },
      { id: "because", label: "A reason with لأنّو", kind: "contains", any: BECAUSE },
    ],
    guided: [
      "حيواني المفضّل ",
      { blank: "animal", label: "your favourite animal", prefill: "animal" },
      ". هو ",
      { blank: "adj1", label: "a describing word" },
      " و",
      { blank: "adj2", label: "another describing word" },
      ". بحبه لأنّو ",
      { blank: "reason", label: "why you like it" },
      ".",
    ],
  },
  {
    id: "w6",
    level: "book1",
    title: { en: "My daily routine", ar: "روتيني اليومي" },
    goal: "Write 6–7 sentences about your normal day.",
    model: {
      ar: "كل يوم بفيق الساعة سبعة الصبح. بشرب قهوة وبتروّق خبز وجبنة. بعدين بروح ع الشغل. الضهر بتغدّى مع رفقاتي. المسا برجع ع البيت، بطبخ وبتعشّى. قبل ما نام بقرا كتاب. بنام الساعة حدعش.",
      chat: "Kell yom bfee2 es-se3a sab3a es-sub7. Bishrab 2ahwe w bitrawwa2 5ebez w jebneh. Ba3dein brou7 3ash-shighel. Ed-dohr bitghadda ma3 rif2ati. El-masa berja3 3al-beit, bitbo5 w bit3ashsha. 2abel ma neem b2ra ktab. Bneem es-se3a 7da3sh.",
      en: "Every day I wake up at 7 in the morning. I drink coffee and have bread and cheese for breakfast. Then I go to work. At noon I have lunch with my friends. In the evening I come back home, cook and have dinner. Before I sleep I read a book. I go to sleep at eleven.",
    },
    draft: { chat: true },
    focus: "Present tense, time words, بعدين, قبل ما.",
    phrases: [
      { ar: "كل يوم", en: "every day" },
      { ar: "الساعة سبعة الصبح", en: "at 7 in the morning" },
      { ar: "بعدين", en: "then / after that" },
      { ar: "الضهر", en: "at noon" },
      { ar: "المسا", en: "in the evening" },
      { ar: "قبل ما نام", en: "before I sleep" },
    ],
    starters: ["كل يوم بفيق الساعة…", "بعدين…", "الضهر…", "المسا…", "قبل ما نام…"],
    wordBank: [
      {
        heading: "Time words",
        words: [
          { ar: "الصبح", en: "morning" },
          { ar: "الضهر", en: "noon" },
          { ar: "المسا", en: "evening" },
          { ar: "الليل", en: "night" },
          { ar: "بعدين", en: "then" },
          { ar: "قبل ما", en: "before (doing)" },
          { ar: "بعد ما", en: "after (doing)" },
        ],
      },
    ],
    checklist: [
      { id: "time", label: "3 time words", kind: "count", from: TIME_WORDS, min: 3 },
      { id: "then", label: "Use بعدين", kind: "contains", any: ["بعدين", "ba3dein", "ba3den"] },
      { id: "before", label: "Use قبل ما", kind: "contains", any: ["قبل ما", "2abel ma", "abel ma"] },
      { id: "sentences", label: "5+ sentences", kind: "sentences", min: 5 },
    ],
  },
  {
    id: "w7",
    level: "book1",
    title: { en: "My favourite food", ar: "أكلي المفضّل" },
    goal: "Write 5–6 sentences about food you love (and don't love).",
    model: {
      ar: "أكلي المفضّل المنقوشة بالزعتر. باكلها الصبح ع الفطور مع شاي. بحبها لأنّو طيّبة ورخيصة. كمان بحب التبولة والحمّص. ما بحب السمك المقلي كتير. برأيي الأكل اللبناني أطيب أكل بالعالم!",
      chat: "Akli el-mufaddal el-man2oushe bi-za3tar. Bekela es-sub7 3al-ftour ma3 shai. B7ebba la2anno tayybeh w r5eesa. Kamen b7ebb et-tabbouleh wel-7ommos. Ma b7ebb es-samak el-ma2le kteer. B ra2yi el-akel el-libnani atyab akel bil-3alam!",
      en: "My favourite food is zaatar manoushe. I eat it in the morning for breakfast with tea. I love it because it's tasty and cheap. I also like tabbouleh and hummus. I don't like fried fish much. In my opinion Lebanese food is the tastiest food in the world!",
    },
    draft: { chat: true },
    phrases: [
      { ar: "أكلي المفضّل", en: "my favourite food" },
      { ar: "ع الفطور", en: "for breakfast" },
      { ar: "كمان", en: "also" },
      { ar: "ما بحب", en: "I don't like" },
      { ar: "برأيي", en: "in my opinion" },
      { ar: "أطيب", en: "tastiest / tastier" },
    ],
    starters: ["أكلي المفضّل…", "باكلها/باكله…", "بحبها لأنّو…", "كمان بحب…", "ما بحب…", "برأيي…"],
    wordBank: [
      {
        heading: "Food words",
        words: [
          { ar: "طيّب / طيّبة", en: "tasty" },
          { ar: "رخيص / رخيصة", en: "cheap" },
          { ar: "غالي / غالية", en: "expensive" },
          { ar: "الفطور", en: "breakfast" },
          { ar: "الغدا", en: "lunch" },
          { ar: "العشا", en: "dinner" },
        ],
      },
    ],
    checklist: [
      { id: "fav", label: "Your favourite food (أكلي المفضّل)", kind: "contains", any: ["أكلي", "اكلي", "akli"] },
      { id: "because", label: "A reason with لأنّو", kind: "contains", any: BECAUSE },
      { id: "dislike", label: "Something you don't like (ما بحب)", kind: "contains", any: ["ما بحب", "ma b7ebb", "ma bhebb"] },
      { id: "opinion", label: "Your opinion (برأيي)", kind: "contains", any: ["برأيي", "برايي", "b ra2yi", "bra2yi"] },
    ],
  },

  // ---------------- B1 ----------------
  {
    id: "w8",
    level: "b1",
    title: { en: "A trip I took", ar: "رحلة" },
    goal: "Write 6–8 sentences about a trip, in the past tense.",
    model: {
      ar: "الصيف الماضي رحت ع جبيل مع رفقاتي. رحنا بالسيارة الصبح. الطقس كان شوب بس حلو. أول شي سبحنا بالبحر، بعدين أكلنا سمك مشوي بمطعم صغير. شفنا القلعة والسوق القديم. رجعنا المسا وكنت تعبانة بس مبسوطة كتير.",
      chat: "Es-seif el-made re7et 3a Jbeil ma3 rif2ati. Re7na bis-sayyara es-sub7. Et-ta2es kan shob bas 7elo. Awwal shi sba7na bil-ba7er, ba3dein akalna samak mashwe b mat3am zghir. Shefna el-2al3a wes-sou2 el-2adeem. Rje3na el-masa w kenet ta3baneh bas mabsouta kteer.",
      en: "Last summer I went to Byblos with my friends. We went by car in the morning. The weather was hot but nice. First we swam in the sea, then we ate grilled fish in a small restaurant. We saw the castle and the old market. We came back in the evening; I was tired but very happy.",
    },
    draft: { chat: true },
    focus: "Past tense, أول شي / بعدين / بعد ما.",
    phrases: [
      { ar: "الصيف الماضي", en: "last summer" },
      { ar: "رحت", en: "I went" },
      { ar: "كان", en: "was" },
      { ar: "أول شي", en: "first" },
      { ar: "بعدين", en: "then" },
      { ar: "شفنا", en: "we saw" },
      { ar: "رجعنا", en: "we came back" },
    ],
    starters: ["الصيف الماضي…", "رحت ع… مع…", "الطقس كان…", "أول شي…", "بعدين…", "رجعنا…"],
    wordBank: [],
    checklist: [
      { id: "first", label: "Use أول شي", kind: "contains", any: ["أول شي", "اول شي", "awwal shi"] },
      { id: "then", label: "Use بعدين or بعد ما", kind: "contains", any: ["بعدين", "بعد ما", "ba3dein", "ba3d ma"] },
      { id: "was", label: "Use كان / كانت / كنت", kind: "contains", any: ["كان", "كانت", "كنت", "kan", "kenet", "kanet"] },
      { id: "sentences", label: "5+ sentences", kind: "sentences", min: 5 },
    ],
  },
  {
    id: "w9",
    level: "b1",
    title: { en: "My dream and future", ar: "حلمي" },
    goal: "Write 4–6 sentences about your dream and plans.",
    model: {
      ar: "حلمي إنّو إحكي عربي منيح. بعد سنة رح سافر ع الأردن ومصر وإحكي مع الناس بالعربي. كمان بدّي إفتح مطعم صغير بمدينتي. لازم إدرس كتير، بس أنا متأكدة إنّو فيّي!",
      chat: "7elmi enno e7ki 3arabi mnee7. Ba3d sene ra7 safer 3al-Urdon w Masr w e7ki ma3 en-nes bil-3arabi. Kamen biddi efta7 mat3am zghir b madinti. Lezem edros kteer, bas ana mt2akkdeh enno fiyyi!",
      en: "My dream is to speak Arabic well. In a year I'll travel to Jordan and Egypt and talk to people in Arabic. I also want to open a small restaurant in my city. I have to study a lot, but I'm sure I can!",
    },
    draft: { chat: true },
    focus: "رح, بدّي, لازم, فيّي.",
    phrases: [
      { ar: "حلمي إنّو", en: "my dream is to" },
      { ar: "رح", en: "will" },
      { ar: "بدّي", en: "I want" },
      { ar: "لازم", en: "I have to / must" },
      { ar: "فيّي", en: "I can" },
    ],
    starters: ["حلمي إنّو…", "بعد سنة رح…", "كمان بدّي…", "لازم…", "بس أنا متأكد/متأكدة إنّو فيّي!"],
    wordBank: [],
    checklist: [
      { id: "ra7", label: "Use رح (future)", kind: "contains", any: ["رح", "ra7"] },
      { id: "biddi", label: "Use بدّي", kind: "contains", any: ["بدّي", "بدي", "biddi"] },
      { id: "lezem", label: "Use لازم", kind: "contains", any: ["لازم", "lezem", "lazem"] },
      { id: "fiyyi", label: "Use فيّي", kind: "contains", any: ["فيّي", "فيي", "fiyyi", "fiyye"] },
    ],
  },
  {
    id: "w10",
    level: "b1",
    title: { en: "My weekend", ar: "العطلة تبعي" },
    goal: "Write about a usual weekend: بالعادة… / أحياناً… / ما بحب…",
    model: {
      ar: "بالعادة يوم السبت بفيق متأخر. بشرب قهوة وبقرا شوي. بعد الضهر بطلع مع رفقاتي ع البحر أو ع القهوة. أحياناً منروح ع الجبل. يوم الأحد بتغدّى مع عيلتي. ما بحب نضّف البيت بالعطلة، بس لازم! بالليل بحضر فيلم وبنام بكّير.",
      chat: "Bil3ade yom es-sabet bfee2 mit2a55er. Bishrab 2ahwe w b2ra shway. Ba3d ed-dohr betla3 ma3 rif2ati 3al-ba7er aw 3al-2ahwe. A7yanan mnrou7 3al-jabal. Yom el-a7ad bitghadda ma3 3eilti. Ma b7ebb naddef el-beit bil-3otle, bas lezem! Bil-leil b7adder film w bneem bakkeer.",
      en: "Usually on Saturday I wake up late. I drink coffee and read a little. In the afternoon I go out with my friends to the sea or to a café. Sometimes we go to the mountains. On Sunday I have lunch with my family. I don't like cleaning the house at the weekend, but I have to! At night I watch a film and go to bed early.",
    },
    draft: { model: true, chat: true },
    phrases: [
      { ar: "بالعادة", en: "usually" },
      { ar: "بعد الضهر", en: "in the afternoon" },
      { ar: "أحياناً", en: "sometimes" },
      { ar: "ما بحب", en: "I don't like" },
      { ar: "بس لازم", en: "but I have to" },
    ],
    starters: ["بالعادة…", "أحياناً…", "يوم السبت…", "يوم الأحد…", "ما بحب…"],
    wordBank: [],
    checklist: [
      { id: "usually", label: "Use بالعادة", kind: "contains", any: ["بالعادة", "bil3ade", "bel3ade"] },
      { id: "sometimes", label: "Use أحياناً", kind: "contains", any: ["أحياناً", "احيانا", "أحيانا", "a7yanan"] },
      { id: "dislike", label: "Use ما بحب", kind: "contains", any: ["ما بحب", "ma b7ebb"] },
      { id: "sentences", label: "5+ sentences", kind: "sentences", min: 5 },
    ],
  },
  {
    id: "w11",
    level: "b1",
    title: { en: "Compare two cities", ar: "مقارنة بين مدينتين" },
    goal: "Compare two cities you know, using comparatives.",
    model: {
      ar: "بدّي قارن بين بيروت ولندن. بيروت أصغر من لندن، بس أحلى بالصيف. الطقس ببيروت أشوب من الطقس بلندن، ولندن أبرد بكتير بالشتي. لندن أغلى من بيروت، بس المواصلات فيها أسهل. برأيي الأكل ببيروت أطيب. أنا بحب المدينتين، بس قلبي ببيروت!",
      chat: "Biddi 2aren bein Beirut w London. Beirut asghar min London, bas a7la bis-seif. Et-ta2es b Beirut ashwab min et-ta2es b London, w London abrad b kteer bish-shiti. London aghla min Beirut, bas el-mwasalat fiya as-hal. B ra2yi el-akel b Beirut atyab. Ana b7ebb el-madintein, bas 2albi b Beirut!",
      en: "I want to compare Beirut and London. Beirut is smaller than London, but nicer in summer. The weather in Beirut is hotter than in London, and London is much colder in winter. London is more expensive than Beirut, but transport there is easier. In my opinion the food in Beirut is tastier. I love both cities, but my heart is in Beirut!",
    },
    draft: { model: true, chat: true },
    phrases: [
      { ar: "بدّي قارن بين", en: "I want to compare" },
      { ar: "أصغر من", en: "smaller than" },
      { ar: "أغلى من", en: "more expensive than" },
      { ar: "بكتير", en: "much (more)" },
      { ar: "برأيي", en: "in my opinion" },
    ],
    starters: ["بدّي قارن بين… و…", "… أكبر من…", "الطقس ب… أبرد من…", "… أغلى من…", "برأيي…"],
    wordBank: [
      {
        heading: "Comparatives",
        words: [
          { ar: "أكبر / أصغر", en: "bigger / smaller" },
          { ar: "أغلى / أرخص", en: "more / less expensive" },
          { ar: "أشوب / أبرد", en: "hotter / colder" },
          { ar: "أحلى / أطيب", en: "nicer / tastier" },
          { ar: "أسهل / أصعب", en: "easier / harder" },
        ],
      },
    ],
    checklist: [
      { id: "comparatives", label: "2 comparatives (أكبر، أغلى، أبرد…)", kind: "count", from: COMPARATIVES, min: 2 },
      { id: "than", label: "Use من (than)", kind: "contains", any: ["من", "min"] },
      { id: "opinion", label: "Your opinion (برأيي)", kind: "contains", any: ["برأيي", "برايي", "b ra2yi", "bra2yi"] },
    ],
  },
  {
    id: "w12",
    level: "b1",
    title: { en: "At the restaurant", ar: "بالمطعم" },
    goal: "Write a short dialogue: ordering, describing the food, asking for the bill.",
    model: {
      ar: "الجرسون: أهلا وسهلا! شو بتحبّوا تطلبوا؟\nأنا: لو سمحت، بدّي صحن حمّص وتبولة ومنقوشة جبنة.\nالجرسون: وشو بتشربوا؟\nأنا: عصير ليمون، لو سمحت.\nالجرسون: صحتين!\nأنا: الأكل كتير طيّب! الحساب لو سمحت.\nالجرسون: تكرم، أهلا وسهلا فيكن.",
      chat: "El-garson: Ahla w sahla! Shou bt7ebbo totlobo?\nAna: Law sama7t, biddi sa7en 7ommos w tabbouleh w man2oushet jebneh.\nEl-garson: W shou btishrabo?\nAna: 3aseer laymoun, law sama7t.\nEl-garson: Sa7tein!\nAna: El-akel kteer tayyeb! El-7sab law sama7t.\nEl-garson: Tikram, ahla w sahla feekon.",
      en: "Waiter: Welcome! What would you like to order?\nMe: Please, I'd like a plate of hummus, tabbouleh and a cheese manoushe.\nWaiter: And what will you drink?\nMe: Lemon juice, please.\nWaiter: Enjoy your meal!\nMe: The food is very tasty! The bill, please.\nWaiter: Of course, you're welcome.",
    },
    draft: { model: true, chat: true },
    phrases: [
      { ar: "لو سمحت", en: "please" },
      { ar: "بدّي", en: "I'd like" },
      { ar: "صحتين", en: "enjoy your meal" },
      { ar: "الحساب", en: "the bill" },
      { ar: "تكرم", en: "of course (lit. you're honoured)" },
    ],
    starters: ["الجرسون: أهلا وسهلا!", "أنا: لو سمحت، بدّي…", "الأكل كتير…", "الحساب لو سمحت."],
    wordBank: [],
    checklist: [
      { id: "order", label: "Order something (بدّي… / لو سمحت)", kind: "contains", any: ["بدّي", "بدي", "لو سمحت", "biddi", "law sama7t"] },
      { id: "describe", label: "Describe the food (طيّب، زاكي، طيبة…)", kind: "contains", any: ["طيّب", "طيب", "طيّبة", "طيبة", "زاكي", "زاكية", "tayyeb", "zeke"] },
      { id: "bill", label: "Ask for the bill (الحساب)", kind: "contains", any: ["الحساب", "el-7sab", "el7sab", "7sab"] },
    ],
  },

  // ---------------- Advanced ----------------
  {
    id: "w13",
    level: "advanced",
    title: { en: "Opinion paragraph", ar: "رأيي" },
    goal: "Write an opinion paragraph on one Advanced vocabulary topic (technology, migration, the generation gap, leadership…).",
    model: {
      ar: "برأيي التكنولوجيا غيّرت حياتنا كتير. من جهة، صار أسهل نحكي مع أهلنا ورفقاتنا البعاد، ونتعلّم أشيا جديدة ع الإنترنت. ومن جهة تانية، الناس صاروا يقضّوا وقت كتير ع التلفون وما عم يحكوا مع بعض. مثلاً، بالمطعم كل واحد عم يتطلّع بتلفونه. بالنهاية، التكنولوجيا مفيدة، بس لازم نستعملها بعقل.",
      chat: "B ra2yi et-technologia ghayyaret 7ayetna kteer. Min jiha, sar as-hal ne7ki ma3 ahlna w rif2atna el-b3ad, w net3allam ashya jdeedeh 3al-internet. W min jiha tenyeh, en-nes saro y2addo wa2t kteer 3at-telefon w ma 3am ye7ko ma3 ba3ed. Masalan, bil-mat3am kell wa7ad 3am yittalla3 b telefono. Bin-nihaye, et-technologia mufeedeh, bas lezem nesta3mela b 3a2el.",
      en: "In my opinion technology has changed our lives a lot. On the one hand, it became easier to talk to our family and friends who are far away, and to learn new things on the internet. On the other hand, people now spend a lot of time on the phone and don't talk to each other. For example, at a restaurant everyone is looking at their phone. In the end, technology is useful, but we have to use it wisely.",
    },
    draft: { model: true, chat: true },
    phrases: [
      { ar: "برأيي", en: "in my opinion" },
      { ar: "من جهة", en: "on the one hand" },
      { ar: "ومن جهة تانية", en: "on the other hand" },
      { ar: "مثلاً", en: "for example" },
      { ar: "بالنهاية", en: "in the end" },
    ],
    starters: ["برأيي…", "من جهة…", "ومن جهة تانية…", "مثلاً…", "بالنهاية…"],
    wordBank: [],
    advancedVocab: true,
    checklist: [
      { id: "opinion", label: "برأيي", kind: "contains", any: ["برأيي", "برايي", "b ra2yi", "bra2yi"] },
      { id: "one-hand", label: "من جهة", kind: "contains", any: ["من جهة", "min jiha", "mn jiha"] },
      { id: "other-hand", label: "من جهة تانية", kind: "contains", any: ["جهة تانية", "جهة ثانية", "jiha tenyeh", "jiha tenye", "jiha tanye"] },
      { id: "example", label: "مثلاً", kind: "contains", any: ["مثلاً", "مثلا", "masalan", "mathalan"] },
      { id: "end", label: "بالنهاية", kind: "contains", any: ["بالنهاية", "بالآخر", "bin-nihaye", "bil-nihaye", "bel a5er"] },
    ],
  },
];

export const topicById = (id: string) => TOPICS.find((t) => t.id === id) ?? null;
