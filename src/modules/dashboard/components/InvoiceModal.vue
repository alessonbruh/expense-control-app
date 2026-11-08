<template>
  <Modal
    :model-value="!!invoice"
    :title="shown ? `Fatura ${shown.creditCard.name}` : 'Fatura'"
    @update:model-value="close"
  >
    <div v-if="shown" class="space-y-4">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="text-sm text-ink-muted">{{ monthLabel }}</p>
          <p class="text-2xl font-semibold tabular-nums text-ink">
            {{ formatCurrency(shown.total) }}
          </p>
          <p class="text-xs text-ink-muted">
            Fecha {{ formatDueDay(shown.closingDate) }} · Vence
            {{ formatDueDay(shown.dueDate) }} ·
            {{ invoiceStatusLabels[shown.status] }}
          </p>
        </div>
        <p v-if="shown.paidAmount > 0" class="text-sm text-ink-muted">
          Pago: {{ formatCurrency(shown.paidAmount) }}
        </p>
      </div>

      <p
        v-if="shown.installments.length === 0"
        class="py-6 text-center text-sm text-ink-muted"
      >
        Nenhuma compra nesta fatura.
      </p>

      <ul v-else class="max-h-[280px] divide-y divide-line overflow-y-auto">
        <li
          v-for="installment in shown.installments"
          :key="installment.id"
          class="flex items-center justify-between gap-3 py-2.5"
        >
          <div class="min-w-0">
            <p
              class="truncate text-sm font-medium"
              :class="
                installment.status === 'CANCELED'
                  ? 'text-ink-muted line-through'
                  : 'text-ink'
              "
            >
              {{ installment.expense.description || 'Sem descrição' }}
            </p>
            <p class="truncate text-xs text-ink-muted">
              {{ installment.expense.category.name }} · compra
              {{ formatDueDay(installment.expense.date) }}
              <span v-if="installment.totalInstallments > 1">
                · Parcela {{ installment.installmentNum }}/{{
                  installment.totalInstallments
                }}
              </span>
              · {{ installmentStatusLabels[installment.status] }}
            </p>
          </div>
          <span class="shrink-0 text-sm font-semibold tabular-nums text-ink">
            {{ formatCurrency(Number(installment.amount)) }}
          </span>
        </li>
      </ul>

      <form
        v-if="shown.pendingAmount > 0"
        @submit.prevent="pay"
        class="space-y-3 border-t border-line pt-4"
      >
        <p class="text-sm text-ink-soft">
          Pagar a fatura marca as compras acima como pagas. Nenhum lançamento
          novo é criado, então o gasto não fica duplicado.
        </p>
        <div class="flex flex-wrap items-end justify-end gap-3">
          <label class="flex flex-col gap-1.5 text-sm text-ink-soft">
            Data do pagamento
            <input
              v-model="paymentDate"
              type="date"
              required
              class="rounded-lg border border-line-strong bg-field px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>
          <button
            type="submit"
            :disabled="paying || !paymentDate"
            class="h-10 cursor-pointer rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-500 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{
              paying
                ? 'Pagando...'
                : `Pagar ${formatCurrency(shown.pendingAmount)}`
            }}
          </button>
        </div>
      </form>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Modal from '../../../components/ui/Modal.vue';
import type { InvoiceDTO } from '../../creditCard/dto/CreditCardDTO';
import { CreditCardService } from '../../creditCard/services/creditCardService';
import { invoiceStatusLabels } from '../../creditCard/utils/invoice';
import { installmentStatusLabels } from '../../../shared/enums/installment-status';
import { useToast } from '../../../composables/useToast';
import { formatCurrency } from '../../../shared/utils/format';
import {
  formatDueDay,
  formatMonthLabel,
  parseMonthKey,
  toDateInput,
} from '../../../shared/utils/date';

const props = defineProps<{ invoice: InvoiceDTO | null }>();
const emit = defineEmits<{ close: []; paid: [invoice: InvoiceDTO] }>();

const service = new CreditCardService();
const toast = useToast();
const paying = ref(false);
const paymentDate = ref(toDateInput(new Date()));

const shown = ref<InvoiceDTO | null>(props.invoice);
watch(
  () => props.invoice,
  invoice => {
    if (!invoice) return;
    shown.value = invoice;
    paymentDate.value = toDateInput(new Date());
  },
);

const monthLabel = computed(() =>
  shown.value
    ? `Fatura de ${formatMonthLabel(parseMonthKey(shown.value.month)).toLowerCase()}`
    : '',
);

function close() {
  if (!paying.value) emit('close');
}

async function pay() {
  if (!props.invoice) return;
  paying.value = true;
  try {
    const invoice = await service.payInvoice(
      props.invoice.creditCard.id,
      props.invoice.month,
      paymentDate.value,
    );
    toast.success('Fatura paga!');
    emit('paid', invoice);
  } catch (err) {
    toast.fromError(err, 'Erro ao pagar a fatura.');
  } finally {
    paying.value = false;
  }
}
</script>
