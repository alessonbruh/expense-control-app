export interface CategoryResponseDTO {
  id: string;
  name: string;
  type: 'expense' | 'income';
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  userId: string;
}
