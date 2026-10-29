import { describe, expect, it } from "vitest";
import { buildIntro, countryFor, PARTNER_QUESTIONS, sentenceTiles } from "@/lib/about-me";
import { resolveChoice } from "@/lib/registration";

const base = {
  name: "Sara",
  from: "Canada",
  hobby: resolveChoice("hobby", { id: "cooking" }, "female"),
  animal: resolveChoice("animal", { id: "cat" }, "female"),
  travel: resolveChoice("travel", { id: "lebanon" }, "female"),
};

describe("buildIntro", () => {
  it("uses feminine forms for a woman", () => {
    const lines = buildIntro({ ...base, gender: "female", dream: resolveChoice("dream", { id: "teacher" }, "female") });
    const byId = Object.fromEntries(lines.map((l) => [l.id, l]));
    expect(byId.student.ar).toBe("أنا طالبة بمدرسة السما، وعم إتعلّم عربي.");
    expect(byId.student.chat).toContain("t'albeh");
    expect(byId.dream.ar).toBe("حلمي إنّو صير معلّمة.");
    expect(byId.dream.en).toBe("My dream is to become a teacher.");
  });

  it("uses masculine forms for a man", () => {
    const lines = buildIntro({ ...base, name: "Omar", gender: "male", dream: resolveChoice("dream", { id: "teacher" }, "male") });
    const byId = Object.fromEntries(lines.map((l) => [l.id, l]));
    expect(byId.name.ar).toBe("مرحبا! أنا اسمي Omar.");
    expect(byId.student.ar).toBe("أنا طالب بمدرسة السما، وعم إتعلّم عربي.");
    expect(byId.dream.ar).toBe("حلمي إنّو صير معلّم.");
  });

  it("fills every line of the brief in order", () => {
    const lines = buildIntro({ ...base, gender: "female", dream: resolveChoice("dream", { id: "help-people" }, "female") });
    expect(lines.map((l) => l.id)).toEqual(["name", "from", "student", "hobby", "animal", "travel", "dream", "bye"]);
    expect(lines.find((l) => l.id === "from")!.ar).toBe("أنا من كندا.");
    expect(lines.find((l) => l.id === "hobby")!.ar).toBe("هوايتي المفضّلة الطبخ. بحبّ الطبخ كتير!");
    expect(lines.find((l) => l.id === "animal")!.en).toBe("My favourite animal is the cat.");
    expect(lines.find((l) => l.id === "travel")!.ar).toBe("بحبّ سافر ع لبنان، لأنّو حلو كتير.");
  });

  it("skips favourites the student left empty and keeps their own words", () => {
    const lines = buildIntro({
      name: "Ana",
      gender: "female",
      from: "Atlantis",
      hobby: { id: "other", text: "knitting" },
      animal: null,
      travel: null,
      dream: null,
    });
    expect(lines.map((l) => l.id)).toEqual(["name", "from", "student", "hobby", "bye"]);
    expect(lines[1].ar).toBe("أنا من Atlantis.");
    expect(lines[3].en).toBe("My favourite hobby is knitting. I love it!");
  });

  it("knows common country names in any case", () => {
    expect(countryFor("the netherlands")).toMatchObject({ ar: "هولندا", known: true });
    expect(countryFor("USA").ar).toBe("أميركا");
  });

  it("has a man and a woman form for every partner question, and word tiles", () => {
    const from = PARTNER_QUESTIONS.find((q) => q.id === "from")!;
    expect([from.ar.m, from.ar.f]).toEqual(["من وين إنتَ؟", "من وين إنتِ؟"]);
    expect(sentenceTiles("حلمي إنّو صير معلّمة.")).toEqual(["حلمي", "إنّو", "صير", "معلّمة."]);
  });
});
