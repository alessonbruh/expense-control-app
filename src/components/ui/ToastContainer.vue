<template>
  <div
    class="fixed top-4 right-4 left-4 sm:left-auto z-[60] flex flex-col gap-2 sm:w-80"
    aria-live="polite"
  >
    <TransitionGroup
      enter-from-class="opacity-0 translate-x-4"
      leave-to-class="opacity-0 translate-x-4"
      enter-active-class="transition duration-200"
      leave-active-class="transition duration-200"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="typeClass[toast.type]"
        class="flex items-start gap-3 rounded-lg border bg-slate-900 px-4 py-3 text-sm text-slate-100 shadow-lg"
        role="status"
      >
        <span class="mt-0.5 font-bold">{{ typeIcon[toast.type] }}</span>
        <p class="flex-1">{{ toast.message }}</p>
        <button
          @click="dismiss(toast.id)"
          aria-label="Fechar"
          class="text-slate-400 hover:text-slate-100"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToast, type ToastType } from '../../composables/useToast';

const { toasts, dismiss } = useToast();

const typeClass: Record<ToastType, string> = {
  success: 'border-emerald-500/50 [&>span]:text-emerald-400',
  error: 'border-red-500/50 [&>span]:text-red-400',
  info: 'border-sky-500/50 [&>span]:text-sky-400',
};

const typeIcon: Record<ToastType, string> = {
  success: '✓',
  error: '!',
  info: 'i',
};
</script>
