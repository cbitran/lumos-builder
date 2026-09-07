<script setup lang="ts">
/**
 * SLIDER DE ESCALA — arrasta livre, mas solta sempre num breakpoint real.
 * O ímã aqui é o mesmo princípio do palco: o valor contínuo existe só durante o
 * arrasto; o que fica gravado é sempre uma das cinco escalas do DS. Assim não há
 * como parar num 1123 que não significa nada.
 */
import { computed, ref } from 'vue'
import { BREAKPOINTS, type Breakpoint } from './types'

const props = defineProps<{ breakpoint: Breakpoint; auto: boolean }>()
const emit = defineEmits<{ pick: [Breakpoint]; auto: [] }>()

// Da mais estreita à mais larga: o slider anda da esquerda para a direita.
const STOPS = [...BREAKPOINTS].sort((a, b) => a - b)
const MIN = STOPS[0]
const MAX = STOPS[STOPS.length - 1]

/** Valor contínuo enquanto a mão está no controle; null quando não está. */
const dragging = ref<number | null>(null)

/** Escala mais próxima — é ela que o ímã escolhe. */
function nearest(value: number): Breakpoint {
  return STOPS.reduce((best, s) => (Math.abs(s - value) < Math.abs(best - value) ? s : best), STOPS[0])
}

const shown = computed(() => dragging.value ?? props.breakpoint)
/** Posição em % — os stops não são equidistantes, então a régua é proporcional. */
const percent = (v: number) => ((v - MIN) / (MAX - MIN)) * 100

function onInput(e: Event) {
  dragging.value = Number((e.target as HTMLInputElement).value)
}

/** Ao soltar, o ímã puxa para o breakpoint mais próximo. */
function onCommit() {
  if (dragging.value !== null) emit('pick', nearest(dragging.value))
  dragging.value = null
}
</script>

<template>
  <div class="flex items-center gap-3">
    <button
      class="rounded-md px-2 py-1 text-sm"
      :class="auto ? 'bg-primary text-inverted' : 'border border-default text-highlighted hover:border-primary'"
      title="A escala segue a largura da janela"
      @click="emit('auto')"
    >
      Auto
    </button>

    <div class="relative w-64 pt-1">
      <input
        type="range"
        :min="MIN"
        :max="MAX"
        step="1"
        :value="shown"
        class="w-full accent-primary"
        @input="onInput"
        @change="onCommit"
        @pointerup="onCommit"
        @keyup="onCommit"
      />

      <!-- Marcas das escalas reais, na posição proporcional de cada uma. -->
      <div class="pointer-events-none absolute inset-x-0 top-0 h-1">
        <span
          v-for="s in STOPS"
          :key="s"
          class="absolute top-0 h-2 w-px"
          :class="s === breakpoint ? 'bg-primary' : 'bg-accented'"
          :style="{ left: percent(s) + '%' }"
        />
      </div>

      <div class="relative mt-1 h-4">
        <button
          v-for="s in STOPS"
          :key="s"
          class="absolute -translate-x-1/2 text-[10px] tabular-nums transition-colors"
          :class="s === breakpoint ? 'font-semibold text-primary' : 'text-dimmed hover:text-highlighted'"
          :style="{ left: percent(s) + '%' }"
          @click="emit('pick', s)"
        >
          {{ s }}
        </button>
      </div>
    </div>

    <span class="w-24 text-xs tabular-nums text-muted">
      <template v-if="dragging !== null">
        {{ dragging }} → <span class="text-primary">{{ nearest(dragging) }}</span>
      </template>
      <template v-else>
        {{ breakpoint }}px{{ auto ? ' · janela' : '' }}
      </template>
    </span>
  </div>
</template>
