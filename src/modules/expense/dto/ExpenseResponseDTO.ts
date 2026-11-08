import type { ExpenseCreditCardDTO, InstallmentDTO } from './ExpenseDTO';
import type { PaymentMethod } from '../../../shared/enums/payment-method';

// A busca por período retorna apenas as parcelas com vencimento no período.
export interface ExpenseResponseDTO {
  id: string;
  description: string;
  amount: number | string;
  paymentMethod: PaymentMethod;
  date: string;
  category: CategoryDTO;
  installments: InstallmentDTO[];
  creditCard?: ExpenseCreditCardDTO | null;
}

export interface CategoryDTO {
  name: string;
  type: 'expense' | 'income';
}
