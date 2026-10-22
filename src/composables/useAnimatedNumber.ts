import { onBeforeUnmount, ref, watch, type Ref } from 'vue';

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Acompanha `source` animando do valor anterior até o novo. */
export function useAnimatedNumber(source: Ref<number>, duration = 600) {
  const display = ref(source.value);
  let frame = 0;

  watch(source, target => {
    cancelAnimationFrame(frame);
    const from = display.value;
    if (prefersReducedMotion() || from === target) {
      display.value = target;
      return;
    }

    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3; // desacelera no fim
      display.value = from + (target - from) * eased;
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  });

  onBeforeUnmount(() => cancelAnimationFrame(frame));

  return display;
}
