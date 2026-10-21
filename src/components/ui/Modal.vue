<template>
  <teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        class="fixed inset-0 bg-black/50"
        @click="close"
        aria-hidden="true"
      ></div>

      <div
        :class="modalSizeClass"
        class="relative bg-card border border-line text-ink rounded-xl p-6 mx-4 z-50 shadow-xl"
      >
        <header class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-ink">
            {{ title }}
          </h3>
          <button
            @click="close"
            aria-label="Fechar"
            class="text-ink-muted hover:text-ink"
          >
            ✕
          </button>
        </header>

        <div class="overflow-auto max-h-[70vh]">
          <slot />
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import {
  computed,
  defineProps,
  defineEmits,
  onMounted,
  onUnmounted,
  watch,
} from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: '' },
  size: { type: String, default: 'md' }, // 'sm' | 'md' | 'lg'
});
const emit = defineEmits(['update:modelValue', 'close']);

const modalSizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-full max-w-md';
    case 'lg':
      return 'w-full max-w-3xl';
    default:
      return 'w-full max-w-xl';
  }
});

function close() {
  emit('update:modelValue', false);
  emit('close');
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close();
}

watch(
  () => props.modelValue,
  v => {
    if (v) document.body.classList.add('overflow-hidden');
    else document.body.classList.remove('overflow-hidden');
  },
);

onMounted(() => document.addEventListener('keydown', onKeydown));
onUnmounted(() => document.removeEventListener('keydown', onKeydown));
</script>
