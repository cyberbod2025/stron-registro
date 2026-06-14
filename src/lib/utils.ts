import { ClassSession } from "../types";

export const formatDisplayDate = (session?: ClassSession) => {
  if (!session) return "";
  if (session.startsAt) {
    const d = new Date(session.startsAt);
    return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' }).replace(/^\w/, c => c.toUpperCase());
  }
  return session.dateStr;
};
