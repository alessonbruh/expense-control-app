// Datas sempre no fuso local: toISOString() usa UTC e pode mudar o dia.

const pad = (n: number) => String(n).padStart(2, '0');

export function toDateInput(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function getMonthRange(date: Date): { start: string; end: string } {
  const first = startOfMonth(date);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start: toDateInput(first), end: toDateInput(last) };
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/**
 * "2026-11-10T00:00:00.000Z" -> "10/11". Usa só a parte da data: converter com
 * new Date() no fuso local mostraria o dia anterior.
 */
export function formatDueDay(isoDate: string): string {
  const [, month, day] = isoDate.split('T')[0]!.split('-');
  return `${day}/${month}`;
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export function parseMonthKey(key: string): Date {
  const [year, month] = key.split('-').map(Number);
  return new Date(year!, month! - 1, 1);
}

export function lastMonthKeys(end: Date, count: number): string[] {
  return Array.from({ length: count }, (_, index) =>
    monthKey(addMonths(end, index - count + 1)),
  );
}

export function formatShortMonth(key: string): string {
  const date = parseMonthKey(key);
  const month = date
    .toLocaleDateString('pt-BR', { month: 'short' })
    .replace('.', '');
  return `${month}/${String(date.getFullYear()).slice(-2)}`;
}

export function formatMonthLabel(date: Date): string {
  const label = date.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}
