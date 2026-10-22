import type { BudgetDTO } from '../dto/BudgetDTO';
import {
  expireSession,
  getToken,
  SessionExpiredError,
} from '../../../shared/auth/session';

const API_URL = import.meta.env.VITE_API_URL;

export class BudgetService {
  private baseUrl = `${API_URL}/budget`;

  private async request<T>(
    path: string,
    method: string,
    body?: unknown,
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          ...(body ? { 'Content-Type': 'application/json' } : {}),
          Authorization: `Bearer ${getToken()}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const result = response.status === 204 ? null : await response.json();

      if (response.status === 401) {
        expireSession();
        throw new SessionExpiredError();
      }
      if (!response.ok)
        throw new Error(result?.message || 'Erro ao processar requisição');
      return result as T;
    } catch (error: any) {
      if (error instanceof SessionExpiredError) throw error;
      throw new Error(error.message || 'Erro ao conectar com o servidor');
    }
  }

  list(): Promise<BudgetDTO[]> {
    return this.request<BudgetDTO[]>('', 'GET');
  }

  save(categoryId: string, amount: number): Promise<BudgetDTO> {
    return this.request<BudgetDTO>(`/${categoryId}`, 'PUT', { amount });
  }

  remove(categoryId: string): Promise<null> {
    return this.request<null>(`/${categoryId}`, 'DELETE');
  }
}
