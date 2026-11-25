export interface Review {
  id: string;
  name: string;
  rating: number;
  content: string;
  source: "demo" | "local";
}
export interface ReviewValues { name: string; rating: number; content: string; }
export type ReviewErrors = Partial<Record<keyof ReviewValues, string>>;
