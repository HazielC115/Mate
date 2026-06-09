<script setup lang="ts">
const emit = defineEmits<{
  select: [expr: string]
}>()

interface Example {
  label: string
  expr: string
  category: string
}

const examples: Example[] = [
  { label: 'x²', expr: 'x^2', category: 'Polinomio' },
  { label: '3x² + 2x - 1', expr: '3*x^2 + 2*x - 1', category: 'Polinomio' },
  { label: 'x³', expr: 'x^3', category: 'Polinomio' },
  { label: 'sin(x)', expr: 'sin(x)', category: 'Trigonométrica' },
  { label: 'cos(x)', expr: 'cos(x)', category: 'Trigonométrica' },
  { label: 'tan(x)', expr: 'tan(x)', category: 'Trigonométrica' },
  { label: 'eˣ', expr: 'e^x', category: 'Exponencial' },
  { label: '1/x', expr: '1/x', category: 'Logarítmica' },
  { label: '5·sin(x)', expr: '5*sin(x)', category: 'Constante × f' },
  { label: 'x⁴ - x²', expr: 'x^4 - x^2', category: 'Polinomio' },
]

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Polinomio': 'chip-blue',
    'Trigonométrica': 'chip-purple',
    'Exponencial': 'chip-emerald',
    'Logarítmica': 'chip-amber',
    'Constante × f': 'chip-rose',
  }
  return colors[category] || 'chip-blue'
}
</script>

<template>
  <div class="glass-card p-6 animate-fade-in-up" style="animation-delay: 0.5s">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-5">
      <div class="icon-container">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div>
        <h2 class="text-lg font-semibold text-text-primary">Ejemplos</h2>
        <p class="text-xs text-text-muted">Haz clic para probar</p>
      </div>
    </div>

    <!-- Chips -->
    <div class="chips-grid">
      <button
        v-for="(example, index) in examples"
        :key="index"
        :id="`example-chip-${index}`"
        class="chip"
        :class="getCategoryColor(example.category)"
        :style="{ animationDelay: `${0.6 + index * 0.05}s` }"
        @click="emit('select', example.expr)"
      >
        <span class="chip-category">{{ example.category }}</span>
        <span class="chip-label">{{ example.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.icon-container {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent-primary);
}

.chips-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-dark-700);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards;
  font-family: 'Inter', sans-serif;
}

.chip:hover {
  transform: translateY(-2px);
}

.chip-category {
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.7;
}

.chip-label {
  font-size: 0.9rem;
  font-weight: 600;
  font-family: 'Inter', monospace;
}

/* Color variants */
.chip-blue {
  border-color: rgba(99, 102, 241, 0.2);
  color: #818cf8;
}
.chip-blue:hover {
  background: rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.15);
}

.chip-purple {
  border-color: rgba(168, 85, 247, 0.2);
  color: #c084fc;
}
.chip-purple:hover {
  background: rgba(168, 85, 247, 0.12);
  border-color: rgba(168, 85, 247, 0.4);
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.15);
}

.chip-emerald {
  border-color: rgba(52, 211, 153, 0.2);
  color: #6ee7b7;
}
.chip-emerald:hover {
  background: rgba(52, 211, 153, 0.12);
  border-color: rgba(52, 211, 153, 0.4);
  box-shadow: 0 4px 20px rgba(52, 211, 153, 0.15);
}

.chip-amber {
  border-color: rgba(251, 191, 36, 0.2);
  color: #fcd34d;
}
.chip-amber:hover {
  background: rgba(251, 191, 36, 0.12);
  border-color: rgba(251, 191, 36, 0.4);
  box-shadow: 0 4px 20px rgba(251, 191, 36, 0.15);
}

.chip-rose {
  border-color: rgba(251, 113, 133, 0.2);
  color: #fda4af;
}
.chip-rose:hover {
  background: rgba(251, 113, 133, 0.12);
  border-color: rgba(251, 113, 133, 0.4);
  box-shadow: 0 4px 20px rgba(251, 113, 133, 0.15);
}
</style>
