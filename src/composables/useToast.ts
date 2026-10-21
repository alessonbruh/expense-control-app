import { ref } from 'vue';
import { SessionExpiredError } from '../shared/auth/session';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

// Estado global: qualquer componente dispara, o ToastContainer (App.vue) exibe.
const toasts = ref<Toast[]>([]);
let nextId = 0;

function dismiss(id: number) {
  toasts.value = toasts.value.filter(toast => toast.id !== id);
}

function show(message: string, type: ToastType = 'info', duration = 4000) {
  const id = nextId++;
  toasts.value.push({ id, type, message });
  setTimeout(() => dismiss(id), duration);
}

export function useToast() {
  return {
    toasts,
    dismiss,
    success: (message: string) => show(message, 'success'),
    error: (message: string) => show(message, 'error', 6000),
    info: (message: string) => show(message, 'info'),
    // Erro de uma chamada à API. Sessão expirada já foi avisada: não duplica.
    fromError: (err: unknown, fallback: string) => {
      if (err instanceof SessionExpiredError) return;
      show((err instanceof Error && err.message) || fallback, 'error', 6000);
    },
  };
}
