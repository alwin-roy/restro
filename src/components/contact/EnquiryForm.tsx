"use client";

import { Send } from "lucide-react";
import { type ChangeEvent, type FormEvent, useId, useRef, useState, useSyncExternalStore } from "react";
import { ENQUIRY_MESSAGE_LIMIT, firstInvalidEnquiryField, validateEnquiry } from "@/lib/validations/enquiry";
import { enquirySubjects } from "@/data/enquirySubjects";
import type { EnquiryErrors, EnquiryValues } from "@/types/enquiry";

const empty: EnquiryValues = { name: "", email: "", phone: "", subject: "", message: "" };

export function EnquiryForm() {
  const id = useId();
  const ready = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [values, setValues] = useState<EnquiryValues>(empty);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [validPreview, setValidPreview] = useState(false);
  const inputs = useRef<Partial<Record<keyof EnquiryValues, HTMLElement | null>>>({});

  function props(field: keyof EnquiryValues, hint?: string) {
    return {
      id: fieldId(field),
      name: field,
      value: values[field],
      "aria-invalid": !!errors[field],
      "aria-describedby": [hint, errors[field] ? `${fieldId(field)}-error` : ""].filter(Boolean).join(" ") || undefined,
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const value = event.target.value;
        setValues((previous) => ({ ...previous, [field]: value }));
        setValidPreview(false);
      },
    };
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = validateEnquiry(values);
    setErrors(result.errors);
    const firstField = firstInvalidEnquiryField(result.errors);
    if (firstField && inputs.current[firstField]) {
      inputs.current[firstField]?.focus();
      return;
    }
    setValidPreview(!!result.details);
  }

  const fieldId = (name: string) => `${id}-${name}`;
  const error = (field: keyof EnquiryErrors) => errors[field] ? <p id={`${fieldId(field)}-error`} className="reservation-error">{errors[field]}</p> : null;

  return (
    <form className="contact-form-card" noValidate onSubmit={submit} aria-labelledby={`${id}-heading`} aria-describedby={`${id}-notice`}>
      <h3 id={`${id}-heading`} className="sr-only">Customer enquiry</h3>
      <fieldset disabled={!ready} className="contact-form-grid min-w-0 border-0 p-0">
        <legend className="sr-only">Enquiry details</legend>
        <div>
          <label htmlFor={fieldId("name")} className="reservation-label">Your Name <span aria-hidden="true">*</span></label>
          <input {...props("name")} ref={(node) => { inputs.current.name = node; }} className="reservation-input" type="text" autoComplete="name" maxLength={100} required placeholder="Enter your full name" />
          {error("name")}
        </div>
        <div>
          <label htmlFor={fieldId("email")} className="reservation-label">Email Address <span aria-hidden="true">*</span></label>
          <input {...props("email")} ref={(node) => { inputs.current.email = node; }} className="reservation-input" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} maxLength={254} required placeholder="you@example.com" />
          {error("email")}
        </div>
        <div>
          <label htmlFor={fieldId("phone")} className="reservation-label">Phone Number <span className="font-normal text-[#777]">(Optional)</span></label>
          <div className="reservation-phone">
            <span aria-hidden="true">+91</span>
            <input {...props("phone", `${id}-phone-hint`)} ref={(node) => { inputs.current.phone = node; }} className="reservation-input" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} placeholder="10-digit phone number" />
          </div>
          <p id={`${id}-phone-hint`} className="reservation-hint mt-2">India (+91). Enter 10 digits only.</p>
          {error("phone")}
        </div>
        <div>
          <label htmlFor={fieldId("subject")} className="reservation-label">Subject <span aria-hidden="true">*</span></label>
          <select {...props("subject")} ref={(node) => { inputs.current.subject = node; }} className="reservation-input" required>
            <option value="">Select a subject</option>
            {enquirySubjects.map((subject) => <option key={subject.value} value={subject.value}>{subject.label}</option>)}
          </select>
          {error("subject")}
        </div>
        <div className="contact-form-wide">
          <label htmlFor={fieldId("message")} className="reservation-label">Message <span aria-hidden="true">*</span></label>
          <textarea {...props("message", `${id}-message-count`)} ref={(node) => { inputs.current.message = node; }} className="reservation-input contact-message" rows={6} required minLength={10} maxLength={ENQUIRY_MESSAGE_LIMIT} placeholder="Write your message here..." />
          <p id={`${id}-message-count`} className="reservation-hint mt-2 text-right">{values.message.length}/{ENQUIRY_MESSAGE_LIMIT} characters · minimum 10</p>
          {error("message")}
        </div>
        <div className="contact-form-wide">
          <p id={`${id}-notice`} className="reservation-hint mb-5">Have a question or message? Fill out the form below. Fields marked * are required.</p>
          {Object.keys(errors).length > 0 && <p className="reservation-error mb-4" role="alert">Please review the highlighted fields before continuing.</p>}
          <button type="submit" className="yellow-button contact-submit">Send Message<Send size={18} aria-hidden="true" /></button>
        </div>
      </fieldset>
      <div role="status" aria-live="polite" aria-atomic="true">
        {validPreview && <p className="reservation-preview mt-6">Enquiry preview ready. Nothing has been sent or saved.</p>}
      </div>
    </form>
  );
}
