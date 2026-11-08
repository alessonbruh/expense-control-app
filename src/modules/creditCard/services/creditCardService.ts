import type {
  CreditCardDTO,
  CreditCardPayload,
  InvoiceDTO,
  PayInvoiceResponse,
} from '../dto/CreditCardDTO';
import {
  expireSession,
  getToken,
  SessionExpiredError,
} from '../../../shared/auth/session';

const API_URL = import.meta.env.VITE_API_URL;

export class CreditCardService {
  private baseUrl = `${API_URL}/credit-card`;

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

  list(): Promise<CreditCardDTO[]> {
    return this.request<CreditCardDTO[]>('', 'GET');
  }

  create(payload: CreditCardPayload): Promise<CreditCardDTO> {
    return this.request<CreditCardDTO>('', 'POST', payload);
  }

  update(
    id: string,
    payload: Partial<CreditCardPayload>,
  ): Promise<CreditCardDTO> {
    return this.request<CreditCardDTO>(`/${id}`, 'PUT', payload);
  }

  remove(id: string): Promise<null> {
    return this.request<null>(`/${id}`, 'DELETE');
  }

  getInvoice(id: string, month: string): Promise<InvoiceDTO> {
    return this.request<InvoiceDTO>(`/${id}/invoices/${month}`, 'GET');
  }

  async payInvoice(
    id: string,
    month: string,
    paymentDate: string,
  ): Promise<InvoiceDTO> {
    const result = await this.request<PayInvoiceResponse>(
      `/${id}/invoices/${month}/pay`,
      'POST',
      { paymentDate },
    );
    return result.invoice;
  }
}
