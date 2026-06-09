<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  modelValue: string
  isDefinite: boolean
  lowerBound: number
  upperBound: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:isDefinite': [value: boolean]
  'update:lowerBound': [value: number]
  'update:upperBound': [value: number]
  calculate: []
}>()

const isFocused = ref(false)

const functionValue = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val),
})

const definiteMode = computed({
  get: () => props.isDefinite,
  set: (val: boolean) => emit('update:isDefinite', val),
})

const lower = computed({
  get: () => props.lowerBound,
  set: (val: number) => emit('update:lowerBound', val),
})

const upper = computed({
  get: () => props.upperBound,
  set: (val: number) => emit('update:upperBound', val),
})

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') emit('calculate')
}
</script>

<template>
  <div class="glass-card p-6">
    <!-- Section heading -->
    <div class="flex items-center gap-2.5 mb-5">
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
          <path d="M12 5v14M5 12h14" stroke-linecap="round" />
        </svg>
      </div>
      <h2 class="text-base font-semibold text-text-primary">Función f(x)</h2>
    </div>

    <!-- Function input row -->
    <div class="mb-4">
      <div
        class="flex items-center rounded-xl px-4 border transition-colors duration-150"
        :class="isFocused ? 'border-accent-primary bg-dark-700' : 'border-border bg-dark-700'"
      >
        <span class="text-accent-glow font-semibold text-base mr-2 whitespace-nowrap font-mono"
          >f(x) =</span
        >
        <input
          id="function-input"
          v-model="functionValue"
          type="text"
          class="flex-1 bg-transparent border-none outline-none text-text-primary text-base font-mono py-3 placeholder:text-text-muted"
          placeholder="ej: x^2 + 3*x - 1"
          autocomplete="off"
          spellcheck="false"
          @focus="isFocused = true"
          @blur="isFocused = false"
          @keydown="handleKeydown"
        />
      </div>
      <p class="text-xs text-text-muted mt-1.5 ml-1">
        Usa: x^n, sin(x), cos(x), tan(x), e^x, log(x), sqrt(x), pi
      </p>
    </div>

    <!-- Integral type toggle -->
    <div class="mb-4">
      <label class="text-sm text-text-secondary mb-2 block font-medium">Tipo de integral</label>
      <div class="flex gap-2 p-1 rounded-xl bg-dark-700 border border-border">
        <button
          id="btn-indefinite"
          class="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer"
          :class="
            !definiteMode
              ? 'bg-accent-primary text-white'
              : 'text-text-secondary hover:text-text-primary'
          "
          @click="definiteMode = false"
        >
          <span class="text-base font-bold">∫</span> Indefinida
        </button>
        <button
          id="btn-definite"
          class="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer"
          :class="
            definiteMode
              ? 'bg-accent-primary text-white'
              : 'text-text-secondary hover:text-text-primary'
          "
          @click="definiteMode = true"
        >
          <span class="text-base font-bold">∫ᵃᵇ</span> Definida
        </button>
      </div>
    </div>

    <!-- Bounds (definite only) -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="definiteMode" class="grid grid-cols-2 gap-3 mb-4 overflow-hidden">
        <div>
          <label for="lower-bound" class="text-xs text-text-muted mb-1.5 block"
            >Límite inferior (a)</label
          >
          <input
            id="lower-bound"
            v-model.number="lower"
            type="number"
            class="input-field text-center"
            step="0.1"
          />
        </div>
        <div>
          <label for="upper-bound" class="text-xs text-text-muted mb-1.5 block"
            >Límite superior (b)</label
          >
          <input
            id="upper-bound"
            v-model.number="upper"
            type="number"
            class="input-field text-center"
            step="0.1"
          />
        </div>
      </div>
    </Transition>

    <!-- Calculate button -->
    <button
      id="btn-calculate"
      class="btn-primary w-full flex items-center justify-center gap-2"
      @click="$emit('calculate')"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
      >
        <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      Calcular Integral
    </button>
  </div>
</template>
