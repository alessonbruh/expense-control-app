<template>
  <div class="space-y-4">
    <div
      class="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-ink-soft"
      role="note"
    >
      <p class="font-medium text-ink">Guarde estes códigos agora.</p>
      <p class="mt-1">
        Eles são a única forma de redefinir sua senha se você esquecê-la e
        <strong>não serão exibidos novamente</strong>. Cada código funciona uma
        única vez. Salve num gerenciador de senhas ou imprima.
      </p>
    </div>

    <ul
      class="grid grid-cols-1 gap-2 rounded-lg border border-line bg-field p-4 font-mono text-sm text-ink sm:grid-cols-2"
      aria-label="Códigos de recuperação"
    >
      <li v-for="code in codes" :key="code" class="select-all tracking-wider">
        {{ code }}
      </li>
    </ul>

    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        @click="copyCodes"
        class="inline-flex h-9 cursor-pointer items-center rounded-lg border border-line-strong bg-card px-3 text-sm font-medium text-ink-soft hover:bg-hover hover:text-ink transition"
      >
        {{ copied ? 'Copiado!' : 'Copiar' }}
      </button>
      <button
        type="button"
        @click="downloadCodes"
        class="inline-flex h-9 cursor-pointer items-center rounded-lg border border-line-strong bg-card px-3 text-sm font-medium text-ink-soft hover:bg-hover hover:text-ink transition"
      >
        Baixar .txt
      </button>
    </div>

    <label class="flex items-start gap-2 text-sm text-ink-soft">
      <input
        v-model="saved"
        type="checkbox"
        class="mt-0.5 h-4 w-4 accent-emerald-500"
      />
      Guardei meus códigos em um lugar seguro.
    </label>

    <button
      type="button"
      :disabled="!saved"
      @click="emit('confirm')"
      class="w-full cursor-pointer rounded-lg bg-emerald-600 py-3 font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {{ confirmLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useToast } from '../../../composables/useToast';

const props = withDefaults(
  defineProps<{ codes: string[]; confirmLabel?: string }>(),
  { confirmLabel: 'Continuar' },
);
const emit = defineEmits<{ confirm: [] }>();

const toast = useToast();
const saved = ref(false);
const copied = ref(false);

function codesAsText() {
  return [
    'Expense Control - códigos de recuperação de senha',
    `Gerados em ${new Date().toLocaleString('pt-BR')}`,
    'Cada código funciona uma única vez.',
    '',
    ...props.codes,
  ].join('\n');
}

async function copyCodes() {
  try {
    await navigator.clipboard.writeText(props.codes.join('\n'));
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    toast.error('Não foi possível copiar. Selecione os códigos manualmente.');
  }
}

function downloadCodes() {
  const blob = new Blob([codesAsText()], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'expense-control-codigos-recuperacao.txt';
  link.click();
  URL.revokeObjectURL(url);
}
</script>
