import type { ExpenseResponseDTO } from '../../expense/dto/ExpenseResponseDTO';

export interface MonthTotals {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface EvolutionSummary {
  totalBalance: number;
  averageExpense: number;
  expenseTrend: number | null;
}

const TREND_MONTHS = 3;

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function buildMonthlyTotals(
  expenses: ExpenseResponseDTO[],
  months: string[],
): MonthTotals[] {
  const totals = new Map(
    months.map(month => [month, { income: 0, expense: 0 }]),
  );

  for (const expense of expenses) {
    for (const installment of expense.installments) {
      if (installment.status === 'CANCELED') continue;

      const total = totals.get(installment.dueDate.slice(0, 7));
      if (!total) continue;

      if (expense.category.type === 'income')
        total.income += Number(installment.amount);
      else total.expense += Number(installment.amount);
    }
  }

  return months.map(month => {
    const { income, expense } = totals.get(month)!;
    return { month, income, expense, balance: income - expense };
  });
}

export function summarizeEvolution(months: MonthTotals[]): EvolutionSummary {
  const monthsWithData = months.filter(
    month => month.income > 0 || month.expense > 0,
  );
  const recent = months.slice(-TREND_MONTHS).map(month => month.expense);
  const previous = months
    .slice(-TREND_MONTHS * 2, -TREND_MONTHS)
    .map(month => month.expense);
  const previousAverage = average(previous);

  return {
    totalBalance: months.reduce((sum, month) => sum + month.balance, 0),
    averageExpense: average(monthsWithData.map(month => month.expense)),
    expenseTrend:
      previousAverage > 0
        ? ((average(recent) - previousAverage) / previousAverage) * 100
        : null,
  };
}
