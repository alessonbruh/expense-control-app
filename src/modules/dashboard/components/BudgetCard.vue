<template>
  <section class="bg-card border border-line rounded-xl p-4">
    <header class="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 class="font-semibold">Orçamento do mês</h2>
        <p v-if="!loading && items.length" class="text-sm text-ink-muted">
          {{ summary }}
        </p>
      </div>
      <button
        v-if="!loading && items.length"
        type="button"
        @click="emit('edit')"
        class="h-9 shrink-0 cursor-pointer rounded-lg border border-line-strong bg-card px-3 text-sm font-medium text-ink-soft hover:bg-hover hover:text-ink transition"
      >
        Editar limites
      </button>
    </header>

    <div v-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="n in 3" :key="n" class="space-y-2">
        <div class="h-4 w-32 rounded bg-skeleton animate-pulse"></div>
        <div class="h-2 rounded-full bg-skeleton animate-pulse"></div>
      </div>
    </div>

    <div
      v-else-if="items.length === 0"
      class="flex flex-col items-center gap-3 py-4 text-center"
    >
      <p class="max-w-md text-sm text-ink-muted">
        Defina quanto quer gastar por categoria e acompanhe aqui se está dentro
        do limite a cada mês.
      </p>
      <button
        type="button"
        @click="emit('edit')"
        class="h-9 cursor-pointer rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-500 transition"
      >
        Definir orçamento
      </button>
    </div>

    <ul
      v-else
      class="animate-fade-up grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <li v-for="item in items" :key="item.categoryId">
        <div class="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
          <span class="truncate font-medium text-ink">{{ item.name }}</span>
          <span class="shrink-0 text-ink-muted">
            {{ formatCurrency(item.spent) }} de {{ formatCurrency(item.limit) }}
          </span>
        </div>
        <div
          class="h-2 overflow-hidden rounded-full bg-skeleton"
          role="progressbar"
          :aria-label="`${item.name}: ${Math.round(item.percent)}% do limite`"
          :aria-valuenow="Math.round(item.percent)"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            class="animate-grow-x h-full origin-left rounded-full transition-[width] duration-500 ease-out"
            :class="barColor[item.level]"
            :style="{ width: `${Math.min(item.percent, 100)}%` }"
          ></div>
        </div>
        <p class="mt-1 text-xs" :class="textColor[item.level]">
          {{ statusText(item) }}
        </p>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatCurrency } from '../../../shared/utils/format';
import type { BudgetLevel, BudgetProgress } from '../utils/budgetProgress';

const props = defineProps<{ items: BudgetProgress[]; loading: boolean }>();
const emit = defineEmits<{ edit: [] }>();

const barColor: Record<BudgetLevel, string> = {
  ok: 'bg-emerald-500',
  warning: 'bg-amber-500',
  over: 'bg-red-500',
};

const textColor: Record<BudgetLevel, string> = {
  ok: 'text-ink-muted',
  warning: 'text-amber-600 dark:text-amber-400',
  over: 'text-negative',
};

function statusText(item: BudgetProgress): string {
  const percent = Math.round(item.percent);
  if (item.level === 'over')
    return `${formatCurrency(item.spent - item.limit)} acima do limite (${percent}%)`;
  return `Restam ${formatCurrency(item.limit - item.spent)} (${percent}%)`;
}

const summary = computed(() => {
  const attention = props.items.filter(item => item.level !== 'ok').length;
  if (attention === 0) return 'Todas as categorias dentro do limite.';
  if (attention === 1) return '1 categoria perto ou acima do limite.';
  return `${attention} categorias perto ou acima do limite.`;
});
</script>
