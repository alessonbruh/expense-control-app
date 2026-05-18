export interface ExpenseCategoryDTO {
  id?: string;
  name: string;
  type?: 'income' | 'expense';
}

export interface ExpenseDTO {
  id: string;
  amount: number;
  category: ExpenseCategoryDTO;
  createdAt: string; // ISO string
  note?: string;
  type: 'income' | 'expense';
}

export interface CreateExpensePayload {
  amount: number;
  category: string;
  date: string; // "YYYY-MM-DD"
  note?: string;
  type: 'income' | 'expense';
}
