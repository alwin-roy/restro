"use client";

import { Minus, Plus } from "lucide-react";
import { RESERVATION_CONFIG } from "@/lib/validations/reservation";
import type { FocusEventHandler, Ref } from "react";

interface Props {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: FocusEventHandler<HTMLInputElement>;
  inputRef: Ref<HTMLInputElement>;
  invalid: boolean;
  describedBy: string;
  max?: number;
}
export function GuestCounter({ id, value, onChange, onBlur, inputRef, invalid, describedBy, max = RESERVATION_CONFIG.maxGuests }: Props) {
  const count = value ? Number(value) : RESERVATION_CONFIG.defaultGuests;
  const valid = !value || (/^[0-9]+$/.test(value) && Number.isSafeInteger(count) && count >= RESERVATION_CONFIG.minGuests && count <= max);
  return (
    <div className="reservation-guests" role="group" aria-label="Adjust number of guests">
      <button type="button" aria-label="Decrease number of guests" disabled={!valid || count <= RESERVATION_CONFIG.minGuests} onClick={() => onChange(String(count - 1))}><Minus size={18} aria-hidden="true" /></button>
      <input ref={inputRef} id={id} name="guests" className="reservation-input" type="text" inputMode="numeric" pattern="[0-9]*" required value={value} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} aria-invalid={invalid} aria-describedby={describedBy} />
      <button type="button" aria-label="Increase number of guests" disabled={!valid || count >= max} onClick={() => onChange(String(count + 1))}><Plus size={18} aria-hidden="true" /></button>
    </div>
  );
}
