import { enquirySubjects } from "@/data/enquirySubjects";
import type { EnquiryDetails, EnquiryErrors, EnquiryField, EnquirySubject, EnquiryValues } from "@/types/enquiry";

export const ENQUIRY_MESSAGE_LIMIT = 2000;
export const enquiryFieldOrder: EnquiryField[] = ["name", "email", "phone", "subject", "message"];

export function isValidContactEmail(email: string): boolean {
  const pieces = email.split("@");
  if (pieces.length !== 2 || email.length > 254) return false;
  const [local, domain] = pieces;
  const labels = domain.split(".");
  return local.length >= 1 && local.length <= 64 && /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)
    && !local.startsWith(".") && !local.endsWith(".") && !local.includes("..")
    && labels.length >= 2 && labels.every((label) => /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(label))
    && /^[A-Za-z]{2,63}$/.test(labels[labels.length - 1]);
}

export function validateEnquiry(input: EnquiryValues) {
  const values = { ...input, name: input.name.normalize("NFC").trim().replace(/\s+/gu, " "), email: input.email.trim(), message: input.message.trim() };
  const errors: EnquiryErrors = {};
  const nameLength = Array.from(values.name).length;
  if (!nameLength) errors.name = "Please enter your name.";
  else if (nameLength < 2 || nameLength > 100) errors.name = "Your name must contain 2–100 characters.";
  else if (!/^\p{L}[\p{L}\p{M}]*(?: \p{L}[\p{L}\p{M}]*)*$/u.test(values.name)) errors.name = "Use letters and spaces only, without numbers or symbols.";
  if (!values.email) errors.email = "Please enter your email address.";
  else if (!isValidContactEmail(values.email)) errors.email = "Please enter a valid email address, such as you@example.com.";
  if (values.phone && !/^[0-9]{10}$/.test(values.phone)) errors.phone = "Please enter exactly 10 digits, without spaces or a country code.";
  if (!enquirySubjects.some((subject) => subject.value === values.subject)) errors.subject = "Please select a subject from the list.";
  if (values.message.length < 10) errors.message = "Please write a message of at least 10 characters.";
  else if (values.message.length > ENQUIRY_MESSAGE_LIMIT) errors.message = `Please keep your message within ${ENQUIRY_MESSAGE_LIMIT} characters.`;
  const details: EnquiryDetails | null = Object.keys(errors).length ? null : { ...values, subject: values.subject as EnquirySubject, phone: values.phone ? `+91${values.phone}` : "" };
  return { values, errors, details };
}
export const firstInvalidEnquiryField = (errors: EnquiryErrors) => enquiryFieldOrder.find((field) => errors[field]);
