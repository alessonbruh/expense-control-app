import type { CategoryResponseDTO } from '../dtos/CategoryResponseDTO';
import {
  expireSession,
  SessionExpiredError,
} from '../../../shared/auth/session';

const API_URL = import.meta.env.VITE_API_URL;

export class CategoryService {
  private baseUrl = `${API_URL}/category`;

  async listCategory(token: string | null): Promise<CategoryResponseDTO[]> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();

      if (response.status === 401) {
        expireSession();
        throw new SessionExpiredError();
      }
      if (!response.ok)
        throw new Error(result.message || 'Erro ao buscar dados');
      return result as CategoryResponseDTO[];
    } catch (error: any) {
      if (error instanceof SessionExpiredError) throw error;
      throw new Error(error.message || 'Erro ao conectar com o servidor');
    }
  }
}
