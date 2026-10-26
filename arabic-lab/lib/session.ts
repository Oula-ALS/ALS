// "This session": the unit the teacher pinned for each level.
// Until the teacher dashboard (Stage 7) can set it, the first unit of each level is used.
import type { LevelId } from "./content/types";
import type { UnitSummary } from "./content";

export function sessionUnit(level: LevelId, units: UnitSummary[]) {
  return { unit: units.find((u) => u.level === level) ?? null, pinnedByTeacher: false, note: "" };
}
