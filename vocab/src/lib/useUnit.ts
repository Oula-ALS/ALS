import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { getLevel, getUnit, wordsOf } from "./data";

/** The level, unit and words for the current URL (/:level/:unit/...). */
export function useUnit() {
  const params = useParams();
  const data = getLevel(params.level);
  const unit = data && getUnit(data, params.unit);
  const words = useMemo(() => (data && unit ? wordsOf(data, unit) : []), [data, unit]);
  return { data, unit, words, base: data && unit ? `/${data.level}/${unit.slug}` : "/" };
}
