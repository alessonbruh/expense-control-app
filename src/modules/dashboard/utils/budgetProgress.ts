import type { BudgetDTO } from '../../budget/dto/BudgetDTO';
import type { ExpenseResponseDTO } from '../../expense/dto/ExpenseResponseDTO';
import { monthAmount } from './summarizeMonth';

export type BudgetLevel = 'ok' | 'warning' | 'over';

export interface BudgetProgress {
  categoryId: string;
  name: string;
  limit: number;
  spent: number;
  percent: number;
  level: BudgetLevel;
}

const WARNING_PERCENT = 80;

function levelFor(percent: number): BudgetLevel {
  if (percent > 100) return 'over';
  if (percent >= WARNING_PERCENT) return 'warning';
  return 'ok';
}

export function buildBudgetProgress(
  budgets: BudgetDTO[],
  expenses: ExpenseResponseDTO[],
): BudgetProgress[] {
  const spentByCategory = new Map<string, number>();

  for (const expense of expenses) {
    if (expense.category.type !== 'expense') continue;
    const name = expense.category.name;
    spentByCategory.set(
      name,
      (spentByCategory.get(name) ?? 0) + monthAmount(expense),
    );
  }

  return budgets.map(budget => {
    const limit = Number(budget.amount);
    const spent = spentByCategory.get(budget.category.name) ?? 0;
    const percent = (spent / limit) * 100;

    return {
      categoryId: budget.categoryId,
      name: budget.category.name,
      limit,
      spent,
      percent,
      level: levelFor(percent),
    };
  });
}
