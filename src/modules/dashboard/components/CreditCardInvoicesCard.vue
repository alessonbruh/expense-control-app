<template>
  <section class="bg-card border border-line rounded-xl p-4">
    <header class="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 class="font-semibold">Faturas do mês</h2>
        <p v-if="!loading && invoices.length" class="text-sm text-ink-muted">
          {{ summary }}
        </p>
      </div>
      <button
        v-if="!loading && hasCards"
        type="button"
        @click="emit('manage')"
        class="h-9 shrink-0 cursor-pointer rounded-lg border border-line-strong bg-card px-3 text-sm font-medium text-ink-soft hover:bg-hover hover:text-ink transition"
      >
        Cartões
      </button>
    </header>

    <div v-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="n in 2"
        :key="n"
        class="h-28 rounded-lg bg-skeleton animate-pulse"
      ></div>
    </div>

    <div
      v-else-if="!hasCards"
      class="flex flex-col items-center gap-3 py-4 text-center"
    >
      <p class="max-w-md text-sm text-ink-muted">
        Cadastre seus cartões de crédito para lançar as compras direto na fatura
        e pagar a fatura sem registrar o gasto duas vezes.
      </p>
      <button
        type="button"
        @click="emit('manage')"
        class="h-9 cursor-pointer rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-500 transition"
      >
        Cadastrar cartão
      </button>
    </div>

    <ul v-else class="animate-fade-up grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li
        v-for="invoice in invoices"
        :key="invoice.creditCard.id"
        class="flex flex-col gap-3 rounded-lg border border-line p-4"
      >
        <div class="flex items-start justify-between gap-2">
          <span class="truncate font-medium text-ink">
            {{ invoice.creditCard.name }}
          </span>
          <span
            class="shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium"
            :class="statusClass[invoice.status]"
          >
            {{ invoiceStatusLabels[invoice.status] }}
          </span>
        </div>

        <div>
          <p class="text-2xl font-semibold tabular-nums text-ink">
            {{ formatCurrency(invoice.total) }}
          </p>
          <p class="text-xs text-ink-muted">
            Fecha {{ formatDueDay(invoice.closingDate) }} · Vence
            {{ formatDueDay(invoice.dueDate) }}
          </p>
        </div>

        <p
          v-if="invoice.status !== 'PAID' && invoice.paidAmount > 0"
          class="text-xs text-ink-muted"
        >
          {{ formatCurrency(invoice.pendingAmount) }} a pagar
        </p>

        <button
          type="button"
          @click="emit('open', invoice)"
          class="mt-auto h-9 cursor-pointer rounded-lg border border-line-strong px-3 text-sm font-medium text-ink-soft hover:bg-hover hover:text-ink transition"
        >
          {{ canPay(invoice) ? 'Ver e pagar fatura' : 'Ver fatura' }}
        </button>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type {
  InvoiceDTO,
  InvoiceStatus,
} from '../../creditCard/dto/CreditCardDTO';
import { invoiceStatusLabels } from '../../creditCard/utils/invoice';
import { formatCurrency } from '../../../shared/utils/format';
import { formatDueDay } from '../../../shared/utils/date';

const props = defineProps<{
  invoices: InvoiceDTO[];
  hasCards: boolean;
  loading: boolean;
}>();
const emit = defineEmits<{ manage: []; open: [invoice: InvoiceDTO] }>();

const statusClass: Record<InvoiceStatus, string> = {
  OPEN: 'border-sky-500/40 bg-sky-500/10 text-info',
  CLOSED:
    'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  PAID: 'border-emerald-500/40 bg-emerald-500/10 text-accent',
};

function canPay(invoice: InvoiceDTO): boolean {
  return invoice.pendingAmount > 0;
}

const summary = computed(() => {
  const pending = props.invoices.reduce(
    (sum, invoice) => sum + invoice.pendingAmount,
    0,
  );
  if (pending === 0) return 'Nenhuma fatura pendente neste mês.';
  return `${formatCurrency(pending)} a pagar neste mês.`;
});
</script>
