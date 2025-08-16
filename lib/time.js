import { zonedTimeToUtc, utcToZonedTime, format } from "date-fns-tz";

const GAME_TZ = process.env.NEXT_PUBLIC_GAME_TZ || "America/Chicago";

export function todayChicagoISO() {
  const now = new Date();
  const zoned = utcToZonedTime(now, GAME_TZ);
  return format(zoned, "yyyy-MM-dd", { timeZone: GAME_TZ });
}

export function toChicagoDate(d) {
  return utcToZonedTime(d, GAME_TZ);
}
