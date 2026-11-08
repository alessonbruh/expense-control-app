import type { InstallmentStatus } from '../../../shared/enums/installment-status';

export interface CreditCardDTO {
  id: string;
  name: string;
  closingDay: number;
  dueDay: number;
}

export interface CreditCardPayload {
  name: string;
  closingDay: number;
  dueDay: number;
}

export type InvoiceStatus = 'OPEN' | 'CLOSED' | 'PAID';

export interface InvoiceInstallmentDTO {
  id: string;
  installmentNum: number;
  totalInstallments: number;
  amount: number | string;
  dueDate: string;
  paymentDate: string | null;
  status: InstallmentStatus;
  expense: {
    id: string;
    description: string;
    date: string;
    category: { name: string };
  };
}

export interface InvoiceDTO {
  creditCard: CreditCardDTO;
  month: string;
  closingDate: string;
  dueDate: string;
  status: InvoiceStatus;
  total: number;
  paidAmount: number;
  pendingAmount: number;
  installments: InvoiceInstallmentDTO[];
}

export interface PayInvoiceResponse {
  message: string;
  invoice: InvoiceDTO;
}
