"use client";

import { CalendarCheck, CalendarDays } from "lucide-react";
import { useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ClockTimePicker } from "@/components/reservation/ClockTimePicker";
import { GuestCounter } from "@/components/reservation/GuestCounter";
import { RESERVATION_CONFIG, firstInvalidReservationField, formatReservationDate, getRestaurantDate, validateReservation } from "@/lib/validations/reservation";
import type { ReservationDetails, ReservationErrors, ReservationValues } from "@/types/reservation";

const initialValues: ReservationValues = { fullName: "", email: "", phone: "", guests: "2", date: "", time: "19:00", specialRequests: "" };

export function ReservationForm() {
  const id = useId();
  const today = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("focus", onStoreChange);
      return () => window.removeEventListener("focus", onStoreChange);
    },
    () => getRestaurantDate(),
    () => ""
  );
  const [values, setValues] = useState<ReservationValues>(initialValues);
  const [errors, setErrors] = useState<ReservationErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [preview, setPreview] = useState<ReservationDetails | null>(null);
  const inputs = useRef<Partial<Record<keyof ReservationValues, HTMLElement | null>>>({});

  const effectiveDate = values.date || today;

  function change<K extends keyof ReservationValues>(field: K, value: ReservationValues[K]) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setPreview(null);
    if (errors[field as keyof ReservationErrors] || errors.contact) {
      const next = { ...values, date: effectiveDate, [field]: value };
      const validation = validateReservation(next);
      setErrors((previous) => {
        const updated = { ...previous };
        delete updated[field as keyof ReservationErrors];
        if (!validation.errors.contact) delete updated.contact;
        return updated;
      });
    }
  }

  function blur<K extends keyof ReservationValues>(field: K, event?: React.FocusEvent) {
    if (event?.relatedTarget instanceof HTMLElement && event.relatedTarget.closest("button[type='submit'], .menu-toggle")) return;
    const validation = validateReservation({ ...values, date: effectiveDate });
    const fieldError = validation.errors[field as keyof ReservationErrors];
    const contactError = (field === "email" || field === "phone") ? validation.errors.contact : undefined;
    setErrors((previous) => ({ ...previous, ...(fieldError ? { [field]: fieldError } : { [field]: undefined }), ...(contactError ? { contact: contactError } : {}) }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    const submissionValues = { ...values, date: effectiveDate };
    const result = validateReservation(submissionValues);
    setErrors(result.errors);
    const firstField = firstInvalidReservationField(result.errors);
    if (firstField && inputs.current[firstField]) {
      inputs.current[firstField]?.focus();
      return;
    }
    setPreview(result.details);
  }

  const fieldId = (name: string) => `${id}-${name}`;
  const props = (name: keyof ReservationValues, describedBy?: string) => ({
    id: fieldId(name),
    name,
    value: name === "date" ? effectiveDate : values[name],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => change(name, event.target.value),
    onBlur: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => blur(name, event),
    "aria-invalid": !!errors[name as keyof ReservationErrors],
    "aria-describedby": [describedBy, errors[name as keyof ReservationErrors] ? `${fieldId(name)}-error` : ""].filter(Boolean).join(" ") || undefined,
  });

  const error = (name: keyof ReservationErrors) => errors[name] ? <p id={`${fieldId(name)}-error`} className="reservation-error">{errors[name]}</p> : null;
  const chosenDate = useMemo(() => formatReservationDate(effectiveDate), [effectiveDate]);
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form className="reservation-card" onSubmit={submit} noValidate aria-labelledby={`${id}-title`}>
      <div className="mb-7 flex items-center gap-3 border-b border-[#eee] pb-6 sm:mb-8">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary"><CalendarDays size={21} aria-hidden="true" /></span>
        <div><h3 id={`${id}-title`} className="text-sm font-bold tracking-[0.12em]">BOOK YOUR TABLE</h3><p className="mt-1 text-xs leading-relaxed text-[#666]">A little planning. A delicious visit.</p></div>
      </div>
      
      <fieldset disabled={!today} className="reservation-grid min-w-0 border-0 p-0">
        <legend className="sr-only">Reservation details</legend>
        <div className="sm:col-span-2">
          <label className="reservation-label" htmlFor={fieldId("fullName")}>Full Name <span aria-hidden="true">*</span></label>
          <input {...props("fullName")} ref={(node) => { inputs.current.fullName = node; }} className="reservation-input" type="text" autoComplete="name" placeholder="Enter your full name" maxLength={100} required />
          {error("fullName")}
        </div>
        <div className="sm:col-span-2">
          <p id={`${id}-contact-hint`} className="reservation-hint mb-4">Provide at least one contact method. If you enter both, both must be valid.</p>
          <div className="grid min-w-0 gap-5 sm:grid-cols-2 sm:gap-6">
            <div>
              <label className="reservation-label" htmlFor={fieldId("email")}>Email Address</label>
              <input {...props("email", `${id}-contact-hint`)} ref={(node) => { inputs.current.email = node; }} className="reservation-input" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="example@gmail.com" maxLength={254} />
              {error("email")}
            </div>
            <div>
              <label className="reservation-label" htmlFor={fieldId("phone")}>Phone Number</label>
              <div className="reservation-phone"><span aria-hidden="true">+91</span><input {...props("phone", `${id}-contact-hint ${id}-phone-hint`)} ref={(node) => { inputs.current.phone = node; }} className="reservation-input" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit phone number" maxLength={10} /></div>
              <p id={`${id}-phone-hint`} className="reservation-hint mt-2">India (+91). Enter 10 digits only.</p>
              {error("phone")}
            </div>
          </div>
          {errors.contact && <p id={`${id}-contact-error`} className="reservation-error">{errors.contact}</p>}
        </div>
        <div>
          <label className="reservation-label" htmlFor={fieldId("guests")}>Number of Guests <span aria-hidden="true">*</span></label>
          <GuestCounter id={fieldId("guests")} value={values.guests} onChange={(value) => change("guests", value)} onBlur={(event) => blur("guests", event)} inputRef={(node) => { inputs.current.guests = node; }} invalid={!!errors.guests} describedBy={`${id}-guests-hint${errors.guests ? ` ${fieldId("guests")}-error` : ""}`} />
          <p id={`${id}-guests-hint`} className="reservation-hint mt-2">1–{RESERVATION_CONFIG.maxGuests} guests per reservation.</p>
          {error("guests")}
        </div>
        <div>
          <label className="reservation-label" htmlFor={fieldId("date")}>Reservation Date <span aria-hidden="true">*</span></label>
          <input {...props("date", `${id}-date-hint`)} ref={(node) => { inputs.current.date = node; }} className="reservation-input" type="date" min={today || undefined} required />
          <p id={`${id}-date-hint`} className="reservation-hint mt-2">{chosenDate || "Choose today or a future date."}</p>
          {error("date")}
        </div>
        <div className="sm:col-span-2">
          <label className="reservation-label" htmlFor={fieldId("time")}>Reservation Time <span aria-hidden="true">*</span></label>
          <ClockTimePicker id={fieldId("time")} value={values.time} onChange={(value) => { change("time", value); setErrors((previous) => ({ ...previous, time: validateReservation({ ...values, date: effectiveDate, time: value }).errors.time })); }} onBlur={(event) => blur("time", event)} inputRef={(node) => { inputs.current.time = node; }} invalid={!!errors.time} describedBy={`${id}-time-hint${errors.time ? ` ${fieldId("time")}-error` : ""}`} />
          <p id={`${id}-time-hint`} className="reservation-hint mt-2">India Standard Time (Asia/Kolkata).</p>
          {error("time")}
        </div>
        <div className="sm:col-span-2">
          <label className="reservation-label" htmlFor={fieldId("specialRequests")}>Special Requests <span className="font-normal text-[#777]">(Optional)</span></label>
          <textarea {...props("specialRequests", `${id}-requests-count`)} ref={(node) => { inputs.current.specialRequests = node; }} className="reservation-input min-h-32 resize-y" rows={4} placeholder="Any special requests or seating preferences?" maxLength={RESERVATION_CONFIG.maxRequests} />
          <p id={`${id}-requests-count`} className="reservation-hint mt-2 text-right">{values.specialRequests.length}/{RESERVATION_CONFIG.maxRequests} characters</p>
          {error("specialRequests")}
        </div>
        <div className="sm:col-span-2">
          {submitted && hasErrors && <p role="alert" className="reservation-error mb-4">Please review the highlighted fields before continuing.</p>}
          <button type="submit" className="yellow-button min-h-14 w-full cursor-pointer rounded-xl px-5 text-sm sm:text-base"><CalendarCheck size={20} aria-hidden="true" />Request Reservation</button>
          <p className="reservation-hint mt-3 text-center">Fields marked * are required.</p>
        </div>
      </fieldset>
      <div role="status" aria-live="polite" aria-atomic="true">
        {preview && (
          <div className="reservation-preview mt-6">
            <p className="font-semibold">Reservation preview ready. Nothing has been sent or saved.</p>
            <p className="mt-2 text-sm">
              {preview.guests} {preview.guests === 1 ? "guest" : "guests"} · {formatReservationDate(preview.date)} · {preview.time} IST
            </p>
          </div>
        )}
      </div>
    </form>
  );
}

