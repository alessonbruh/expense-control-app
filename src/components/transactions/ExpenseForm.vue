<template>
  <form @submit.prevent="save" class="space-y-4">
    <div class="flex gap-2">
      <select v-model="form.type" class="border rounded px-3 py-2">
        <option value="income">Receita</option>
        <option value="expense">Despesa</option>
      </select>

      <input
        v-model="form.amount"
        type="number"
        step="0.01"
        placeholder="Valor"
        class="flex-1 border rounded px-3 py-2"
      />
    </div>

    <input
      v-model="form.category"
      placeholder="Categoria"
      class="w-full border rounded px-3 py-2"
    />

    <div class="flex gap-2">
      <input v-model="form.date" type="date" class="border rounded px-3 py-2" />
      <input
        v-model="form.note"
        placeholder="Observação (opcional)"
        class="flex-1 border rounded px-3 py-2"
      />
    </div>

    <div class="flex gap-2 justify-end">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 rounded border"
      >
        Cancelar
      </button>
      <button
        :disabled="saving"
        type="submit"
        class="px-4 py-2 rounded bg-green-600 text-white"
      >
        <span v-if="!saving">Salvar</span>
        <span v-else>Salvando...</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import type {
  ExpenseDTO,
  CreateExpensePayload,
} from '../../modules/expense/dto/ExpenseDTO';
import { useTransactions } from '../../composables/useTransactions';

const props = defineProps<{ initial?: Partial<ExpenseDTO> }>();
const emit = defineEmits<{
  (e: 'saved', data: ExpenseDTO): void;
  (e: 'cancel'): void;
}>();

const form = reactive({
  type: props.initial?.type ?? 'expense',
  category: props.initial?.category?.name ?? '',
  amount: props.initial?.amount ?? '',
  date: props.initial?.createdAt
    ? props.initial.createdAt.split('T')[0]
    : new Date().toISOString().split('T')[0],
  note: props.initial?.note ?? '',
});

const saving = ref(false);
const { createTransaction } = useTransactions();

async function save() {
  if (!form.category || !form.amount) {
    // aqui você pode disparar um toast/erro visual
    return;
  }

  saving.value = true;
  try {
    const payload: CreateExpensePayload = {
      type: form.type,
      category: form.category,
      date: form.date ? form.date : '',
      amount: Number(form.amount),
      note: form.note,
    };
    const created = await createTransaction(payload);
    emit('saved', created); // Dashboard vai receber e atualizar UI
  } catch (err) {
    console.error(err);
  } finally {
    saving.value = false;
  }
}
</script>
