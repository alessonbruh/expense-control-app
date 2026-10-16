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

export function formatMonthLabel(date: Date): string {
  const label = date.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}
