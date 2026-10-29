// "This session": the unit the teacher pinned for each level in the dashboard.
// If nothing is pinned yet, the first unit of the level is used.
import type { LevelId } from "./content/types";
import type { UnitSummary } from "./content";
import type { SessionSettings } from "./settings";

export function sessionUnit(level: LevelId, units: UnitSummary[], pins: SessionSettings = {}) {
  const pin = pins[level];
  const pinned = pin?.unitId ? units.find((u) => u.level === level && u.id === pin.unitId) : undefined;
  return {
    unit: pinned ?? units.find((u) => u.level === level) ?? null,
    pinnedByTeacher: Boolean(pinned),
    note: pin?.note ?? "",
  };
}
