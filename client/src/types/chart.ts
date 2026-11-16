// One slot per day of the current week; mood/stress are undefined when there was no check-in.
export type WeekPoint = {
  label: string;
  mood?: number;
  stress?: number;
};
