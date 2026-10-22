<template>
  <Modal
    :model-value="modelValue"
    title="Orçamento mensal"
    size="sm"
    @update:model-value="close"
  >
    <form @submit.prevent="save" class="space-y-4">
      <p class="text-sm text-ink-muted">
        Defina um limite mensal para as categorias que quiser acompanhar. Deixe
        em branco para não ter limite.
      </p>

      <p v-if="loadingCategories" class="py-6 text-center text-ink-muted">
        Carregando categorias...
      </p>

      <div v-else class="space-y-2">
        <label
          v-for="category in categories"
          :key="category.id"
          class="flex items-center justify-between gap-3"
        >
          <span class="text-sm text-ink-soft">{{ category.name }}</span>
          <span class="relative w-40 shrink-0">
            <span
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted"
              >R$</span
            >
            <input
              v-model="limits[category.id]"
              type="number"
              min="0"
              step="0.01"
              inputmode="decimal"
              placeholder="Sem limite"
              class="w-full rounded-lg border border-line-strong bg-field py-2 pl-9 pr-3 text-right text-sm text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </span>
        </label>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button
          type="button"
          @click="close"
          class="h-9 cursor-pointer rounded-lg border border-line-strong px-4 text-sm text-ink-soft hover:bg-hover transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="saving || loadingCategories"
          class="h-9 cursor-pointer rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-500 transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ saving ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Modal from '../../../components/ui/Modal.vue';
import { CategoryService } from '../../category/services/categoryService';
import type { CategoryResponseDTO } from '../../category/dtos/CategoryResponseDTO';
import { BudgetService } from '../../budget/services/budgetService';
import type { BudgetDTO } from '../../budget/dto/BudgetDTO';
import { getToken } from '../../../shared/auth/session';
import { useToast } from '../../../composables/useToast';

const props = defineProps<{ modelValue: boolean; budgets: BudgetDTO[] }>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  saved: [];
}>();

const categoryService = new CategoryService();
const budgetService = new BudgetService();
const toast = useToast();

const categories = ref<CategoryResponseDTO[]>([]);
const limits = ref<Record<string, number | ''>>({});
const loadingCategories = ref(false);
const saving = ref(false);

function currentLimit(categoryId: string): number {
  const budget = props.budgets.find(item => item.categoryId === categoryId);
  return budget ? Number(budget.amount) : 0;
}

function typedLimit(categoryId: string): number {
  return Math.round(Number(limits.value[categoryId] || 0) * 100) / 100;
}

async function loadCategories() {
  if (categories.value.length) return;
  loadingCategories.value = true;
  try {
    const all = await categoryService.listCategory(getToken());
    categories.value = all.filter(category => category.type === 'expense');
  } catch (err) {
    toast.fromError(err, 'Erro ao carregar as categorias.');
  } finally {
    loadingCategories.value = false;
  }
}

watch(
  () => props.modelValue,
  async open => {
    if (!open) return;
    await loadCategories();
    limits.value = Object.fromEntries(
      categories.value.map(category => [
        category.id,
        currentLimit(category.id) || '',
      ]),
    );
  },
);

function close() {
  emit('update:modelValue', false);
}

async function save() {
  saving.value = true;
  try {
    const changed = categories.value.filter(
      category => typedLimit(category.id) !== currentLimit(category.id),
    );

    await Promise.all(
      changed.map(category => {
        const limit = typedLimit(category.id);
        return limit > 0
          ? budgetService.save(category.id, limit)
          : budgetService.remove(category.id);
      }),
    );
    toast.success('Orçamento salvo!');
    emit('saved');
    close();
  } catch (err) {
    toast.fromError(err, 'Erro ao salvar o orçamento.');
  } finally {
    saving.value = false;
  }
}
</script>
