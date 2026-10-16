import { computed, ref } from 'vue';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

// Sem escolha salva, segue a preferência do sistema operacional
function initialTheme(): Theme {
  return (
    readStoredTheme() ??
    (window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light')
  );
}

// Estado global: todos os componentes enxergam o mesmo tema
const theme = ref<Theme>(initialTheme());

function applyTheme(value: Theme) {
  document.documentElement.classList.toggle('dark', value === 'dark');
}

applyTheme(theme.value);

export function useTheme() {
  const isDark = computed(() => theme.value === 'dark');

  function setTheme(value: Theme) {
    theme.value = value;
    applyTheme(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Sem storage (ex.: aba privada): o tema vale só nesta sessão
    }
  }

  function toggleTheme() {
    setTheme(isDark.value ? 'light' : 'dark');
  }

  return { theme, isDark, setTheme, toggleTheme };
}
