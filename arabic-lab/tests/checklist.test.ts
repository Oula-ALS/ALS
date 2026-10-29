import { describe, expect, it } from "vitest";
import { TOPICS, topicById } from "@/content/writing";
import { checkRule, containsTerm, countSentences, countTerms, countWords, tokens } from "@/lib/writing/checklist";

const rule = (topic: string, id: string) => topicById(topic)!.checklist.find((r) => r.id === id)!;

describe("checklist auto-ticking", () => {
  it("finds لأنّو with or without shadda and in chat letters", () => {
    for (const text of ["بحب لبنان لأنّو حلو", "بحب لبنان لانو حلو", "b7ebb Lebnen la2anno 7elo"]) {
      expect(checkRule(rule("w1", "because"), text)).toBe(true);
    }
    expect(checkRule(rule("w1", "because"), "بحب لبنان كتير")).toBe(false);
  });

  it("matches whole words only (من does not match inside منيح)", () => {
    expect(containsTerm(tokens("بحكي عربي منيح"), "من")).toBe(false);
    expect(containsTerm(tokens("أنا من كندا"), "من")).toBe(true);
  });

  it("accepts و/ب/ل prefixes on Arabic words", () => {
    expect(checkRule(rule("w6", "then"), "بشرب قهوة وبعدين بروح")).toBe(true);
    expect(checkRule(rule("w10", "usually"), "بالعادة بفيق متأخر")).toBe(true);
  });

  it("matches multi-word terms", () => {
    expect(checkRule(rule("w6", "before"), "قبل ما نام بقرا")).toBe(true);
    expect(checkRule(rule("w13", "other-hand"), "ومن جهة تانية الناس")).toBe(true);
  });

  it("counts different adjectives, not repeats", () => {
    const looks = rule("w3", "looks");
    expect(checkRule(looks, "هي طويلة وطويلة")).toBe(false);
    expect(checkRule(looks, "هي طويلة وحلوة")).toBe(true);
    expect(countTerms(tokens("طيّبة وذكية ومضحكة"), ["طيّبة", "طيبة", "ذكية", "مضحكة"])).toBe(3);
  });

  it("counts sentences and words", () => {
    expect(countSentences("أنا اسمي سارة. أنا من كندا! كيفك؟")).toBe(3);
    expect(countSentences("... !! ؟")).toBe(0);
    expect(countWords("  أنا   اسمي سارة ")).toBe(3);
    expect(checkRule({ id: "s", label: "", kind: "sentences", min: 2 }, "جملة أولى. جملة تانية.")).toBe(true);
  });

  it("leaves manual items for the student", () => {
    expect(checkRule(rule("w3", "gender"), "anything")).toBeNull();
  });

  it("ticks every automatic item on each topic's own model text", () => {
    for (const topic of TOPICS) {
      for (const r of topic.checklist) {
        if (r.kind === "manual") continue;
        expect([topic.id, r.id, checkRule(r, topic.model.ar)]).toEqual([topic.id, r.id, true]);
      }
    }
  });

  it("highlights only phrases that really appear in the model text", () => {
    for (const topic of TOPICS) {
      for (const p of topic.phrases) expect([topic.id, p.ar, topic.model.ar.includes(p.ar)]).toEqual([topic.id, p.ar, true]);
    }
  });
});
