import type { Cadence, RecurringExpense as DBExpense } from "@/lib/db";

export const PAYMENTS_PER_YEAR = {
  weekly: 52,
  biweekly: 26,
  monthly: 12,
  quarterly: 4,
  yearly: 1,
} as const satisfies Record<Cadence, number>;

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function addWeeks(date: Date, weeks: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

export function addYears(date: Date, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

export function addQuarters(date: Date, quarters: number): Date {
  return addMonths(date, quarters * 3);
}

export function getNextOccurrence(startsOnISO: string, cadence: Cadence): Date {
  const now = new Date();
  let next = new Date(startsOnISO);
  if (isNaN(next.getTime())) next = new Date();

  const increment = (d: Date) => {
    switch (cadence) {
      case "weekly":
        return addWeeks(d, 1);
      case "biweekly":
        return addWeeks(d, 2);
      case "monthly":
        return addMonths(d, 1);
      case "quarterly":
        return addQuarters(d, 1);
      case "yearly":
        return addYears(d, 1);
      default:
        return addMonths(d, 1);
    }
  };

  if (next > now) return next;
  let safety = 0;
  while (next <= now && safety < 300) {
    next = increment(next);
    safety += 1;
  }
  return next;
}

export function pluralize(value: number, unit: string): string {
  return `${value} ${unit}${value === 1 ? "" : "s"}`;
}

export function daysBetween(a: Date, b: Date): number {
  const ms =
    Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) -
    Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function computeTotals(expenses: DBExpense[]) {
  let yearly = 0;
  let monthly = 0;
  let weekly = 0;

  for (const e of expenses) {
    const paymentsPerYear = PAYMENTS_PER_YEAR[e.cadence];
    yearly += e.amount * paymentsPerYear;
    monthly += (e.amount * paymentsPerYear) / 12;
    weekly += (e.amount * paymentsPerYear) / 52;
  }

  return { yearly, monthly, weekly };
}


