import { ClassSession } from "../types";

export const formatDisplayDate = (session?: ClassSession) => {
  if (!session) return "";
  if (session.startsAt) {
    const d = new Date(session.startsAt);
    return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' }).replace(/^\w/, c => c.toUpperCase());
  }
  return session.dateStr;
};

export const getWeekCategory = (startsAt?: string): "esta_semana" | "proxima_semana" | "otro" => {
  if (!startsAt) return "otro";
  const date = new Date(startsAt);
  const now = new Date();
  
  now.setHours(0, 0, 0, 0);
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - diffToMonday);
  
  const startOfNextWeek = new Date(startOfThisWeek);
  startOfNextWeek.setDate(startOfThisWeek.getDate() + 7);
  
  const endOfNextWeek = new Date(startOfNextWeek);
  endOfNextWeek.setDate(startOfNextWeek.getDate() + 7);
  
  if (date >= startOfThisWeek && date < startOfNextWeek) {
    return "esta_semana";
  } else if (date >= startOfNextWeek && date < endOfNextWeek) {
    return "proxima_semana";
  }
  return "otro";
};
