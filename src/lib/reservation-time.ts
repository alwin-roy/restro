export interface ClockTime { hour: number; minute: number; period: "AM" | "PM"; }
export type ClockSelection = "hour" | "minute";

export function validClockPart(value: string, mode: ClockSelection): boolean {
  return /^[0-9]{1,2}$/.test(value) && Number(value) >= (mode === "hour" ? 1 : 0) && Number(value) <= (mode === "hour" ? 12 : 59);
}

export function parseClockTime(value: string): ClockTime | null {
  if (!/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/.test(value)) return null;
  const [hour, minute] = value.split(":").map(Number);
  return { hour: hour % 12 || 12, minute, period: hour < 12 ? "AM" : "PM" };
}
export function toReservationTime({ hour, minute, period }: ClockTime): string {
  if (!Number.isInteger(hour) || hour < 1 || hour > 12 || !Number.isInteger(minute) || minute < 0 || minute > 59) return "";
  return `${String(hour % 12 + (period === "PM" ? 12 : 0)).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
export function formatReservationTime(value: string): string {
  const time = parseClockTime(value);
  return time ? `${time.hour}:${String(time.minute).padStart(2, "0")} ${time.period}` : "";
}
export function clockValueFromPoint(dx: number, dy: number, mode: ClockSelection): number {
  const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 450) % 360;
  return mode === "hour" ? Math.round(angle / 30) % 12 || 12 : Math.round(angle / 6) % 60;
}
