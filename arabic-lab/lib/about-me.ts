// Builds the student's spoken introduction from their details, with the right
// masculine/feminine forms. Line templates come from Oula's brief; country names
// and the "Ask your partner" chat/English are drafts for teacher review.

import type { Choice, Gender, Profile } from "./registration";
import type { Option } from "./profile-options";
import { TRAVEL } from "./profile-options";

export type Line = { id: string; ar: string; chat: string; en: string };

const COUNTRIES: Array<{ names: string[]; ar: string; chat: string }> = [
  ...TRAVEL.map((t) => ({ names: [t.en], ar: t.ar, chat: t.chat })),
  { names: ["Canada"], ar: "كندا", chat: "Canada" },
  { names: ["USA", "US", "United States", "America", "United States of America"], ar: "أميركا", chat: "Amerka" },
  { names: ["UK", "United Kingdom", "England", "Great Britain"], ar: "بريطانيا", chat: "Britania" },
  { names: ["Scotland"], ar: "اسكتلندا", chat: "Scotlanda" },
  { names: ["Ireland"], ar: "إيرلندا", chat: "Irlanda" },
  { names: ["Germany"], ar: "ألمانيا", chat: "Almania" },
  { names: ["Netherlands", "Holland"], ar: "هولندا", chat: "Holanda" },
  { names: ["Belgium"], ar: "بلجيكا", chat: "Beljika" },
  { names: ["Switzerland"], ar: "سويسرا", chat: "Swisra" },
  { names: ["Austria"], ar: "النمسا", chat: "en-Nemsa" },
  { names: ["Sweden"], ar: "السويد", chat: "es-Swed" },
  { names: ["Norway"], ar: "النروج", chat: "en-Norwej" },
  { names: ["Denmark"], ar: "الدنمارك", chat: "ed-Denmark" },
  { names: ["Finland"], ar: "فنلندا", chat: "Finlanda" },
  { names: ["Portugal"], ar: "البرتغال", chat: "el-Burtughal" },
  { names: ["Greece"], ar: "اليونان", chat: "el-Younan" },
  { names: ["Poland"], ar: "بولندا", chat: "Polanda" },
  { names: ["Russia"], ar: "روسيا", chat: "Rousya" },
  { names: ["Ukraine"], ar: "أوكرانيا", chat: "Ukrania" },
  { names: ["Australia"], ar: "أستراليا", chat: "Ostralia" },
  { names: ["New Zealand"], ar: "نيوزيلندا", chat: "New Zealanda" },
  { names: ["Iraq"], ar: "العراق", chat: "el-3ira2" },
  { names: ["Saudi Arabia"], ar: "السعودية", chat: "es-Sa3oudiyye" },
  { names: ["Yemen"], ar: "اليمن", chat: "el-Yaman" },
  { names: ["Sudan"], ar: "السودان", chat: "es-Soudan" },
  { names: ["Libya"], ar: "ليبيا", chat: "Libya" },
  { names: ["Algeria"], ar: "الجزائر", chat: "ej-Jaza2er" },
  { names: ["Iran"], ar: "إيران", chat: "Iran" },
  { names: ["Pakistan"], ar: "باكستان", chat: "Pakistan" },
  { names: ["Bangladesh"], ar: "بنغلادش", chat: "Bangladesh" },
  { names: ["China"], ar: "الصين", chat: "es-Seen" },
  { names: ["Korea", "South Korea"], ar: "كوريا", chat: "Korya" },
  { names: ["Mexico"], ar: "المكسيك", chat: "el-Mexique" },
  { names: ["Ethiopia"], ar: "إثيوبيا", chat: "Ethiopia" },
  { names: ["Nigeria"], ar: "نيجيريا", chat: "Nigeria" },
  { names: ["Kenya"], ar: "كينيا", chat: "Kenya" },
];

/** Arabic + chat for a country the student typed; their own words if we don't know it. */
export function countryFor(typed: string): { ar: string; chat: string; en: string; known: boolean } {
  const t = typed.trim().toLowerCase().replace(/^the\s+/, "");
  const c = COUNTRIES.find((x) => x.names.some((n) => n.toLowerCase() === t));
  return c ? { ar: c.ar, chat: c.chat, en: typed.trim(), known: true } : { ar: typed.trim(), chat: typed.trim(), en: typed.trim(), known: false };
}

function parts(choice: Choice | null): { ar: string; chat: string; en: string } | null {
  if (!choice) return null;
  if (choice.id === "other") {
    const text = (choice as { text: string }).text;
    return { ar: text, chat: text, en: text };
  }
  const o = choice as Option;
  return { ar: o.ar, chat: o.chat, en: o.en };
}

/** "the cat" for animals picked from a chip; the student's own words otherwise. */
const withThe = (choice: Choice | null, en: string) => (choice && choice.id !== "other" ? `the ${en}` : en);

export function buildIntro(p: Pick<Profile, "name" | "gender" | "from" | "hobby" | "animal" | "travel" | "dream">): Line[] {
  const f = p.gender === "female";
  const lines: Line[] = [
    {
      id: "name",
      ar: `مرحبا! أنا اسمي ${p.name}.`,
      chat: `Marhaba! Ana ismi ${p.name}.`,
      en: `Hello! My name is ${p.name}.`,
    },
  ];
  if (p.from.trim()) {
    const c = countryFor(p.from);
    lines.push({ id: "from", ar: `أنا من ${c.ar}.`, chat: `Ana min ${c.chat}.`, en: `I'm from ${c.en}.` });
  }
  lines.push({
    id: "student",
    ar: `أنا ${f ? "طالبة" : "طالب"} بمدرسة السما، وعم إتعلّم عربي.`,
    chat: `Ana ${f ? "t'albeh" : "t'aleb"} b-madraset es-Sama, w 3am et3allam 3arabi.`,
    en: "I'm a student at Alsama school, and I'm learning Arabic.",
  });
  const hobby = parts(p.hobby);
  if (hobby) {
    lines.push({
      id: "hobby",
      ar: `هوايتي المفضّلة ${hobby.ar}. بحبّ ${hobby.ar} كتير!`,
      chat: `Hiwayti el-mufaddaleh ${hobby.chat}. B7ebb ${hobby.chat} kteer!`,
      en: `My favourite hobby is ${hobby.en}. I love it!`,
    });
  }
  const animal = parts(p.animal);
  if (animal) {
    lines.push({
      id: "animal",
      ar: `حيواني المفضّل هو ${animal.ar}.`,
      chat: `7ayawani el-mufaddal huwwe ${animal.chat}.`,
      en: `My favourite animal is ${withThe(p.animal, animal.en)}.`,
    });
  }
  const place = parts(p.travel);
  if (place) {
    lines.push({
      id: "travel",
      ar: `بحبّ سافر ع ${place.ar}، لأنّو حلو كتير.`,
      chat: `B7ebb safer 3a ${place.chat}, la2anno 7elo kteer.`,
      en: `I love travelling to ${place.en}, because it's really beautiful.`,
    });
  }
  const dream = parts(p.dream);
  if (dream) {
    lines.push({ id: "dream", ar: `حلمي إنّو ${dream.ar}.`, chat: `7elmi enno ${dream.chat}.`, en: `My dream is to ${dream.en.replace(/^to /, "")}.` });
  }
  lines.push({ id: "bye", ar: "تشرّفنا!", chat: "Tsharrafna!", en: "Nice to meet you!" });
  return lines;
}

export type Partner = "m" | "f";

/** "Ask your partner" questions, with forms for asking a man or a woman. */
export const PARTNER_QUESTIONS: Array<{ id: string; ar: Record<Partner, string>; chat: Record<Partner, string>; en: string }> = [
  { id: "name", ar: { m: "شو اسمك؟", f: "شو اسمك؟" }, chat: { m: "Shou ismak?", f: "Shou ismik?" }, en: "What's your name?" },
  { id: "from", ar: { m: "من وين إنتَ؟", f: "من وين إنتِ؟" }, chat: { m: "Min wein enta?", f: "Min wein enti?" }, en: "Where are you from?" },
  {
    id: "free-time",
    ar: { m: "شو بتحب تعمل بوقت الفراغ؟", f: "شو بتحبي تعملي بوقت الفراغ؟" },
    chat: { m: "Shou bt7ebb ta3mel b wa2t el-faragh?", f: "Shou bt7ebbi ta3mli b wa2t el-faragh?" },
    en: "What do you like to do in your free time?",
  },
  { id: "hobby", ar: { m: "شو هوايتك المفضّلة؟", f: "شو هوايتك المفضّلة؟" }, chat: { m: "Shou hiwaytak el-mufaddaleh?", f: "Shou hiwaytik el-mufaddaleh?" }, en: "What's your favourite hobby?" },
  { id: "animal", ar: { m: "شو حيوانك المفضّل؟", f: "شو حيوانك المفضّل؟" }, chat: { m: "Shou 7ayawanak el-mufaddal?", f: "Shou 7ayawanik el-mufaddal?" }, en: "What's your favourite animal?" },
  {
    id: "travel",
    ar: { m: "وين بتحب تسافر؟", f: "وين بتحبي تسافري؟" },
    chat: { m: "Wein bt7ebb tsafer?", f: "Wein bt7ebbi tsafri?" },
    en: "Where do you like to travel?",
  },
  { id: "dream", ar: { m: "شو حلمك؟", f: "شو حلمك؟" }, chat: { m: "Shou 7elmak?", f: "Shou 7elmik?" }, en: "What's your dream?" },
];

/** Splits an Arabic sentence into word tiles for the "Build my sentences" game. */
export function sentenceTiles(ar: string): string[] {
  return ar.split(/\s+/).filter(Boolean);
}

export const genderOf = (g: Gender): Partner => (g === "female" ? "f" : "m");
