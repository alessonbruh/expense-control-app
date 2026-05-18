export interface ExpenseResponseDTO {
  amount: number;
  category: CategoryDTO;
}

export interface CategoryDTO {
  name: string;
  type: 'expense' | 'income';
}
