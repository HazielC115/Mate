<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js'
import { generatePoints, generateAreaPoints } from '@/utils/integralEngine'
import type { Point } from '@/utils/integralEngine'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
)

const props = defineProps<{
  expression: string
  isDefinite: boolean
  lowerBound: number
  upperBound: number
  hasResult: boolean
}>()

const chartKey = ref(0)

const plotRange = computed(() => {
  if (props.isDefinite) {
    const margin = Math.max(Math.abs(props.upperBound - props.lowerBound) * 0.5, 2)
    return { min: props.lowerBound - margin, max: props.upperBound + margin }
  }
  return { min: -10, max: 10 }
})

const functionPoints = computed<Point[]>(() => {
  if (!props.expression || !props.hasResult) return []
  return generatePoints(props.expression, plotRange.value.min, plotRange.value.max, 600)
})

const areaPoints = computed<Point[]>(() => {
  if (!props.expression || !props.isDefinite || !props.hasResult) return []
  return generateAreaPoints(props.expression, props.lowerBound, props.upperBound, 300)
})

const chartData = computed(() => {
  const datasets: any[] = []

  if (areaPoints.value.length > 0) {
    datasets.push({
      label: 'Área',
      data: areaPoints.value.map((p) => ({ x: p.x, y: isFinite(p.y) ? p.y : null })),
      borderColor: 'rgba(139, 92, 246, 0.5)',
      backgroundColor: 'rgba(99, 102, 241, 0.12)',
      fill: 'origin',
      borderWidth: 0,
      pointRadius: 0,
      tension: 0.3,
      order: 2,
    })
  }

  if (functionPoints.value.length > 0) {
    datasets.push({
      label: 'f(x)',
      data: functionPoints.value.map((p) => ({ x: p.x, y: isFinite(p.y) ? p.y : null })),
      borderColor: '#6366f1',
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHoverBackgroundColor: '#818cf8',
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 1.5,
      tension: 0.3,
      spanGaps: false,
      order: 1,
    })
  }

  return { datasets }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 400 },
  interaction: { mode: 'nearest' as const, intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(18, 18, 26, 0.95)',
      titleColor: '#e2e8f0',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(99, 102, 241, 0.25)',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 10,
      displayColors: false,
      callbacks: {
        title: (items: any) => (items.length > 0 ? `x = ${items[0].parsed.x.toFixed(4)}` : ''),
        label: (item: any) => `f(x) = ${item.parsed.y.toFixed(4)}`,
      },
    },
  },
  scales: {
    x: {
      type: 'linear' as const,
      position: 'center' as const,
      grid: { color: 'rgba(255,255,255,0.04)', drawTicks: false },
      border: { color: 'rgba(255,255,255,0.1)', width: 1 },
      ticks: {
        color: '#64748b',
        font: { size: 11, family: 'Inter' },
        maxTicksLimit: 12,
        padding: 8,
      },
    },
    y: {
      type: 'linear' as const,
      position: 'center' as const,
      grid: { color: 'rgba(255,255,255,0.04)', drawTicks: false },
      border: { color: 'rgba(255,255,255,0.1)', width: 1 },
      ticks: {
        color: '#64748b',
        font: { size: 11, family: 'Inter' },
        maxTicksLimit: 10,
        padding: 8,
      },
      suggestedMin: -5,
      suggestedMax: 5,
    },
  },
}))

watch(
  () => [props.expression, props.isDefinite, props.lowerBound, props.upperBound, props.hasResult],
  () => {
    chartKey.value++
  },
)
</script>

<template>
  <div class="glass-card p-6">
    <!-- Header -->
    <div class="flex items-center gap-2.5 mb-4">
      <div
        class="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(99,102,241,0.1)] text-accent-primary"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline
            points="22,12 18,12 15,21 9,3 6,12 2,12"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <h2 class="text-base font-semibold text-text-primary">Gráfica</h2>
    </div>

    <!-- Chart -->
    <div
      v-if="hasResult && functionPoints.length > 0"
      class="relative h-[340px] max-[768px]:h-[260px] p-2 rounded-xl bg-dark-700 border border-border"
    >
      <Line :key="chartKey" :data="chartData" :options="chartOptions" />
    </div>

    <!-- Placeholder -->
    <div
      v-else
      class="h-[340px] max-[768px]:h-[260px] flex flex-col items-center justify-center gap-4 rounded-xl bg-dark-700 border border-dashed border-border"
    >
      <div
        class="w-16 h-16 rounded-full flex items-center justify-center bg-surface text-text-muted"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          opacity="0.5"
        >
          <polyline
            points="22,12 18,12 15,21 9,3 6,12 2,12"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <p class="text-text-muted text-sm text-center px-6">
        Ingresa una función y calcula la integral para ver la gráfica
      </p>
    </div>
  </div>
</template>
