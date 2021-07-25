import { format, isToday, parseISO } from "date-fns";

export const formatDate = (isoDate, f) => {
  const date = parseISO(isoDate);

  if (f) {
    return format(date, f);
  }

  if (isToday(date)) {
    return format(date, "HH:mm");
  }

  return format(date, "yyyy-MM-dd HH:mm");
};

export const toLocalISODate = (date) => {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss");
};
