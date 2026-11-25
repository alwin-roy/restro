import { ReservationForm } from "@/components/reservation/ReservationForm";
import { ReservationExperience } from './ReservationExperience';

export function ReservationSection() {
  return (
    <section id="reservation" className="reservation-section py-16 sm:py-20 lg:py-24" aria-labelledby="reservation-heading">
      <div className="categories-container">
        <ReservationExperience><ReservationForm /></ReservationExperience>
      </div>
    </section>
  );
}
