import { ref } from 'vue';
import { ExpenseService } from '../modules/expense/services/ExpenseService';
import type {
  ExpenseDTO,
  CreateExpensePayload,
  UpdateExpensePayload,
} from '../modules/expense/dto/ExpenseDTO';

import { getToken } from '../shared/auth/session';

const service = new ExpenseService();

export function useTransactions() {
  const loading = ref(false);

  async function createTransaction(
    payload: CreateExpensePayload,
  ): Promise<ExpenseDTO> {
    const token = getToken();
    return service.createExpense(payload, token);
  }

  async function updateTransaction(
    payload: UpdateExpensePayload,
  ): Promise<ExpenseDTO> {
    const token = getToken();
    return service.updateExpense(payload, token);
  }

  async function getTransactionsByDate(start: string, end: string) {
    const token = getToken();
    return service.getExpenseByDate(start, end, token);
  }

  return {
    createTransaction,
    updateTransaction,
    getTransactionsByDate,
    loading,
  };
}
