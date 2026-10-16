<template>
  <div class="min-h-screen p-4 sm:p-6 bg-slate-950 text-slate-100">
    <!-- Header -->
    <header
      class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <h1 class="text-3xl font-bold">Dashboard</h1>
        <p class="text-slate-400">Bem-vindo ao seu painel de controle!</p>
      </div>

      <button
        @click="openModal = true"
        class="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition"
      >
        + Novo Lançamento
      </button>
    </header>

    <!-- Navegação por mês -->
    <nav class="mb-6 flex items-center gap-2" aria-label="Selecionar mês">
      <button
        @click="changeMonth(-1)"
        :disabled="loading"
        aria-label="Mês anterior"
        class="h-9 w-9 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition disabled:opacity-50"
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
        class="h-9 w-9 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition disabled:opacity-50"
      >
        →
      </button>

      <button
        v-if="!isCurrentMonth"
        @click="goToCurrentMonth"
        :disabled="loading"
        class="ml-2 inline-flex h-9 items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
        class="bg-slate-900 border border-slate-800 rounded-xl p-4"
      >
        <h2 class="text-slate-400 text-sm">{{ card.label }}</h2>
        <div
          v-if="loading"
          class="mt-2 h-8 w-32 rounded bg-slate-800 animate-pulse"
        ></div>
        <p v-else :class="card.color" class="text-2xl font-semibold">
          {{ formatCurrency(card.value) }}
        </p>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Gráfico de pizza -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h2 class="font-semibold mb-4">Distribuição de Despesas do Mês</h2>

        <div
          v-if="loading"
          class="mx-auto h-[300px] w-[300px] max-w-full rounded-full bg-slate-800 animate-pulse"
        ></div>
        <p
          v-else-if="pieSeries.length === 0"
          class="flex h-[300px] items-center justify-center text-slate-500"
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

const openModal = ref(false);
const loading = ref(true);
const selectedMonth = ref(startOfMonth(new Date()));
const expenseTotal = ref(0);
const incomeTotal = ref(0);
const balance = computed(() => incomeTotal.value - expenseTotal.value);

const labelsChartExpense = ref<string[]>([]);
const pieSeries = ref<number[]>([]);

const isCurrentMonth = computed(() =>
  isSameMonth(selectedMonth.value, new Date()),
);

const cards = computed(() => [
  { label: 'Receitas', value: incomeTotal.value, color: 'text-emerald-400' },
  { label: 'Despesas', value: expenseTotal.value, color: 'text-red-400' },
  {
    label: 'Saldo',
    value: balance.value,
    color: balance.value < 0 ? 'text-red-400' : 'text-sky-400',
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

    labelsChartExpense.value = Object.keys(expenseMap);
    pieSeries.value = Object.values(expenseMap);
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
  chart: { background: 'transparent', foreColor: '#cbd5e1' },
  theme: { mode: 'dark' },
  stroke: { colors: ['#0f172a'] }, // slate-900, mesma cor do card
  legend: { position: 'bottom' },
  tooltip: { y: { formatter: formatCurrency } },
  dataLabels: { dropShadow: { enabled: false } },
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
