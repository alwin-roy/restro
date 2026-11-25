import { ContactInfoCard } from "@/components/contact/ContactInfoCard";
import { EnquiryForm } from "@/components/contact/EnquiryForm";

export function ContactSection() {
  return <section id="contact" className="contact-section py-16 sm:py-20 lg:py-24" aria-labelledby="contact-heading"><div className="categories-container">
    <div className="mx-auto max-w-[660px] text-center"><p className="contact-eyebrow">Get In Touch</p><h2 id="contact-heading" className="categories-heading mt-3">Contact <span className="text-primary">Us</span></h2><span className="mx-auto mt-5 block h-[3px] w-14 rounded-full bg-primary" aria-hidden="true" /><p className="mx-auto mt-6 max-w-[550px] text-base leading-[1.8] text-[#666]">Have a question, feedback, or want to plan a special event? We&apos;d love to hear from you.</p></div>
    <div className="contact-layout mt-10 sm:mt-12"><ContactInfoCard /><EnquiryForm /></div>
  </div></section>;
}
