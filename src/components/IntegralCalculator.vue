<script setup lang="ts">
import { ref } from 'vue'
import FunctionInput from './FunctionInput.vue'
import ResultDisplay from './ResultDisplay.vue'
import IntegralChart from './IntegralChart.vue'
import ExampleChips from './ExampleChips.vue'
import { solveIndefinite, solveDefinite } from '@/utils/integralEngine'
import type { IntegralResult } from '@/utils/integralEngine'

const expression = ref('')
const isDefinite = ref(false)
const lowerBound = ref(0)
const upperBound = ref(1)
const result = ref<IntegralResult | null>(null)
const hasResult = ref(false)

function calculate() {
  if (!expression.value.trim()) return
  result.value = isDefinite.value
    ? solveDefinite(expression.value, lowerBound.value, upperBound.value)
    : solveIndefinite(expression.value)
  hasResult.value = true
}

function selectExample(expr: string) {
  expression.value = expr
  result.value = isDefinite.value
    ? solveDefinite(expr, lowerBound.value, upperBound.value)
    : solveIndefinite(expr)
  hasResult.value = true
}
</script>

<template>
  <div class="min-h-screen max-w-[1280px] mx-auto px-5 py-6 flex flex-col gap-6">
    <!-- Header -->
    <header class="flex items-center justify-between px-1">
      <div>
        <h2 class="text-text font-bold text-2xl">Calculadora de Integrales</h2>
        <h4 class="font-[Lexend] italic">by RutaPay&copy;</h4>
      </div>
    </header>

    <!-- Main Grid -->
    <main class="grid grid-cols-2 gap-6 flex-1 max-[900px]:grid-cols-1">
      <!-- Left: Input + Examples -->
      <div class="flex flex-col gap-6">
        <FunctionInput
          v-model="expression"
          v-model:is-definite="isDefinite"
          v-model:lower-bound="lowerBound"
          v-model:upper-bound="upperBound"
          @calculate="calculate"
        />
        <ExampleChips @select="selectExample" />
      </div>

      <!-- Right: Result + Chart -->
      <div class="flex flex-col gap-6">
        <ResultDisplay :result="result" />
        <IntegralChart
          :expression="expression"
          :is-definite="isDefinite"
          :lower-bound="lowerBound"
          :upper-bound="upperBound"
          :has-result="hasResult"
        />
      </div>
    </main>
    <footer class="border-t border-gray-600">
      <p class="text-center text-gray-600 py-2">
        Calculadora de Integrales · un proyecto de RutaPay&copy; 2026
      </p>
    </footer>
  </div>
</template>
