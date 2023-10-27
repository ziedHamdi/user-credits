export function addDays(date: Date, days: number): Date {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + days);
  return newDate;
}

export function addMonths(date: Date, months: number): Date {
  const newDate = new Date(date);
  newDate.setMonth(date.getMonth() + months);
  return newDate;
}

export function addYears(date: Date, years: number): Date {
  const newDate = new Date(date);
  newDate.setFullYear(date.getFullYear() + years);
  return newDate;
}

export function addSeconds(date: Date, seconds: number): Date {
  const newDate = new Date(date);
  newDate.setSeconds(date.getSeconds() + seconds);
  return newDate;
}
