import type { CreditCardDTO, InvoiceStatus } from '../dto/CreditCardDTO';

type BillingDays = Pick<CreditCardDTO, 'closingDay' | 'dueDay'>;

const pad = (n: number) => String(n).padStart(2, '0');

function lastDayOf(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function dateInMonth(year: number, monthIndex: number, day: number) {
  const first = new Date(year, monthIndex, 1);
  const y = first.getFullYear();
  const m = first.getMonth();
  return { year: y, monthIndex: m, day: Math.min(day, lastDayOf(y, m)) };
}

export interface InvoicePreview {
  month: string;
  dueDate: string;
}

export function invoiceForPurchase(
  purchaseDate: string,
  { closingDay, dueDay }: BillingDays,
): InvoicePreview {
  const [year, month, day] = purchaseDate.split('-').map(Number);
  const monthIndex = month! - 1;
  const closingThisMonth = dateInMonth(year!, monthIndex, closingDay);

  const closingMonthIndex =
    day! < closingThisMonth.day ? monthIndex : monthIndex + 1;
  const dueMonthIndex =
    dueDay > closingDay ? closingMonthIndex : closingMonthIndex + 1;
  const due = dateInMonth(year!, dueMonthIndex, dueDay);

  return {
    month: `${due.year}-${pad(due.monthIndex + 1)}`,
    dueDate: `${due.year}-${pad(due.monthIndex + 1)}-${pad(due.day)}`,
  };
}

export const invoiceStatusLabels = {
  OPEN: 'Aberta',
  CLOSED: 'Fechada',
  PAID: 'Paga',
} satisfies Record<InvoiceStatus, string>;
