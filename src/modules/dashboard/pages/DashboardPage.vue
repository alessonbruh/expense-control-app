<template>
  <div class="min-h-screen p-4 sm:p-6 bg-page text-ink">
    <!-- Header -->
    <header
      class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <h1 class="text-3xl font-bold">Dashboard</h1>
        <p class="text-ink-muted">Bem-vindo ao seu painel de controle!</p>
      </div>

      <div class="flex items-center gap-2">
        <ThemeToggle />
        <button
          @click="openModal = true"
          class="h-9 px-4 cursor-pointer rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition"
        >
          + Novo Lançamento
        </button>
        <button
          type="button"
          @click="logout()"
          :disabled="loggingOut"
          title="Sair da conta"
          class="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-line-strong bg-card px-3 text-sm font-medium text-ink-soft hover:border-red-500/60 hover:text-negative focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          {{ loggingOut ? 'Saindo...' : 'Sair' }}
        </button>
      </div>
    </header>

    <!-- Navegação por mês -->
    <nav class="mb-6 flex items-center gap-2" aria-label="Selecionar mês">
      <button
        @click="changeMonth(-1)"
        :disabled="loading"
        aria-label="Mês anterior"
        class="h-9 w-9 rounded-lg cursor-pointer border border-line-strong text-ink-soft hover:bg-hover transition disabled:opacity-50"
      >
        ←
      </button>

      <span class="min-w-44 text-center text-lg font-semibold">
        {{ formatMonthLabel(selectedMonth) }}
      </span>

      <button
        @click="changeMonth(1)"
        :disabled="loading"
        aria-label="Próximo mês"
        class="h-9 w-9 rounded-lg cursor-pointer border border-line-strong text-ink-soft hover:bg-hover transition disabled:opacity-50"
      >
        →
      </button>

      <button
        v-if="!isCurrentMonth"
        @click="goToCurrentMonth"
        :disabled="loading"
        class="ml-2 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 text-sm font-medium text-accent hover:bg-emerald-500/20 hover:border-emerald-500/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span aria-hidden="true">↺</span>
        Mês atual
      </button>
    </nav>

    <!-- Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div
        v-for="card in cards"
        :key="card.label"
        class="bg-card border border-line rounded-xl p-4"
      >
        <h2 class="text-ink-muted text-sm">{{ card.label }}</h2>
        <div
          v-if="loading"
          class="mt-2 h-8 w-32 rounded bg-skeleton animate-pulse"
        ></div>
        <p v-else :class="card.color" class="text-2xl font-semibold">
          {{ formatCurrency(card.value) }}
        </p>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Gráfico de pizza -->
      <div class="bg-card border border-line rounded-xl p-4">
        <h2 class="font-semibold mb-4">Distribuição de Despesas do Mês</h2>

        <div
          v-if="loading"
          class="mx-auto h-[300px] w-[300px] max-w-full rounded-full bg-skeleton animate-pulse"
        ></div>
        <p
          v-else-if="pieSeries.length === 0"
          class="flex h-[300px] items-center justify-center text-ink-muted"
        >
          Nenhuma despesa neste mês.
        </p>
        <apexchart
          v-else
          type="donut"
          height="300"
          :options="pieOptions"
          :series="pieSeries"
        />
      </div>
    </div>

    <Modal v-model="openModal" title="Novo Lançamento">
      <ExpenseForm @saved="onTransactionSaved" @cancel="openModal = false" />
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import Modal from '../../../components/ui/Modal.vue';
import ExpenseForm from '../../../components/transactions/ExpenseForm.vue';
import { useTransactions } from '../../../composables/useTransactions';
import { useToast } from '../../../composables/useToast';
import { useTheme } from '../../../composables/useTheme';
import { useAuth } from '../../../composables/useAuth';
import ThemeToggle from '../../../components/ui/ThemeToggle.vue';
import {
  addMonths,
  formatMonthLabel,
  getMonthRange,
  isSameMonth,
  startOfMonth,
} from '../../../shared/utils/date';
import { formatCurrency } from '../../../shared/utils/format';

const { getTransactionsByDate } = useTransactions();
const toast = useToast();
const { isDark } = useTheme();
const { logout, loggingOut } = useAuth();

const openModal = ref(false);
const loading = ref(true);
const selectedMonth = ref(startOfMonth(new Date()));
const expenseTotal = ref(0);
const incomeTotal = ref(0);
const balance = computed(() => incomeTotal.value - expenseTotal.value);

const labelsChartExpense = ref<string[]>([]);
const pieSeries = ref<number[]>([]);
const hasOthersSlice = ref(false);

// Paleta categórica com um tom por tema, validada contra o card de cada um:
// as cores continuam distinguíveis para daltônicos e a % fica legível.
// A ordem importa (cores vizinhas foram validadas em pares), não reordene.
const CHART_THEME = {
  light: {
    colors: [
      '#2a78d6', // azul
      '#eb6834', // laranja
      '#1baf7a', // verde-água
      '#eda100', // amarelo
      '#e87ba4', // magenta
      '#008300', // verde
      '#6250d6', // violeta
    ],
    card: '#ffffff',
    text: '#334155', // ink-soft
    muted: '#64748b', // ink-muted
  },
  dark: {
    colors: [
      '#3987e5', // azul
      '#d95926', // laranja
      '#199e70', // verde-água
      '#c98500', // amarelo
      '#d55181', // magenta
      '#008300', // verde
      '#9085e9', // violeta
    ],
    card: '#0f172a', // slate-900
    text: '#cbd5e1', // ink-soft
    muted: '#94a3b8', // ink-muted
  },
};
const OTHERS_COLOR = '#64748b'; // slate-500, neutro para "Outros" nos dois temas
const MAX_SLICES = CHART_THEME.light.colors.length;
const DARK_LABEL = '#0f172a'; // slate-900

const chartTheme = computed(() =>
  isDark.value ? CHART_THEME.dark : CHART_THEME.light,
);

// Escolhe texto branco ou escuro, o que tiver mais contraste com a fatia
function relativeLuminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map(i => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function labelColorFor(hex: string) {
  const l = relativeLuminance(hex);
  const contrastWhite = 1.05 / (l + 0.05);
  const contrastDark = (l + 0.05) / (relativeLuminance(DARK_LABEL) + 0.05);
  return contrastWhite >= contrastDark ? '#ffffff' : DARK_LABEL;
}

const sliceColors = computed(() => {
  const coloredSlices = pieSeries.value.length - (hasOthersSlice.value ? 1 : 0);
  const colors = chartTheme.value.colors.slice(0, coloredSlices);
  if (hasOthersSlice.value) colors.push(OTHERS_COLOR);
  return colors;
});

const isCurrentMonth = computed(() =>
  isSameMonth(selectedMonth.value, new Date()),
);

const cards = computed(() => [
  { label: 'Receitas', value: incomeTotal.value, color: 'text-accent' },
  { label: 'Despesas', value: expenseTotal.value, color: 'text-negative' },
  {
    label: 'Saldo',
    value: balance.value,
    color: balance.value < 0 ? 'text-negative' : 'text-info',
  },
]);

onBeforeMount(loadDashboard);

function changeMonth(months: number) {
  selectedMonth.value = addMonths(selectedMonth.value, months);
  loadDashboard();
}

function goToCurrentMonth() {
  selectedMonth.value = startOfMonth(new Date());
  loadDashboard();
}

async function loadDashboard() {
  loading.value = true;
  try {
    const { start, end } = getMonthRange(selectedMonth.value);
    const response = await getTransactionsByDate(start, end);

    const expenseMap: Record<string, number> = {};
    let expenses = 0;
    let incomes = 0;

    for (const item of response) {
      // A API retorna só as parcelas com vencimento no período,
      // então o valor do mês é a soma delas (e não o total do lançamento).
      const amount = item.installments.reduce(
        (sum, installment) =>
          installment.status === 'CANCELED'
            ? sum
            : sum + Number(installment.amount),
        0,
      );

      if (item.category.type === 'expense') {
        expenses += amount;
        expenseMap[item.category.name] =
          (expenseMap[item.category.name] ?? 0) + amount;
      } else {
        incomes += amount;
      }
    }

    expenseTotal.value = expenses;
    incomeTotal.value = incomes;

    // Maiores primeiro; acima de MAX_SLICES categorias, o resto vira "Outros"
    const sorted = Object.entries(expenseMap).sort((a, b) => b[1] - a[1]);
    const slices = sorted.slice(0, MAX_SLICES);
    const rest = sorted.slice(MAX_SLICES);
    if (rest.length) {
      slices.push(['Outros', rest.reduce((sum, [, value]) => sum + value, 0)]);
    }

    labelsChartExpense.value = slices.map(([name]) => name);
    pieSeries.value = slices.map(([, value]) => value);
    hasOthersSlice.value = rest.length > 0;
  } catch (err: any) {
    console.error(err);
    toast.error(err.message || 'Erro ao carregar o dashboard.');
  } finally {
    loading.value = false;
  }
}

async function onTransactionSaved() {
  openModal.value = false;
  await loadDashboard();
}

const pieOptions = computed(() => ({
  labels: labelsChartExpense.value,
  colors: sliceColors.value,
  chart: { background: 'transparent', foreColor: '#cbd5e1' },
  theme: { mode: isDark.value ? 'dark' : 'light' },
  // Separação de 2px na cor do card entre as fatias
  stroke: { width: 2, colors: [chartTheme.value.card] },
  legend: {
    position: 'bottom',
    labels: { colors: chartTheme.value.text },
    markers: { strokeWidth: 0 },
  },
  tooltip: { y: { formatter: formatCurrency } },
  dataLabels: {
    enabled: true,
    formatter: (value: number) => `${Math.round(value)}%`,
    style: {
      fontSize: '13px',
      fontWeight: 600,
      colors: sliceColors.value.map(labelColorFor),
    },
    dropShadow: { enabled: false },
  },
  plotOptions: {
    pie: {
      // Fatias muito finas não comportam o texto; o valor fica no tooltip
      dataLabels: { minAngleToShowLabel: 12 },
      donut: {
        size: '58%',
        labels: {
          show: true,
          value: {
            color: isDark.value ? '#f1f5f9' : '#0f172a', // ink
            formatter: (v: string) => formatCurrency(Number(v)),
          },
          total: {
            show: true,
            label: 'Total',
            color: chartTheme.value.muted,
            formatter: () => formatCurrency(expenseTotal.value),
          },
        },
      },
    },
  },
}));
</script>

<script lang="ts">
import ApexChart from 'vue3-apexcharts';

export default {
  components: {
    apexchart: ApexChart,
  },
};
</script>
