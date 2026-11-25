import type { enquirySubjects } from "@/data/enquirySubjects";

export type EnquirySubject = typeof enquirySubjects[number]["value"];
export interface EnquiryValues { name: string; email: string; phone: string; subject: string; message: string; }
export type EnquiryField = keyof EnquiryValues;
export type EnquiryErrors = Partial<Record<EnquiryField, string>>;
export interface EnquiryDetails extends Omit<EnquiryValues, "subject"> { subject: EnquirySubject; }
