import type { ExpenseResponseDTO } from '../../expense/dto/ExpenseResponseDTO';
import { MAX_SLICES } from './chartPalette';

export interface ChartSlice {
  name: string;
  value: number;
  isOthers: boolean;
}

export interface MonthSummary {
  incomeTotal: number;
  expenseTotal: number;
  slices: ChartSlice[];
}

export function summarizeMonth(expenses: ExpenseResponseDTO[]): MonthSummary {
  const byCategory: Record<string, number> = {};
  let incomeTotal = 0;
  let expenseTotal = 0;

  for (const item of expenses) {
    const amount = item.installments
      .filter(installment => installment.status !== 'CANCELED')
      .reduce((sum, installment) => sum + Number(installment.amount), 0);

    if (item.category.type === 'expense') {
      expenseTotal += amount;
      byCategory[item.category.name] =
        (byCategory[item.category.name] ?? 0) + amount;
    } else {
      incomeTotal += amount;
    }
  }

  const sorted = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value, isOthers: false }));

  const slices = sorted.slice(0, MAX_SLICES);
  const rest = sorted.slice(MAX_SLICES);
  if (rest.length) {
    slices.push({
      name: 'Outros',
      value: rest.reduce((sum, slice) => sum + slice.value, 0),
      isOthers: true,
    });
  }

  return { incomeTotal, expenseTotal, slices };
}
