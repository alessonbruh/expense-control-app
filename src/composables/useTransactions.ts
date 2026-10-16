import { ref } from 'vue';
import { ExpenseService } from '../modules/expense/services/ExpenseService';
import type {
  ExpenseDTO,
  CreateExpensePayload,
  UpdateExpensePayload,
} from '../modules/expense/dto/ExpenseDTO';

const service = new ExpenseService();

export function useTransactions() {
  const loading = ref(false);

  async function createTransaction(
    payload: CreateExpensePayload,
  ): Promise<ExpenseDTO> {
    const token = localStorage.getItem('token');
    return service.createExpense(payload, token);
  }

  async function updateTransaction(
    payload: UpdateExpensePayload,
  ): Promise<ExpenseDTO> {
    const token = localStorage.getItem('token');
    return service.updateExpense(payload, token);
  }

  async function getTransactionsByDate(start: string, end: string) {
    const token = localStorage.getItem('token');
    return service.getExpenseByDate(start, end, token);
  }

  return {
    createTransaction,
    updateTransaction,
    getTransactionsByDate,
    loading,
  };
}
