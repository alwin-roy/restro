"use client";

import { Check, Clock3, X } from "lucide-react";
import { useId, useRef, useState, type FocusEventHandler, type KeyboardEvent, type PointerEvent, type Ref } from "react";
import { clockValueFromPoint, formatReservationTime, parseClockTime, toReservationTime, validClockPart, type ClockSelection, type ClockTime } from "@/lib/reservation-time";

interface Props {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: FocusEventHandler<HTMLInputElement>;
  inputRef: Ref<HTMLInputElement>;
  invalid: boolean;
  describedBy: string;
}
export function ClockTimePicker({ id, value, onChange, onBlur, inputRef, invalid, describedBy }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const dialogId = useId();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ClockSelection>("hour");
  const [draft, setDraft] = useState<ClockTime>({ hour: 12, minute: 0, period: "PM" });
  const [hourText, setHourText] = useState("12");
  const [minuteText, setMinuteText] = useState("00");
  const dragging = useRef<ClockSelection | null>(null);
  function show() {
    const initial = parseClockTime(value) ?? { hour: 12, minute: 0, period: "PM" };
    setDraft(initial);
    setHourText(String(initial.hour).padStart(2, "0"));
    setMinuteText(String(initial.minute).padStart(2, "0"));
    setMode("hour");
    setOpen(true);
    dialog.current?.showModal();
  }
  function close() { dialog.current?.close(); }
  function updatePart(selection: ClockSelection, value: number) {
    setDraft((previous) => ({ ...previous, [selection]: value }));
    if (selection === "hour") setHourText(String(value).padStart(2, "0"));
    else setMinuteText(String(value).padStart(2, "0"));
  }
  function typePart(selection: ClockSelection, value: string) {
    if (selection === "hour") setHourText(value);
    else setMinuteText(value);
    if (validClockPart(value, selection)) setDraft((previous) => ({ ...previous, [selection]: Number(value) }));
  }
  function updateFromPointer(event: PointerEvent<HTMLDivElement>, selection: ClockSelection) {
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - rect.left - rect.width / 2;
    const dy = event.clientY - rect.top - rect.height / 2;
    if (Math.hypot(dx, dy) < 15) return;
    const selected = clockValueFromPoint(dx, dy, selection);
    updatePart(selection, selected);
  }
  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    const hand = event.target instanceof Element ? event.target.closest("[data-clock-hand]")?.getAttribute("data-clock-hand") : null;
    const selection = hand === "hour" || hand === "minute" ? hand : mode;
    setMode(selection);
    dragging.current = selection;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
    event.currentTarget.focus();
    updateFromPointer(event, selection);
  }
  function keyboard(event: KeyboardEvent<HTMLDivElement>) {
    const current = draft[mode];
    const min = mode === "hour" ? 1 : 0;
    const max = mode === "hour" ? 12 : 59;
    let next: number;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") next = current === max ? min : current + 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = current === min ? max : current - 1;
    else if (event.key === "Home") next = min;
    else if (event.key === "End") next = max;
    else return;
    event.preventDefault();
    updatePart(mode, next);
  }
  const hourValid = validClockPart(hourText, "hour");
  const minuteValid = validClockPart(minuteText, "minute");
  function confirm() {
    if (!hourValid || !minuteValid) return;
    onChange(toReservationTime(draft));
    close();
  }
  const hourAngle = (draft.hour % 12 + draft.minute / 60) * 30;
  const minuteAngle = draft.minute * 6;
  return (
    <>
      <div className="reservation-time-field">
        <input ref={inputRef} id={id} name="time" className="reservation-input" type="text" readOnly required value={formatReservationTime(value)} placeholder="Select a time" aria-invalid={invalid} aria-describedby={describedBy} aria-haspopup="dialog" aria-controls={dialogId} onClick={show} onBlur={onBlur} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); show(); } }} />
        <button type="button" className="reservation-clock-trigger" onClick={show} aria-label="Choose reservation time" aria-haspopup="dialog" aria-controls={dialogId} aria-expanded={open}><Clock3 size={21} aria-hidden="true" /></button>
      </div>
      <dialog ref={dialog} id={dialogId} className="reservation-clock-dialog" aria-labelledby={`${dialogId}-title`} aria-describedby={`${dialogId}-hint`} onClose={() => { setOpen(false); dragging.current = null; }} onClick={(event) => { if (event.target === event.currentTarget) close(); }} onKeyDown={(event) => { if (event.key === "Enter" && event.target instanceof HTMLInputElement) { event.preventDefault(); confirm(); } }}>
        <div className="clock-dialog-content">
          <div className="flex items-center justify-between gap-3"><h3 id={`${dialogId}-title`} className="text-lg font-bold">Choose your time</h3><button type="button" className="icon-button cursor-pointer" aria-label="Close time picker" onClick={close}><X size={21} aria-hidden="true" /></button></div>
          <p id={`${dialogId}-hint`} className="reservation-hint mt-1">Type a time, tap the dial, or drag a hand. Hours: 1–12. Minutes: 00–59. Arrow keys adjust the focused dial. Times are in IST.</p>
          <div className="clock-digital" aria-label="Selected time">
            <div className="clock-part"><label htmlFor={`${dialogId}-hours`}>Hours</label><input id={`${dialogId}-hours`} type="text" inputMode="numeric" autoComplete="off" maxLength={2} value={hourText} data-active={mode === "hour"} aria-invalid={!hourValid} aria-describedby={`${dialogId}-entry-hint`} onFocus={() => setMode("hour")} onChange={(event) => typePart("hour", event.target.value)} onBlur={() => { if (hourValid) setHourText(String(Number(hourText)).padStart(2, "0")); }} /></div>
            <span aria-hidden="true">:</span>
            <div className="clock-part"><label htmlFor={`${dialogId}-minutes`}>Minutes</label><input id={`${dialogId}-minutes`} type="text" inputMode="numeric" autoComplete="off" maxLength={2} value={minuteText} data-active={mode === "minute"} aria-invalid={!minuteValid} aria-describedby={`${dialogId}-entry-hint`} onFocus={() => setMode("minute")} onChange={(event) => typePart("minute", event.target.value)} onBlur={() => { if (minuteValid) setMinuteText(String(Number(minuteText)).padStart(2, "0")); }} /></div>
            <span className="clock-period-label">{draft.period}</span>
          </div>
          <p id={`${dialogId}-entry-hint`} className={`clock-entry-hint ${!hourValid || !minuteValid ? "reservation-error" : "reservation-hint"}`}>{!hourValid ? "Enter an hour from 1 to 12." : !minuteValid ? "Enter minutes from 00 to 59." : "Edit the numbers above or select on the clock."}</p>
          <div className="clock-picker-layout">
            <div className="reservation-clock-face" role="slider" tabIndex={0} aria-label={mode === "hour" ? "Select hour on clock" : "Select minute on clock"} aria-valuemin={mode === "hour" ? 1 : 0} aria-valuemax={mode === "hour" ? 12 : 59} aria-valuenow={draft[mode]} aria-valuetext={`${draft[mode]} ${mode === "hour" ? `o'clock ${draft.period}` : "minutes"}`} onKeyDown={keyboard} onPointerDown={pointerDown} onPointerMove={(event) => { if (dragging.current) updateFromPointer(event, dragging.current); }} onPointerUp={(event) => { const selection = dragging.current; if (selection) { updateFromPointer(event, selection); dragging.current = null; if (selection === "hour") setMode("minute"); } }} onPointerCancel={() => { dragging.current = null; }} onLostPointerCapture={() => { dragging.current = null; }}>
              <svg viewBox="0 0 240 240" aria-hidden="true">
                <circle cx="120" cy="120" r="117" fill="#fafaf7" stroke="#e5e5e5" />
                {Array.from({ length: 60 }, (_, index) => <line key={`tick-${index}`} x1="120" y1={index % 5 === 0 ? 13 : 17} x2="120" y2="21" stroke={index % 5 === 0 ? "#888" : "#d8d8d3"} strokeWidth={index % 5 === 0 ? 2 : 1} transform={`rotate(${index * 6} 120 120)`} />)}
                {Array.from({ length: 12 }, (_, index) => {
                  const hour = index || 12;
                  const label = mode === "hour" ? hour : index * 5;
                  const angle = index * Math.PI / 6;
                  const x = 120 + Math.sin(angle) * 88;
                  const y = 120 - Math.cos(angle) * 88;
                  const selected = draft[mode] === label;
                  return <g key={index}><circle cx={x} cy={y} r="14" fill={selected ? "#ffcc00" : "transparent"} /><text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill="#080808" fontSize="14" fontWeight={selected ? "700" : "500"}>{mode === "minute" ? String(label).padStart(2, "0") : label}</text></g>;
                })}
                <g transform={`rotate(${hourAngle} 120 120)`} data-clock-hand="hour"><line x1="120" y1="120" x2="120" y2="66" stroke="transparent" strokeWidth="22" /><line x1="120" y1="120" x2="120" y2="66" stroke="#080808" strokeWidth="6" strokeLinecap="round" /></g>
                <g transform={`rotate(${minuteAngle} 120 120)`} data-clock-hand="minute"><line x1="120" y1="120" x2="120" y2="45" stroke="transparent" strokeWidth="20" /><line x1="120" y1="120" x2="120" y2="45" stroke="#c89f00" strokeWidth="4" strokeLinecap="round" /></g>
                <circle cx="120" cy="120" r="7" fill="#080808" stroke="#ffcc00" strokeWidth="3" />
              </svg>
            </div>
            <div className="clock-periods" aria-label="Time of day">
              {(["AM", "PM"] as const).map((period) => <button type="button" key={period} aria-pressed={draft.period === period} onClick={() => setDraft((previous) => ({ ...previous, period }))}>{period}</button>)}
            </div>
          </div>
          <p className="reservation-hint mt-4 text-center">{mode === "hour" ? "Short hand · select the hour" : "Long hand · select the minute"}</p>
          <div className="mt-5 grid grid-cols-2 gap-3"><button type="button" className="clock-cancel" onClick={close}>Cancel</button><button type="button" className="yellow-button min-h-12 cursor-pointer rounded-xl px-3 text-sm" disabled={!hourValid || !minuteValid} onClick={confirm}><Check size={18} aria-hidden="true" />Confirm</button></div>
        </div>
      </dialog>
    </>
  );
}
