export const formatDateTime = (date?: string) => {
  if (!date) return "";

  const d = new Date(date);
  const year = d.getFullYear();

  if (isNaN(d.getTime())) return "";

  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
  }).format(d);

  const monthDay = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
  }).format(d);

  const time = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);

  return `${weekday}, ${monthDay}, ${year} at ${time}`;
};

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];