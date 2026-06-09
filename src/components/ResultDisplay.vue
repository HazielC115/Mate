<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { IntegralResult } from '@/utils/integralEngine'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const props = defineProps<{
  result: IntegralResult | null
}>()

const integralEl = ref<HTMLElement | null>(null)
const resultEl = ref<HTMLElement | null>(null)
const show = ref(false)

function renderKatex() {
  if (!props.result) return
  nextTick(() => {
    if (integralEl.value && props.result?.integralLatex) {
      katex.render(props.result.integralLatex, integralEl.value, {
        throwOnError: false,
        displayMode: true,
      })
    }
    if (resultEl.value && props.result?.resultLatex) {
      katex.render(props.result.resultLatex, resultEl.value, {
        throwOnError: false,
        displayMode: true,
      })
    }
  })
}

watch(
  () => props.result,
  (newResult) => {
    if (newResult) {
      show.value = false
      setTimeout(() => {
        show.value = true
        renderKatex()
      }, 50)
    }
  },
  { deep: true },
)
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
  >
    <div v-if="result && show" class="glass-card p-6 relative overflow-hidden">
      <!-- Header -->
      <div class="flex items-center gap-2.5 mb-5">
        <div
          class="w-9 h-9 rounded-lg flex items-center justify-center"
          :class="result.success ? 'bg-success/12 text-success' : 'bg-error/12 text-error'"
        >
          <svg
            v-if="result.success"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <svg
            v-else
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <h2 class="text-base font-semibold text-text-primary">Resultado</h2>
      </div>

      <!-- Integral expression -->
      <div class="px-4 py-3 rounded-xl bg-dark-700 border border-border mb-3">
        <span
          class="block text-[0.7rem] font-semibold uppercase tracking-widest text-text-muted mb-2"
          >Integral</span
        >
        <div ref="integralEl" class="overflow-x-auto py-0.5"></div>
      </div>

      <!-- Divider -->
      <div class="h-px bg-border mb-3"></div>

      <!-- Result -->
      <div
        class="px-4 py-3 rounded-xl bg-dark-700 border border-border"
        :class="{ 'error-result': !result.success }"
      >
        <span
          class="block text-[0.7rem] font-semibold uppercase tracking-widest text-text-muted mb-2"
        >
          {{ result.success ? 'Antiderivada' : 'Estado' }}
        </span>
        <div ref="resultEl" class="overflow-x-auto py-0.5 result-value"></div>
      </div>

      <!-- Numeric value -->
      <div
        v-if="result.numericValue !== undefined && result.success"
        class="flex items-center justify-between px-4 py-3 mt-3 rounded-xl border border-[rgba(99,102,241,0.2)] bg-[rgba(99,102,241,0.06)]"
      >
        <span class="text-sm text-text-secondary font-medium">Valor numérico</span>
        <span class="text-base font-bold text-accent-glow font-mono">
          ≈ {{ result.numericValue.toFixed(6) }}
        </span>
      </div>

      <!-- Error message -->
      <div
        v-if="result.error"
        class="flex items-center gap-2 px-3 py-2.5 mt-3 rounded-lg border border-error/20 bg-error/7 text-error text-sm"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {{ result.error }}
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* KaTeX color overrides — cannot be done with Tailwind */
.result-value :deep(.katex) {
  color: var(--color-accent-glow) !important;
}
.error-result :deep(.katex) {
  color: var(--color-error) !important;
  font-size: 1em !important;
}
</style>
