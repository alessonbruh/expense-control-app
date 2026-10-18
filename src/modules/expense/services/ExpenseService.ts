import type {
  ExpenseDTO,
  CreateExpensePayload,
  UpdateExpensePayload,
  SaveExpenseResponse,
} from '../dto/ExpenseDTO';
import type { ExpenseResponseDTO } from '../dto/ExpenseResponseDTO';
import {
  expireSession,
  SessionExpiredError,
} from '../../../shared/auth/session';

const API_URL = import.meta.env.VITE_API_URL;

export class ExpenseService {
  private baseUrl = `${API_URL}/expense`;

  private async request<T>(
    url: string,
    method: string,
    token?: string | null,
    body?: unknown,
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const result = await response.json();

      if (response.status === 401) {
        expireSession();
        throw new SessionExpiredError();
      }
      if (!response.ok)
        throw new Error(result.message || 'Erro ao processar requisição');
      return result as T;
    } catch (error: any) {
      if (error instanceof SessionExpiredError) throw error;
      throw new Error(error.message || 'Erro ao conectar com o servidor');
    }
  }

  async createExpense(
    payload: CreateExpensePayload,
    token?: string | null,
  ): Promise<ExpenseDTO> {
    const result = await this.request<SaveExpenseResponse>(
      this.baseUrl,
      'POST',
      token,
      payload,
    );
    return result.expense;
  }

  async updateExpense(
    payload: UpdateExpensePayload,
    token?: string | null,
  ): Promise<ExpenseDTO> {
    const result = await this.request<SaveExpenseResponse>(
      this.baseUrl,
      'PUT',
      token,
      payload,
    );
    return result.expense;
  }

  async findById(id: string, token?: string | null): Promise<ExpenseDTO> {
    return this.request<ExpenseDTO>(`${this.baseUrl}/${id}`, 'GET', token);
  }

  async getExpenseByDate(
    initialDate: string,
    finalDate: string,
    token: string | null,
  ): Promise<ExpenseResponseDTO[]> {
    return this.request<ExpenseResponseDTO[]>(
      `${this.baseUrl}/${initialDate}/${finalDate}`,
      'GET',
      token,
    );
  }
}
