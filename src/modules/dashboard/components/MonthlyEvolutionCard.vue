<template>
  <section class="bg-card border border-line rounded-xl p-4">
    <header class="mb-4">
      <h2 class="font-semibold">Evolução dos últimos 12 meses</h2>
      <p class="text-sm text-ink-muted">
        Clique em um mês do gráfico para abri-lo no dashboard.
      </p>
    </header>

    <div v-if="loading" class="space-y-4">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div
          v-for="n in 3"
          :key="n"
          class="h-[74px] rounded-lg bg-skeleton animate-pulse"
        ></div>
      </div>
      <div class="h-[300px] rounded-lg bg-skeleton animate-pulse"></div>
    </div>

    <p
      v-else-if="!hasData"
      class="flex h-[200px] items-center justify-center text-center text-ink-muted"
    >
      Ainda não há lançamentos nos últimos 12 meses.
    </p>

    <div v-else class="animate-fade-up">
      <dl class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div class="rounded-lg border border-line p-3">
          <dt class="text-xs text-ink-muted">Saldo acumulado</dt>
          <dd
            class="text-lg font-semibold tabular-nums"
            :class="summary.totalBalance < 0 ? 'text-negative' : 'text-accent'"
          >
            {{ formatCurrency(summary.totalBalance) }}
          </dd>
        </div>

        <div class="rounded-lg border border-line p-3">
          <dt class="text-xs text-ink-muted">Média de gastos por mês</dt>
          <dd class="text-lg font-semibold tabular-nums text-ink">
            {{ formatCurrency(summary.averageExpense) }}
          </dd>
        </div>

        <div class="rounded-lg border border-line p-3">
          <dt class="text-xs text-ink-muted">Gastos dos últimos 3 meses</dt>
          <dd class="text-lg font-semibold tabular-nums" :class="trend.color">
            {{ trend.value }}
            <span class="text-xs font-normal text-ink-muted">
              {{ trend.caption }}
            </span>
          </dd>
        </div>
      </dl>

      <ApexChart type="line" height="300" :options="options" :series="series" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ApexChart from 'vue3-apexcharts';
import { useTheme } from '../../../composables/useTheme';
import {
  formatCompactCurrency,
  formatCurrency,
} from '../../../shared/utils/format';
import { formatShortMonth } from '../../../shared/utils/date';
import {
  summarizeEvolution,
  type MonthTotals,
} from '../utils/monthlyEvolution';

const props = defineProps<{
  months: MonthTotals[];
  selectedMonth: string;
  loading: boolean;
}>();
const emit = defineEmits<{ select: [month: string] }>();

const COLORS = {
  light: {
    income: '#047857',
    expense: '#b91c1c',
    balance: '#0369a1',
    grid: '#e2e8f0',
    muted: '#64748b',
    text: '#334155',
  },
  dark: {
    income: '#34d399',
    expense: '#f87171',
    balance: '#38bdf8',
    grid: '#1e293b',
    muted: '#94a3b8',
    text: '#cbd5e1',
  },
};

const STABLE_PERCENT = 1;

const { isDark } = useTheme();
const colors = computed(() => (isDark.value ? COLORS.dark : COLORS.light));

const hasData = computed(() =>
  props.months.some(month => month.income > 0 || month.expense > 0),
);

const summary = computed(() => summarizeEvolution(props.months));

const trend = computed(() => {
  const percent = summary.value.expenseTrend;
  if (percent === null)
    return {
      value: '—',
      caption: 'sem meses anteriores para comparar',
      color: 'text-ink-muted',
    };

  const rounded = Math.round(Math.abs(percent));
  if (rounded < STABLE_PERCENT)
    return {
      value: 'Estável',
      caption: 'em relação aos 3 anteriores',
      color: 'text-ink',
    };

  return percent < 0
    ? {
        value: `↓ ${rounded}%`,
        caption: 'gastando menos que nos 3 anteriores',
        color: 'text-accent',
      }
    : {
        value: `↑ ${rounded}%`,
        caption: 'gastando mais que nos 3 anteriores',
        color: 'text-negative',
      };
});

const series = computed(() => [
  {
    name: 'Receitas',
    type: 'column',
    data: props.months.map(month => month.income),
  },
  {
    name: 'Despesas',
    type: 'column',
    data: props.months.map(month => month.expense),
  },
  {
    name: 'Saldo',
    type: 'line',
    data: props.months.map(month => month.balance),
  },
]);

function selectMonth(index: number) {
  const month = props.months[index];
  if (month) emit('select', month.month);
}

const options = computed(() => ({
  chart: {
    background: 'transparent',
    toolbar: { show: false },
    zoom: { enabled: false },
    events: {
      click: (
        _event: unknown,
        _chart: unknown,
        config: { dataPointIndex: number },
      ) => selectMonth(config.dataPointIndex),
      xAxisLabelClick: (
        _event: unknown,
        _chart: unknown,
        config: { labelIndex: number },
      ) => selectMonth(config.labelIndex),
    },
  },
  theme: { mode: isDark.value ? 'dark' : 'light' },
  colors: [colors.value.income, colors.value.expense, colors.value.balance],
  stroke: { width: [0, 0, 3], curve: 'smooth' },
  markers: { size: [0, 0, 4], strokeWidth: 0, hover: { size: 6 } },
  plotOptions: { bar: { columnWidth: '60%', borderRadius: 3 } },
  dataLabels: { enabled: false },
  states: { active: { filter: { type: 'none' } } },
  legend: {
    position: 'top',
    horizontalAlign: 'left',
    labels: { colors: colors.value.text },
    markers: { strokeWidth: 0 },
  },
  grid: { borderColor: colors.value.grid, strokeDashArray: 4 },
  xaxis: {
    categories: props.months.map(month => formatShortMonth(month.month)),
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      style: {
        colors: props.months.map(month =>
          month.month === props.selectedMonth
            ? colors.value.balance
            : colors.value.muted,
        ),
      },
    },
  },
  yaxis: {
    labels: {
      formatter: formatCompactCurrency,
      style: { colors: colors.value.muted },
    },
  },
  tooltip: {
    shared: true,
    intersect: false,
    y: { formatter: formatCurrency },
  },
}));
</script>
