export const InstallmentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  CANCELED: 'CANCELED',
} as const;

export type InstallmentStatus =
  (typeof InstallmentStatus)[keyof typeof InstallmentStatus];

export const installmentStatusLabels = {
  PENDING: 'Pendente',
  PAID: 'Paga',
  CANCELED: 'Cancelada',
} satisfies Record<InstallmentStatus, string>;
