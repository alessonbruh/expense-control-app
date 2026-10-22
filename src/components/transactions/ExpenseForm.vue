<template>
  <form @submit.prevent="save" class="space-y-5">
    <!-- Tipo + Valor -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block mb-1.5 text-sm font-medium text-ink-soft">
          Tipo
        </label>

        <select
          v-model="form.type"
          class="w-full bg-field border border-line-strong text-ink rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="income">Receita</option>
          <option value="expense">Despesa</option>
        </select>
      </div>

      <div>
        <label class="block mb-1.5 text-sm font-medium text-ink-soft">
          Valor
        </label>

        <input
          v-model="form.amount"
          type="number"
          step="0.01"
          placeholder="0,00"
          class="w-full bg-field border border-line-strong text-ink rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>
    </div>

    <div>
      <label class="block mb-1.5 text-sm font-medium text-ink-soft">
        Forma de pagamento
      </label>

      <select
        v-model="form.paymentMethod"
        class="w-full bg-field border border-line-strong text-ink rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      >
        <option :value="null" disabled>Selecione uma forma de pagamento</option>
        <option
          v-for="method in paymentMethods"
          :key="method.value"
          :value="method.value"
        >
          {{ method.label }}
        </option>
      </select>
    </div>
    <Transition name="expand">
      <div v-if="isCreditCard">
        <label class="block mb-1.5 text-sm font-medium text-ink-soft">
          Parcelas
        </label>

        <select
          v-model="form.installments"
          class="w-full bg-field border border-line-strong text-ink rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option v-for="number in 12" :key="number" :value="number">
            {{ number }}x
          </option>
        </select>

        <Transition name="fade">
          <p v-if="installmentsPreview" class="text-sm text-ink-muted mt-2">
            {{ installmentsPreview }}
          </p>
        </Transition>
      </div>
    </Transition>
    <div>
      <label class="block mb-1.5 text-sm font-medium text-ink-soft">
        Categoria
      </label>

      <select
        v-model="form.categoryId"
        :disabled="loadingCategories"
        class="w-full bg-field border border-line-strong text-ink rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
      >
        <option value="" disabled>
          {{
            loadingCategories
              ? 'Carregando categorias...'
              : filteredCategories.length
                ? 'Selecione uma categoria'
                : 'Nenhuma categoria deste tipo'
          }}
        </option>

        <option
          v-for="category in filteredCategories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.name }}
        </option>
      </select>
    </div>

    <div>
      <label class="block mb-1.5 text-sm font-medium text-ink-soft">
        {{ form.installments > 1 ? 'Vencimento da 1ª parcela' : 'Vencimento' }}
      </label>

      <input
        v-model="form.firstDueDate"
        type="date"
        class="w-full bg-field border border-line-strong text-ink rounded-lg px-3 py-2.5 pr-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      />
    </div>

    <div>
      <label class="block mb-1.5 text-sm font-medium text-ink-soft"> </label>

      <input
        v-model="form.description"
        placeholder="Descrição (opcional)"
        class="w-full bg-field border border-line-strong text-ink rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      />
    </div>

    <Transition name="expand">
      <p v-if="errorMessage" class="text-sm text-negative">
        {{ errorMessage }}
      </p>
    </Transition>

    <!-- Botões -->
    <div class="flex justify-end gap-3 pt-2">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 rounded-lg border border-line-strong text-ink-soft hover:bg-hover transition"
      >
        Cancelar
      </button>

      <button
        :disabled="saving"
        type="submit"
        class="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="!saving">Salvar</span>
        <span v-else>Salvando...</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import type {
  ExpenseDTO,
  CreateExpensePayload,
  UpdateExpensePayload,
} from '../../modules/expense/dto/ExpenseDTO';
import { useTransactions } from '../../composables/useTransactions';
import { CategoryService } from '../../modules/category/services/categoryService';
import type { CategoryResponseDTO } from '../../modules/category/dtos/CategoryResponseDTO';
import { ExpenseService } from '../../modules/expense/services/ExpenseService';
import { useToast } from '../../composables/useToast';
import { getToken } from '../../shared/auth/session';
import {
  PaymentMethod,
  paymentMethodLabels,
} from '../../shared/enums/payment-method';
import { toDateInput } from '../../shared/utils/date';
import { formatCurrency } from '../../shared/utils/format';

const categoryService = new CategoryService();
const expenseService = new ExpenseService();
const props = defineProps<{ initial?: Partial<ExpenseDTO> }>();
const token = getToken();
const categories = ref<CategoryResponseDTO[]>([]);
const paymentMethods = Object.values(PaymentMethod).map(method => ({
  value: method,
  label: paymentMethodLabels[method],
}));
const emit = defineEmits<{
  (e: 'saved', data: ExpenseDTO): void;
  (e: 'cancel'): void;
}>();

const isEditing = computed(() => !!props.initial?.id);

const form = reactive({
  type: (props.initial?.category?.type ?? 'expense') as 'income' | 'expense',
  categoryId: props.initial?.categoryId ?? props.initial?.category?.id ?? '',
  amount: props.initial?.amount ?? '',
  paymentMethod: (props.initial?.paymentMethod ?? null) as PaymentMethod | null,
  installments: 1,
  firstDueDate: toDateInput(new Date()),
  description: props.initial?.description ?? '',
});

// Valores originais, para enviar no PUT apenas o que mudou
// (alterar valor, parcelas ou vencimento faz a API recriar as parcelas).
const original = ref<typeof form | null>(null);

function fillFromExpense(expense: ExpenseDTO) {
  const first = expense.installments.find(i => i.installmentNum === 1);
  form.type = expense.category.type ?? form.type;
  form.categoryId = expense.categoryId;
  form.amount = Number(expense.amount);
  form.paymentMethod = expense.paymentMethod;
  form.installments = first?.totalInstallments ?? 1;
  form.firstDueDate = first
    ? first.dueDate.split('T')[0]!
    : toDateInput(new Date());
  form.description = expense.description;
  original.value = { ...form };
}

const saving = ref(false);
const loadingCategories = ref(true);
const errorMessage = ref('');
const toast = useToast();
const { createTransaction, updateTransaction } = useTransactions();

onMounted(async () => {
  try {
    categories.value = await categoryService.listCategory(token);

    // Se for edição, busca o lançamento completo (com todas as parcelas)
    if (props.initial?.id) {
      const expense = await expenseService.findById(props.initial.id, token);
      fillFromExpense(expense);
    }
  } catch (err: any) {
    console.error(err);
    toast.fromError(err, 'Erro ao carregar dados do formulário.');
  } finally {
    loadingCategories.value = false;
  }
});

const filteredCategories = computed(() =>
  categories.value.filter(category => category.type === form.type),
);

watch(
  () => form.type,
  () => {
    const stillValid = filteredCategories.value.some(
      category => category.id === form.categoryId,
    );
    if (!stillValid) form.categoryId = '';
  },
);

const isCreditCard = computed(() => {
  return form.paymentMethod === PaymentMethod.CARD;
});

// Parcelamento só existe no cartão
watch(isCreditCard, value => {
  if (!value) form.installments = 1;
});

// Mesma divisão da API: os centavos que sobram vão para as primeiras parcelas
const installmentsPreview = computed(() => {
  const amount = Number(form.amount);
  const total = form.installments;
  if (!amount || amount <= 0 || total <= 1) return '';

  const totalCents = Math.round(amount * 100);
  const baseCents = Math.floor(totalCents / total);
  const remainder = totalCents - baseCents * total;

  if (remainder === 0) return `${total}x de ${formatCurrency(baseCents / 100)}`;

  return (
    `${remainder}x de ${formatCurrency((baseCents + 1) / 100)} + ` +
    `${total - remainder}x de ${formatCurrency(baseCents / 100)}`
  );
});

function buildUpdatePayload(id: string): UpdateExpensePayload {
  const payload: UpdateExpensePayload = { id };
  const before = original.value;
  const amount = Number(form.amount);

  if (form.description !== before?.description)
    payload.description = form.description;
  if (form.categoryId !== before?.categoryId)
    payload.categoryId = form.categoryId;
  if (form.paymentMethod && form.paymentMethod !== before?.paymentMethod)
    payload.paymentMethod = form.paymentMethod;
  if (amount !== Number(before?.amount)) payload.amount = amount;
  if (form.installments !== before?.installments)
    payload.installments = form.installments;
  if (form.firstDueDate !== before?.firstDueDate)
    payload.firstDueDate = form.firstDueDate;

  return payload;
}

async function save() {
  errorMessage.value = '';
  if (!form.categoryId || !form.amount || !form.paymentMethod) {
    errorMessage.value = 'Preencha valor, forma de pagamento e categoria.';
    return;
  }

  saving.value = true;
  try {
    let saved: ExpenseDTO;
    if (isEditing.value && props.initial?.id) {
      saved = await updateTransaction(buildUpdatePayload(props.initial.id));
    } else {
      const payload: CreateExpensePayload = {
        categoryId: form.categoryId,
        amount: Number(form.amount),
        description: form.description,
        installments: form.installments,
        paymentMethod: form.paymentMethod,
        firstDueDate: form.firstDueDate,
      };
      saved = await createTransaction(payload);
    }
    toast.success(
      isEditing.value
        ? 'Lançamento atualizado com sucesso!'
        : 'Lançamento criado com sucesso!',
    );
    emit('saved', saved); // Dashboard vai receber e atualizar UI
  } catch (err: any) {
    console.error(err);
    toast.fromError(err, 'Erro ao salvar lançamento.');
  } finally {
    saving.value = false;
  }
}
</script>
