<template>
  <ApexChart
    type="donut"
    height="300"
    :options="options"
    :series="slices.map(slice => slice.value)"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import ApexChart from 'vue3-apexcharts';
import { useTheme } from '../../../composables/useTheme';
import { formatCurrency } from '../../../shared/utils/format';
import { mixColors, readableTextColor } from '../../../shared/utils/color';
import { CHART_PALETTE, OTHERS_COLOR } from '../utils/chartPalette';
import type { ChartSlice } from '../utils/summarizeMonth';

const props = defineProps<{ slices: ChartSlice[]; total: number }>();

const { isDark } = useTheme();
const palette = computed(() =>
  isDark.value ? CHART_PALETTE.dark : CHART_PALETTE.light,
);

const selected = ref<number[]>([]);

watch(
  () => props.slices,
  () => (selected.value = []),
);

function toggle(index: number) {
  selected.value = selected.value.includes(index)
    ? selected.value.filter(i => i !== index)
    : [...selected.value, index];
}

const isDimmed = (index: number) =>
  selected.value.length > 0 && !selected.value.includes(index);

const colors = computed(() =>
  props.slices.map((slice, index) => {
    const color = slice.isOthers ? OTHERS_COLOR : palette.value.colors[index]!;
    return isDimmed(index) ? mixColors(color, palette.value.card, 0.25) : color;
  }),
);

const center = computed(() => {
  const count = selected.value.length;
  if (count === 0) return { label: 'Total', value: props.total };
  return {
    label:
      count === 1
        ? props.slices[selected.value[0]!]!.name
        : `${count} categorias`,
    value: selected.value.reduce((sum, i) => sum + props.slices[i]!.value, 0),
  };
});

const options = computed(() => ({
  labels: props.slices.map(slice => slice.name),
  colors: colors.value,
  chart: {
    background: 'transparent',
    events: {
      dataPointSelection: (
        _e: unknown,
        _c: unknown,
        config: { dataPointIndex: number },
      ) => toggle(config.dataPointIndex),
      legendClick: (_c: unknown, index: number) => toggle(index),
    },
  },
  theme: { mode: isDark.value ? 'dark' : 'light' },
  states: { active: { filter: { type: 'none' } } },
  stroke: { width: 2, colors: [palette.value.card] },
  legend: {
    position: 'bottom',
    onItemClick: { toggleDataSeries: false },
    labels: {
      colors: props.slices.map((_, i) =>
        isDimmed(i) ? palette.value.muted : palette.value.text,
      ),
    },
    markers: { strokeWidth: 0 },
  },
  tooltip: { y: { formatter: formatCurrency } },
  dataLabels: {
    formatter: (value: number, opts: { seriesIndex: number }) =>
      isDimmed(opts.seriesIndex) ? '' : `${Math.round(value)}%`,
    style: {
      fontSize: '13px',
      fontWeight: 600,
      colors: colors.value.map(readableTextColor),
    },
    dropShadow: { enabled: false },
  },
  plotOptions: {
    pie: {
      expandOnClick: false,
      dataLabels: { minAngleToShowLabel: 12 },
      donut: {
        size: '58%',
        labels: {
          show: true,
          value: {
            color: palette.value.ink,
            formatter: (v: string) => formatCurrency(Number(v)),
          },
          total: {
            show: true,
            showAlways: selected.value.length > 0,
            label: center.value.label,
            color: palette.value.muted,
            formatter: () => formatCurrency(center.value.value),
          },
        },
      },
    },
  },
}));
</script>
