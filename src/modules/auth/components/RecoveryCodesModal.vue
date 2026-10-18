<template>
  <Modal
    :model-value="modelValue"
    title="Códigos de recuperação"
    size="sm"
    @update:model-value="close"
  >
    <RecoveryCodesList
      v-if="codes"
      :codes="codes"
      confirm-label="Concluir"
      @confirm="close"
    />

    <form v-else @submit.prevent="generate" class="space-y-4">
      <p class="text-sm text-ink-soft">
        Os códigos permitem redefinir sua senha caso você a esqueça.
        <template v-if="remaining !== null">
          Você tem
          <strong :class="remaining <= 2 ? 'text-negative' : 'text-ink'">
            {{ remaining }} {{ remaining === 1 ? 'código' : 'códigos' }}
          </strong>
          {{ remaining === 1 ? 'disponível' : 'disponíveis' }}.
        </template>
      </p>

      <p class="text-sm text-ink-muted">
        Gerar novos códigos invalida todos os anteriores. Confirme sua senha
        para continuar.
      </p>

      <div>
        <label
          for="recovery-password"
          class="block text-sm font-medium text-ink-soft"
          >Senha atual</label
        >
        <input
          v-model="password"
          type="password"
          id="recovery-password"
          autocomplete="current-password"
          placeholder="••••••••"
          required
          class="w-full mt-1 px-4 py-3 bg-field border border-line-strong text-ink rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div class="flex justify-end gap-2">
        <button
          type="button"
          @click="close"
          class="h-9 cursor-pointer rounded-lg border border-line-strong px-4 text-sm text-ink-soft hover:bg-hover transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="loading || !password"
          class="h-9 cursor-pointer rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-500 transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ loading ? 'Gerando...' : 'Gerar novos códigos' }}
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Modal from '../../../components/ui/Modal.vue';
import RecoveryCodesList from './RecoveryCodesList.vue';
import { AuthService } from '../services/authService';
import { getToken } from '../../../shared/auth/session';
import { useToast } from '../../../composables/useToast';

defineProps<{ modelValue: boolean; remaining: number | null }>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  generated: [remaining: number];
}>();

const authService = new AuthService();
const toast = useToast();
const password = ref('');
const loading = ref(false);
const codes = ref<string[] | null>(null);

async function generate() {
  loading.value = true;
  try {
    const result = await authService.generateRecoveryCodes(
      getToken(),
      password.value,
    );
    codes.value = result.recoveryCodes;
    password.value = '';
    emit('generated', result.recoveryCodes.length);
  } catch (err: any) {
    toast.fromError(err, 'Erro ao gerar códigos.');
  } finally {
    loading.value = false;
  }
}

function close() {
  // Os códigos não ficam guardados no front: ao fechar, somem da tela
  codes.value = null;
  password.value = '';
  emit('update:modelValue', false);
}
</script>
