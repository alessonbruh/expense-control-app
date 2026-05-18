import type { ExpenseDTO, CreateExpensePayload } from '../dto/ExpenseDTO';
import type { ExpenseResponseDTO } from '../../dashboard/dtos/ExpenseResponseDTO';

const API_URL = import.meta.env.VITE_API_URL;

export class ExpenseService {
  private baseUrl = `${API_URL}/expense`;

  async createExpense(
    payload: CreateExpensePayload,
    token?: string | null,
  ): Promise<ExpenseDTO> {
    const res = await fetch(`${this.baseUrl}/expense`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Erro ao criar transação');
    return res.json();
  }

  async getExpenseByDate(
    initialDate: string,
    finalDate: string,
    token: string | null,
  ): Promise<ExpenseResponseDTO[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${initialDate}/$${finalDate}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await response.json();

      if (!response.ok)
        throw new Error(result.message || 'Erro ao buscar dados');
      return result as ExpenseResponseDTO[];
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao conectar com o servidor');
    }
  }
}
