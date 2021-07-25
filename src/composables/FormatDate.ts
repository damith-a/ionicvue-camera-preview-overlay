import { format, isToday, parse } from "date-fns";

export function useFormatDate() {
  const formatDate = (isoDate: Date, f: string) => {
    const date = parse(isoDate);

    if (f) {
      return format(date, f);
    }

    if (isToday(date)) {
      return format(date, "HH:mm");
    }

    return format(date, "yyyy-MM-dd HH:mm");
  };

  const toLocalISODate = (date: Date) => {
    return format(date, "yyyy-MM-dd'T'HH:mm:ss");
  };

  return { formatDate, toLocalISODate };
}
