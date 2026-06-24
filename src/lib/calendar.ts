export function generateGoogleCalendarUrl(
  title: string,
  startDateStr: string,
  startTimeStr: string,
  location: string,
  description: string
): string {
  try {
    // startDateStr might be "Domingo 8:30 a.m. - Day Cardio", but wait, we need actual dates.
    // However, we don't have the explicit Date object, only a display string like "Martes 6:30 p.m. — Casa de Nidia".
    // We must find the next occurrence of that weekday.
    // For V1, we can create a generic event or try to parse the day of the week.
    
    // Quick day mapping for Spanish
    const daysMap: Record<string, number> = {
      'domingo': 0, 'lunes': 1, 'martes': 2, 'miercoles': 3, 'miércoles': 3, 
      'jueves': 4, 'viernes': 5, 'sabado': 6, 'sábado': 6
    };

    const lowerTitle = title.toLowerCase();
    let targetDay = -1;
    for (const day in daysMap) {
      if (lowerTitle.includes(day)) {
        targetDay = daysMap[day];
        break;
      }
    }

    const now = new Date();
    let eventDate = new Date();

    if (targetDay !== -1) {
      // Find next occurrence of targetDay
      let currentDay = now.getDay();
      let diff = targetDay - currentDay;
      if (diff < 0) diff += 7;
      if (diff === 0 && now.getHours() > 21) {
        diff += 7; // If it's the same day but too late, move to next week. (Approximation)
      }
      eventDate.setDate(now.getDate() + diff);
    } else {
      // Fallback: tomorrow
      eventDate.setDate(now.getDate() + 1);
    }

    // Parse time roughly
    let hours = 8;
    let minutes = 0;
    
    // Simple regex to find HH:MM am/pm
    const timeMatch = title.toLowerCase().match(/(\d{1,2}):(\d{2})\s*(a\.?m\.?|p\.?m\.?)/);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
      const isPm = timeMatch[3].includes('p');
      if (isPm && hours !== 12) hours += 12;
      if (!isPm && hours === 12) hours = 0;
    }

    eventDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000); // 1 hour duration

    const formatGCalDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    };

    const start = formatGCalDate(eventDate);
    const end = formatGCalDate(endDate);

    const baseUrl = "https://calendar.google.com/calendar/render";
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `Strong Nation - ${title.split('—')[0]?.trim() || title}`,
      dates: `${start}/${end}`,
      details: description,
      location: location || "Strong Nation",
    });

    return `${baseUrl}?${params.toString()}`;
  } catch (error) {
    console.error("Error generating calendar link:", error);
    // Fallback simple link
    return "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Strong+Nation+Clase";
  }
}
