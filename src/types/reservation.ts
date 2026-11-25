export interface ReservationValues {
  fullName: string;
  email: string;
  phone: string;
  guests: string;
  date: string;
  time: string;
  specialRequests: string;
}
export type ReservationField = keyof ReservationValues;
export type ReservationErrors = Partial<Record<ReservationField | "contact", string>>;
export interface ReservationDetails extends Omit<ReservationValues, "guests"> {
  guests: number;
}
