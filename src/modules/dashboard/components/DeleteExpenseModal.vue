<template>
  <Modal
    :model-value="!!expense"
    title="Excluir lançamento"
    size="sm"
    @update:model-value="close"
  >
    <div v-if="expense" class="space-y-4">
      <p class="text-sm text-ink-soft">
        Tem certeza que deseja excluir
        <strong class="text-ink">{{
          expense.description || 'este lançamento'
        }}</strong
        >? Essa ação não pode ser desfeita.
      </p>

      <p
        v-if="expense.totalInstallments > 1"
        class="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-ink-soft"
        role="alert"
      >
        Esta compra é parcelada em {{ expense.totalInstallments }}x. Todas as
        parcelas serão excluídas, não só a deste mês.
      </p>

      <div class="flex justify-end gap-3 pt-2">
        <button
          type="button"
          @click="close"
          :disabled="deleting"
          class="px-4 py-2 cursor-pointer rounded-lg border border-line-strong text-ink-soft hover:bg-hover transition disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          @click="confirm"
          :disabled="deleting"
          class="px-4 py-2 cursor-pointer rounded-lg bg-red-600 text-white hover:bg-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ deleting ? 'Excluindo...' : 'Excluir' }}
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Modal from '../../../components/ui/Modal.vue';
import { useTransactions } from '../../../composables/useTransactions';
import { useToast } from '../../../composables/useToast';
import type { ExpenseRow } from '../utils/summarizeMonth';

const props = defineProps<{ expense: ExpenseRow | null }>();
const emit = defineEmits<{ close: []; deleted: [id: string] }>();

const { deleteTransaction } = useTransactions();
const toast = useToast();
const deleting = ref(false);

function close() {
  if (!deleting.value) emit('close');
}

async function confirm() {
  if (!props.expense) return;
  deleting.value = true;
  try {
    await deleteTransaction(props.expense.id);
    toast.success('Lançamento excluído.');
    emit('deleted', props.expense.id);
  } catch (err) {
    console.error(err);
    toast.fromError(err, 'Erro ao excluir lançamento.');
  } finally {
    deleting.value = false;
  }
}
</script>
