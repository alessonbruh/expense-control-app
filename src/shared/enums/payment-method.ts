export const PaymentMethod = {
  CASH: 'CASH',
  CARD: 'CARD',
  PIX: 'PIX',
  BOLETO: 'BOLETO',
  TRANSFER: 'TRANSFER',
  OTHER: 'OTHER',
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const paymentMethodLabels = {
  CASH: 'Dinheiro',
  CARD: 'Cartão',
  PIX: 'PIX',
  BOLETO: 'Boleto',
  TRANSFER: 'Transferência',
  OTHER: 'Outro',
} satisfies Record<PaymentMethod, string>;
