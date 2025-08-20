import { toZonedTime, formatInTimeZone } from "date-fns-tz";

const GAME_TZ = process.env.NEXT_PUBLIC_GAME_TZ || "America/Chicago";

export function todayChicagoISO() {
  // e.g. "2025-08-19" in the game timezone
  return formatInTimeZone(new Date(), GAME_TZ, "yyyy-MM-dd");
}

export function toChicagoDate(d) {
  return toZonedTime(d, GAME_TZ);
}
