export interface BudgetDTO {
  id: string;
  categoryId: string;
  amount: number | string;
  category: { name: string };
}
