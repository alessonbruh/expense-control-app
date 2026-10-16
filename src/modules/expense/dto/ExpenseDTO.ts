import type { PaymentMethod } from '../../../shared/enums/payment-method';
import type { InstallmentStatus } from '../../../shared/enums/installment-status';

export interface ExpenseCategoryDTO {
  id?: string;
  name: string;
  type?: 'income' | 'expense';
}

export interface InstallmentDTO {
  id: string;
  installmentNum: number; // nº da parcela (1, 2, 3…)
  totalInstallments: number;
  amount: number | string; // Decimal do Prisma chega como string
  dueDate: string; // ISO string
  paymentDate: string | null; // ISO string
  status: InstallmentStatus;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  expenseId: string;
}

export interface ExpenseDTO {
  id: string;
  description: string;
  amount: number | string; // Decimal do Prisma chega como string
  paymentMethod: PaymentMethod;
  categoryId: string;
  category: ExpenseCategoryDTO;
  installments: InstallmentDTO[];
  userId: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface CreateExpensePayload {
  amount: number;
  categoryId: string;
  description?: string;
  paymentMethod: PaymentMethod;
  installments: number;
  firstDueDate?: string; // "YYYY-MM-DD"
}

export interface UpdateExpensePayload {
  id: string;
  description?: string;
  amount?: number;
  paymentMethod?: PaymentMethod;
  categoryId?: string;
  installments?: number;
  firstDueDate?: string; // "YYYY-MM-DD"
}

export interface SaveExpenseResponse {
  message: string;
  expense: ExpenseDTO;
}
