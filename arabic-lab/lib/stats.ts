// Welcome-page numbers. Words are counted from content/vocab.json once the real
// lists are imported; until then the brief's totals are shown.
import { isSampleContent, unitSummaries } from "./content";

const counted = unitSummaries().reduce((n, u) => n + u.wordCount, 0);

export const CONTENT_STATS = {
  words: isSampleContent ? 1079 : counted,
  phrases: 100,
  grammarLessons: 17,
};
