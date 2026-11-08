<template>
  <Modal
    :model-value="modelValue"
    title="Cartões de crédito"
    size="sm"
    @update:model-value="close"
  >
    <div class="space-y-5">
      <ul v-if="cards.length" class="divide-y divide-line">
        <li
          v-for="card in cards"
          :key="card.id"
          class="flex items-center justify-between gap-3 py-2.5"
        >
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-ink">{{ card.name }}</p>
            <p class="text-xs text-ink-muted">
              Fecha dia {{ card.closingDay }} · Vence dia {{ card.dueDay }}
            </p>
          </div>
          <div class="flex shrink-0 items-center gap-1">
            <button
              type="button"
              @click="startEdit(card)"
              :disabled="busy"
              class="h-8 cursor-pointer rounded-lg px-2.5 text-sm text-ink-soft hover:bg-hover hover:text-ink transition disabled:opacity-50"
            >
              Editar
            </button>
            <button
              type="button"
              @click="removeCard(card)"
              :disabled="busy"
              class="h-8 cursor-pointer rounded-lg px-2.5 text-sm transition disabled:opacity-50"
              :class="
                confirmingDelete === card.id
                  ? 'bg-red-600 text-white hover:bg-red-500'
                  : 'text-ink-muted hover:bg-red-500/10 hover:text-negative'
              "
            >
              {{ confirmingDelete === card.id ? 'Confirmar' : 'Excluir' }}
            </button>
          </div>
        </li>
      </ul>

      <form
        @submit.prevent="save"
        class="space-y-3 rounded-lg border border-line p-4"
      >
        <p class="text-sm font-medium text-ink">
          {{ editingId ? 'Editar cartão' : 'Novo cartão' }}
        </p>

        <label class="block text-sm text-ink-soft">
          Nome
          <input
            v-model="form.name"
            maxlength="50"
            placeholder="Ex.: Nubank"
            class="mt-1.5 w-full rounded-lg border border-line-strong bg-field px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </label>

        <div class="grid grid-cols-2 gap-3">
          <label class="block text-sm text-ink-soft">
            Dia do fechamento
            <input
              v-model.number="form.closingDay"
              type="number"
              min="1"
              max="31"
              inputmode="numeric"
              class="mt-1.5 w-full rounded-lg border border-line-strong bg-field px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>
          <label class="block text-sm text-ink-soft">
            Dia do vencimento
            <input
              v-model.number="form.dueDay"
              type="number"
              min="1"
              max="31"
              inputmode="numeric"
              class="mt-1.5 w-full rounded-lg border border-line-strong bg-field px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>
        </div>

        <p class="text-xs text-ink-muted">
          Compras feitas a partir do dia do fechamento entram na fatura do mês
          seguinte. Mudar os dias não move as compras já lançadas.
        </p>

        <Transition name="expand">
          <p v-if="errorMessage" class="text-sm text-negative">
            {{ errorMessage }}
          </p>
        </Transition>

        <div class="flex justify-end gap-2">
          <button
            v-if="editingId"
            type="button"
            @click="resetForm"
            :disabled="busy"
            class="h-9 cursor-pointer rounded-lg border border-line-strong px-4 text-sm text-ink-soft hover:bg-hover transition disabled:opacity-50"
          >
            Cancelar edição
          </button>
          <button
            type="submit"
            :disabled="busy"
            class="h-9 cursor-pointer rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-500 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ busy ? 'Salvando...' : editingId ? 'Salvar' : 'Adicionar' }}
          </button>
        </div>
      </form>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import Modal from '../../../components/ui/Modal.vue';
import type { CreditCardDTO } from '../../creditCard/dto/CreditCardDTO';
import { CreditCardService } from '../../creditCard/services/creditCardService';
import { useToast } from '../../../composables/useToast';

const props = defineProps<{ modelValue: boolean; cards: CreditCardDTO[] }>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  changed: [];
}>();

const service = new CreditCardService();
const toast = useToast();

const form = reactive({
  name: '',
  closingDay: '' as number | '',
  dueDay: '' as number | '',
});
const editingId = ref<string | null>(null);
const confirmingDelete = ref<string | null>(null);
const busy = ref(false);
const errorMessage = ref('');

function resetForm() {
  form.name = '';
  form.closingDay = '';
  form.dueDay = '';
  editingId.value = null;
  errorMessage.value = '';
}

watch(
  () => props.modelValue,
  open => {
    if (!open) return;
    resetForm();
    confirmingDelete.value = null;
  },
);

function close() {
  if (!busy.value) emit('update:modelValue', false);
}

function startEdit(card: CreditCardDTO) {
  editingId.value = card.id;
  form.name = card.name;
  form.closingDay = card.closingDay;
  form.dueDay = card.dueDay;
  errorMessage.value = '';
  confirmingDelete.value = null;
}

const isDay = (value: number | '') =>
  Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 31;

async function save() {
  errorMessage.value = '';
  const name = form.name.trim();
  if (!name || !isDay(form.closingDay) || !isDay(form.dueDay)) {
    errorMessage.value =
      'Informe o nome e os dias de fechamento e vencimento (1 a 31).';
    return;
  }

  const payload = {
    name,
    closingDay: Number(form.closingDay),
    dueDay: Number(form.dueDay),
  };

  busy.value = true;
  try {
    if (editingId.value) {
      await service.update(editingId.value, payload);
      toast.success('Cartão atualizado!');
    } else {
      await service.create(payload);
      toast.success('Cartão cadastrado!');
    }
    resetForm();
    emit('changed');
  } catch (err) {
    toast.fromError(err, 'Erro ao salvar o cartão.');
  } finally {
    busy.value = false;
  }
}

async function removeCard(card: CreditCardDTO) {
  if (confirmingDelete.value !== card.id) {
    confirmingDelete.value = card.id;
    return;
  }

  busy.value = true;
  try {
    await service.remove(card.id);
    toast.success('Cartão excluído.');
    if (editingId.value === card.id) resetForm();
    emit('changed');
  } catch (err) {
    toast.fromError(err, 'Erro ao excluir o cartão.');
  } finally {
    busy.value = false;
    confirmingDelete.value = null;
  }
}
</script>
