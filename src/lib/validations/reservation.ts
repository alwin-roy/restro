import type { ReservationDetails, ReservationErrors, ReservationField, ReservationValues } from "@/types/reservation";

export const RESERVATION_CONFIG = { minGuests: 1, maxGuests: 20, defaultGuests: 2, maxRequests: 500, timeZone: "Asia/Kolkata" } as const;
export const CONTACT_REQUIRED = "Please provide at least an email address or phone number.";
export const FUTURE_REQUIRED = "Please select a future reservation date and time.";
export const reservationFieldOrder: ReservationField[] = ["fullName", "email", "phone", "guests", "date", "time", "specialRequests"];
const indianDate = new Intl.DateTimeFormat("en-CA", { timeZone: RESERVATION_CONFIG.timeZone, year: "numeric", month: "2-digit", day: "2-digit" });

export function getRestaurantDate(now = new Date()): string {
  const parts = indianDate.formatToParts(now);
  const part = (type: string) => parts.find((entry) => entry.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

/** Parse calendar components without converting an input date through local/UTC midnight. */
function calendarDate(value: string): Date | null {
  const match = /^(\d{4,6})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  return Number.isFinite(date.getTime()) && date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : null;
}

export function formatReservationDate(value: string): string {
  const date = calendarDate(value);
  return date ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date) : "";
}

function validEmail(email: string): boolean {
  const pieces = email.split("@");
  if (pieces.length !== 2 || email.length > 254) return false;
  const [local, domain] = pieces;
  const labels = domain.split(".");
  return local.length >= 1 && local.length <= 64 && /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)
    && !local.startsWith(".") && !local.endsWith(".") && !local.includes("..")
    && labels.length >= 2 && labels.every((label) => /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(label))
    && /^[A-Za-z]{2,63}$/.test(labels[labels.length - 1]);
}

export function validateReservation(input: ReservationValues, now = new Date(), maxGuests: number = RESERVATION_CONFIG.maxGuests) {
  const values = { ...input, fullName: input.fullName.normalize("NFC").trim().replace(/\s+/gu, " "), email: input.email.trim() };
  const errors: ReservationErrors = {};
  const length = Array.from(values.fullName).length;
  if (!length) errors.fullName = "Please enter your full name.";
  else if (length < 2 || length > 100) errors.fullName = "Your name must contain 2–100 characters.";
  else if (!/^\p{L}[\p{L}\p{M}]*(?: \p{L}[\p{L}\p{M}]*)*$/u.test(values.fullName)) errors.fullName = "Use letters and spaces only, without numbers or symbols.";

  if (!values.email && !values.phone) errors.contact = CONTACT_REQUIRED;
  if (values.email && !validEmail(values.email)) errors.email = "Please enter a valid email address, such as customer@gmail.com.";
  if (values.phone && !/^[0-9]{10}$/.test(values.phone)) errors.phone = "Please enter exactly 10 digits, without spaces or a country code.";

  const guests = Number(values.guests);
  if (!values.guests) errors.guests = "Please enter the number of guests.";
  else if (!/^[0-9]+$/.test(values.guests) || !Number.isSafeInteger(guests)) errors.guests = "Enter a whole number of guests, without signs, decimals, or letters.";
  else if (guests < RESERVATION_CONFIG.minGuests || guests > maxGuests) errors.guests = `Please choose between ${RESERVATION_CONFIG.minGuests} and ${maxGuests} guests.`;
  else values.guests = String(guests);

  const date = calendarDate(values.date);
  const validTime = /^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/.test(values.time);
  if (!values.date) errors.date = "Please select a reservation date.";
  else if (!date) errors.date = "Please select a valid calendar date.";
  if (!values.time) errors.time = "Please select a reservation time.";
  else if (!validTime) errors.time = "Please select a valid reservation time.";

  if (date) {
    const today = calendarDate(getRestaurantDate(now))!;
    if (date.getTime() < today.getTime()) errors.date = FUTURE_REQUIRED;
    else if (validTime) {
      const [hour, minute] = values.time.split(":").map(Number);
      // Asia/Kolkata observes UTC+05:30 year-round. The input is an Indian wall time.
      const instant = date.getTime() + (hour * 60 + minute - 330) * 60_000;
      if (instant <= now.getTime()) errors.time = FUTURE_REQUIRED;
    }
  }
  if (values.specialRequests.length > RESERVATION_CONFIG.maxRequests) errors.specialRequests = `Please keep special requests within ${RESERVATION_CONFIG.maxRequests} characters.`;
  const details: ReservationDetails | null = Object.keys(errors).length ? null : { ...values, guests, phone: values.phone ? `+91${values.phone}` : "" };
  return { values, errors, details };
}

export function firstInvalidReservationField(errors: ReservationErrors): ReservationField | undefined {
  return reservationFieldOrder.find((field) => errors[field] || (field === "email" && errors.contact));
}
