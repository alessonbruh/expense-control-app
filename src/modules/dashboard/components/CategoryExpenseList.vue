<template>
  <div class="flex h-full flex-col">
    <header class="mb-4 flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h2 class="truncate font-semibold" :title="title">{{ title }}</h2>
        <p class="text-sm text-ink-muted">
          {{ rows.length }}
          {{ rows.length === 1 ? 'lançamento' : 'lançamentos' }} ·
          {{ formatCurrency(total) }}
        </p>
      </div>
      <span
        v-if="categories.length"
        class="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-accent"
      >
        Filtrado
      </span>
    </header>

    <p
      v-if="!categories.length && rows.length"
      class="mb-3 text-xs text-ink-muted"
    >
      Clique numa fatia do gráfico para ver só uma categoria.
    </p>

    <p
      v-if="rows.length === 0"
      class="flex flex-1 items-center justify-center py-10 text-ink-muted"
    >
      Nenhuma despesa neste mês.
    </p>

    <ul
      v-else
      class="-mx-1 max-h-[300px] divide-y divide-line overflow-y-auto px-1"
    >
      <li
        v-for="row in rows"
        :key="row.id"
        class="flex items-center justify-between gap-3 py-2.5"
      >
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-ink">
            {{ row.description || 'Sem descrição' }}
          </p>
          <p class="truncate text-xs text-ink-muted">
            <span v-if="showCategory">{{ row.category }} · </span>
            {{ row.method }}
            <span v-if="row.installment"> · Parcela {{ row.installment }}</span>
            <span v-if="row.dueDay"> · vence {{ row.dueDay }}</span>
          </p>
        </div>
        <span class="shrink-0 text-sm font-semibold text-negative">
          {{ formatCurrency(row.amount) }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ExpenseResponseDTO } from '../../expense/dto/ExpenseResponseDTO';
import { paymentMethodLabels } from '../../../shared/enums/payment-method';
import { formatCurrency } from '../../../shared/utils/format';
import { formatDueDay } from '../../../shared/utils/date';
import { monthAmount } from '../utils/summarizeMonth';

const props = defineProps<{
  expenses: ExpenseResponseDTO[];
  // Categorias selecionadas no gráfico (vazio = todas)
  categories: string[];
}>();

// Só despesas: é o que o gráfico ao lado mostra
const rows = computed(() =>
  props.expenses
    .filter(
      expense =>
        expense.category.type === 'expense' &&
        (props.categories.length === 0 ||
          props.categories.includes(expense.category.name)),
    )
    .map(expense => {
      const installment = expense.installments[0];
      return {
        id: expense.id,
        description: expense.description,
        category: expense.category.name,
        method: paymentMethodLabels[expense.paymentMethod] ?? '',
        amount: monthAmount(expense),
        // Compra parcelada: mostra qual parcela vence neste mês (ex.: 2/5)
        installment:
          installment && installment.totalInstallments > 1
            ? `${installment.installmentNum}/${installment.totalInstallments}`
            : null,
        dueDate: installment?.dueDate ?? '',
        dueDay: installment ? formatDueDay(installment.dueDate) : null,
      };
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
);

const total = computed(() =>
  rows.value.reduce((sum, row) => sum + row.amount, 0),
);

// Com uma categoria só, repetir o nome em cada linha não acrescenta nada
const showCategory = computed(() => props.categories.length !== 1);

const title = computed(() => {
  if (props.categories.length === 0) return 'Despesas do mês';
  if (props.categories.length <= 3) return props.categories.join(', ');
  return `${props.categories.length} categorias`;
});
</script>
