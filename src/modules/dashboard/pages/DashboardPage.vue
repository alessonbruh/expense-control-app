<template>
  <div class="min-h-screen p-6 bg-gray-100 dark:bg-gray-900">
    <!-- Header -->
    <header class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-200">
        Dashboard
      </h1>
      <p class="text-gray-500 dark:text-gray-200">
        Bem-vindo ao seu painel de controle!
      </p>
      <button
        @click="openModal = true"
        class="px-4 py-2 bg-blue-600 text-white rounded"
      >
        + Novo Lançamento
      </button>
    </header>

    <!-- Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="bg-white dark:bg-gray-600 rounded-lg shadow p-4">
        <h2 class="text-gray-500 dark:text-gray-200 text-sm">Receitas</h2>
        <p class="text-2xl font-semibold text-green-500">
          R$ {{ incomeTotal.toFixed(2) }}
        </p>
      </div>
      <div class="bg-white dark:bg-gray-600 rounded-lg shadow p-4">
        <h2 class="text-gray-500 dark:text-gray-200 text-sm">Despesas</h2>
        <p class="text-2xl font-semibold text-red-500">
          R$ {{ expenseTotal.toFixed(2) }}
        </p>
      </div>
      <div class="bg-white dark:bg-gray-600 rounded-lg shadow p-4">
        <h2 class="text-gray-500 dark:text-gray-200 text-sm">Saldo</h2>
        <p class="text-2xl font-semibold text-blue-500">
          R$ {{ balance.toFixed(2) }}
        </p>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-1">
      <!-- Gráfico de pizza -->
      <div class="bg-white dark:bg-gray-600 rounded-lg shadow p-4">
        <h2 class="text-gray-800 dark:text-gray-200 font-semibold mb-4">
          Distribuição de Despesas do Mês
        </h2>
        <apexchart
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
// seus imports e estados existentes...
import { computed, onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';
import Modal from '../../../components/ui/Modal.vue';
import ExpenseForm from '../../../components/transactions/ExpenseForm.vue';
import { DashboardService } from '../services/dashboardService';
import type { ExpenseResponseDTO } from '../dtos/ExpenseResponseDTO';

const openModal = ref(false);
const dashboardService = new DashboardService();
const loading = ref(true);
const token = localStorage.getItem('token');
let data = ref<ExpenseResponseDTO[]>([]);
const expenseTotal = ref(0);
const incomeTotal = ref(0);
const balance = ref(0);

const labelsChartExpense = ref<string[]>([]);
const pieSeries = ref<number[]>([]);
const expenseMap: Record<string, number> = {};

onBeforeMount(async () => {
  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const startDate = formatDate(firstDay);
    const endDate = formatDate(lastDay);
    const response = await dashboardService.getExpenseByDate(
      startDate || '',
      endDate || '',
      token,
    );

    data.value = response;

    for (const item of data.value) {
      const amount = Number(item.amount);

      if (item.category.type === 'expense') {
        expenseTotal.value += amount;

        if (expenseMap[item.category.name]) {
          expenseMap[item.category.name] += amount;
        } else {
          expenseMap[item.category.name] = amount;
        }
      } else {
        incomeTotal.value += amount;
      }
    }

    balance.value = incomeTotal.value - expenseTotal.value;

    labelsChartExpense.value = Object.keys(expenseMap);
    pieSeries.value = Object.values(expenseMap);
  } catch (err) {
    console.error(err);
    // router.push('/erro');
  } finally {
    loading.value = false;
  }
});

async function onTransactionSaved() {
  openModal.value = false;
}

const router = useRouter();
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

const pieOptions = computed(() => ({
  labels: labelsChartExpense.value,
  colors: [],
  legend: {
    labels: {
      colors: isDark ? '#FFFFFF' : '#1F2937',
    },
    position: 'bottom',
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

<style scoped></style>
