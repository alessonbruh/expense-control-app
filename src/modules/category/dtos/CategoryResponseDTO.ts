export interface CategoryResponseDTO {
  id: string;
  name: string;
  type: 'expense' | 'income';
  position: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}
