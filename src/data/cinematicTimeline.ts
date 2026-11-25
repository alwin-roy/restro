/** Observed from the supplied film; seconds, not assumed equal scene lengths. */
export const cinematicTimeline = [
  { selector: '.cinema-hero', time: 0, image: 'poster', label: 'Arrival' },
  { selector: '.food-marquee', time: 3.2, image: 'interior', label: 'Enter Restro' },
  { selector: '.offers-section', time: 7, image: 'interior', label: 'The dining room' },
  { selector: '.food-categories', time: 19.5, image: 'kitchen', label: 'The open kitchen' },
  { selector: '#reservation', time: 34.5, image: 'table', label: 'Your table awaits' },
  { selector: '#reviews', time: 41.5, image: 'guests', label: 'Shared moments' },
  { selector: '#contact', time: 49.5, image: 'final', label: 'Stay a little longer' },
  { selector: '.site-footer', time: 54, image: 'final', label: 'Until next time' },
] as const;
