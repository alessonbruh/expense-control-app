export const PaymentMethod = {
  CASH: 'CASH',
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
  PIX: 'PIX',
  BOLETO: 'BOLETO',
  TRANSFER: 'TRANSFER',
  OTHER: 'OTHER',
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const paymentMethodLabels = {
  CASH: 'Dinheiro',
  CREDIT_CARD: 'Cartão de crédito',
  DEBIT_CARD: 'Cartão de débito',
  PIX: 'PIX',
  BOLETO: 'Boleto',
  TRANSFER: 'Transferência',
  OTHER: 'Outro',
} satisfies Record<PaymentMethod, string>;

const immediateMethods = new Set<PaymentMethod>([
  PaymentMethod.CASH,
  PaymentMethod.DEBIT_CARD,
  PaymentMethod.PIX,
  PaymentMethod.TRANSFER,
]);

export function isImmediatePayment(method: PaymentMethod): boolean {
  return immediateMethods.has(method);
}
