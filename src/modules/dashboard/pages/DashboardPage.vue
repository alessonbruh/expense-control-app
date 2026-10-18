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
          type="button"
          @click="openRecoveryModal = true"
          title="Códigos de recuperação de senha"
          aria-label="Códigos de recuperação de senha"
          class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-line-strong bg-card text-ink-soft hover:bg-hover hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-5 w-5"
            aria-hidden="true"
          >
            <circle cx="7.5" cy="15.5" r="5.5" />
            <path d="m21 2-9.6 9.6" />
            <path d="m15.5 7.5 3 3L22 7l-3-3" />
          </svg>
        </button>
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

    <!-- Aviso: sem códigos não há como recuperar a senha -->
    <div
      v-if="recoveryRemaining !== null && recoveryRemaining <= 2"
      class="mb-6 flex flex-col gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between"
      role="status"
    >
      <p class="text-sm text-ink-soft">
        <strong class="text-ink">
          {{ recoveryWarning }}
        </strong>
        Sem eles, não será possível redefinir sua senha se você esquecê-la.
      </p>
      <button
        type="button"
        @click="openRecoveryModal = true"
        class="h-9 shrink-0 cursor-pointer rounded-lg bg-amber-500 px-4 text-sm font-medium text-slate-950 hover:bg-amber-400 transition"
      >
        Gerar códigos
      </button>
    </div>

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
          v-else-if="slices.length === 0"
          class="flex h-[300px] items-center justify-center text-ink-muted"
        >
          Nenhuma despesa neste mês.
        </p>
        <ExpenseDonutChart v-else :slices="slices" :total="expenseTotal" />
      </div>
    </div>

    <Modal v-model="openModal" title="Novo Lançamento">
      <ExpenseForm @saved="onTransactionSaved" @cancel="openModal = false" />
    </Modal>

    <RecoveryCodesModal
      v-model="openRecoveryModal"
      :remaining="recoveryRemaining"
      @generated="recoveryRemaining = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import Modal from '../../../components/ui/Modal.vue';
import ExpenseForm from '../../../components/transactions/ExpenseForm.vue';
import { useTransactions } from '../../../composables/useTransactions';
import { useToast } from '../../../composables/useToast';
import { useAuth } from '../../../composables/useAuth';
import ThemeToggle from '../../../components/ui/ThemeToggle.vue';
import RecoveryCodesModal from '../../auth/components/RecoveryCodesModal.vue';
import { AuthService } from '../../auth/services/authService';
import { getToken } from '../../../shared/auth/session';
import {
  addMonths,
  formatMonthLabel,
  getMonthRange,
  isSameMonth,
  startOfMonth,
} from '../../../shared/utils/date';
import { formatCurrency } from '../../../shared/utils/format';
import ExpenseDonutChart from '../components/ExpenseDonutChart.vue';
import { summarizeMonth, type ChartSlice } from '../utils/summarizeMonth';

const { getTransactionsByDate } = useTransactions();
const toast = useToast();
const { logout, loggingOut } = useAuth();

const openModal = ref(false);
const openRecoveryModal = ref(false);
// null enquanto carrega (ou se falhar): o aviso só aparece com o valor real
const recoveryRemaining = ref<number | null>(null);
const recoveryWarning = computed(() => {
  if (recoveryRemaining.value === 0)
    return 'Você não tem códigos de recuperação.';
  if (recoveryRemaining.value === 1) return 'Resta só 1 código de recuperação.';
  return `Restam só ${recoveryRemaining.value} códigos de recuperação.`;
});
const loading = ref(true);
const selectedMonth = ref(startOfMonth(new Date()));
const expenseTotal = ref(0);
const incomeTotal = ref(0);
const balance = computed(() => incomeTotal.value - expenseTotal.value);

const slices = ref<ChartSlice[]>([]);

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

const authService = new AuthService();

async function loadRecoveryStatus() {
  try {
    const { remaining } = await authService.getRecoveryCodesStatus(getToken());
    recoveryRemaining.value = remaining;
  } catch (err) {
    // Não bloqueia o dashboard: sem o status, o aviso apenas não aparece
    console.error(err);
  }
}

onBeforeMount(() => {
  loadDashboard();
  loadRecoveryStatus();
});

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

    const summary = summarizeMonth(response);
    incomeTotal.value = summary.incomeTotal;
    expenseTotal.value = summary.expenseTotal;
    slices.value = summary.slices;
  } catch (err: any) {
    console.error(err);
    toast.fromError(err, 'Erro ao carregar o dashboard.');
  } finally {
    loading.value = false;
  }
}

async function onTransactionSaved() {
  openModal.value = false;
  await loadDashboard();
}
</script>
